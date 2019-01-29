package dataturks.jobs;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.DBConfigEntry;
import bonsai.dropwizard.dao.d.*;
import bonsai.email.ScheduledEmails;
import dataturks.*;
import dataturks.license.LicenseHandler;
import dataturks.response.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class LabelCounts {

    private static Logger LOG = LoggerFactory.getLogger(LabelCounts.class);
    private ScheduledExecutorService executorService;

    private static LabelCounts instance = new LabelCounts();

    private LabelCounts(){
        resetSchedule();
    }

    public static LabelCounts getInstance() {
        return instance;
    }

    public void calculate() {
        try {
            long statTimeMillis = System.currentTimeMillis();
            LOG.info("Starting label count calculations...");
            //only touch projects on which a hit was added in the last windowSec. Don't scan the DB too often.
            int windowInSec = 60*DBBasedConfigs.getConfig("dLabelCounterWindowInMints", Integer.class,  60*24*10);
            // find all projectIds updated in the last window.
            List<String> projectIds = AppConfig.getInstance().getdHitsResultDAO().getProjectsWithRecentHitResultsInternal(windowInSec);

            //find orgs in the above projects.
            Set<String> orgIds = new HashSet<>();
            DProjectsDAO projectsDAO = AppConfig.getInstance().getdProjectsDAO();

            //for each projectID calculate labels.
            for (String projectId : projectIds) {
                DProjects project = projectsDAO.findByIdInternal(projectId);
                if (project == null) continue;
                orgIds.add(project.getOrgId());
                calculateAndSetLabelsForProject(project);
            }

            // calculate the labels for each org.
            DOrgsDAO orgsDAO = AppConfig.getInstance().getdOrgsDAO();
            for (String orgId : orgIds) {
                DOrgs org = orgsDAO.findByIdInternal(orgId);
                calculateAndSetLabelsForOrg(org);
            }



            long endTimeMillis = System.currentTimeMillis();
            LOG.info("Label count calculations done...time taken (s) = " + (endTimeMillis-statTimeMillis)/1000);

            //for on prem mode, verify if license expired?
            if (DUtils.isOnPremMode()) {
                markIfLicenseExpired();
            }

            resetSchedule();
        }
        catch (Exception e) {
            LOG.error("Error " + e.toString());
            e.printStackTrace();
            resetSchedule();
        }

    }

    private static void markIfLicenseExpired() {
        if (!DUtils.isLicenseActive() ) {
            LicenseHandler.markLicenseExpired();
        }
    }

    private static void calculateAndSetLabelsForOrg(DOrgs org) {
        if (org == null) return;
        try {
            long labelsCount = 0;
            List<DProjects> projects = AppConfig.getInstance().getdProjectsDAO().findByOrgIdInternalIncludingDeleted(org.getId());
            for (DProjects project : projects) {
                labelsCount += project.getLabelsDone();
            }
            DSubscriptions subscription = AppConfig.getInstance().getdSubscriptionsDAO().findByOrgIdInternal(org.getId());
            subscription.setLabelsDone(labelsCount);
            AppConfig.getInstance().getdSubscriptionsDAO().saveOrUpdateInternal(subscription);
        }
        catch (Exception e) {
            LOG.error(" For org id= " + org.getId() + " Error = " + e.toString());
            e.printStackTrace();
        }
    }

    private static void calculateAndSetLabelsForProject(DProjects project) {
        try {
            if (project == null) return;
            //do not update the count, since we may choose to delete all data for the project but preserve the old stats.
            if (Validations.isDeleted(project)) {
                return;
            }

            long labels = getLabelCountsForProject(project);
            project.setLabelsDone(labels);
            AppConfig.getInstance().getdProjectsDAO().saveOrUpdateInternal(project);
        }
        catch (Exception e) {
            LOG.error(" For project id= " + project.getId() + " Error = " + e.toString());
            e.printStackTrace();
        }
    }

    private static long getLabelCountsForProject(DProjects project) {

        DReqObj reqObj = new DReqObj(DConstants.NON_LOGGED_IN_USER_ID);
        ProjectStats stats = Controlcenter.getProjectStatsForHITStatus(reqObj, project, Arrays.asList(new String[] {DConstants.HIT_STATUS_DONE}));
        long count = 0;
        if (stats != null) {
            if (stats.getPosTaggingStats() != null || stats.getDocumentTaggingStats() != null) {
                POSTaggingStats projectStats = stats.getPosTaggingStats() != null?
                                                stats.getPosTaggingStats(): stats.getDocumentTaggingStats();

                Map<String, POSTaggingStats.LabelStat> labelStatMap = projectStats.getPerLabelStat();
                for (POSTaggingStats.LabelStat labelStat : labelStatMap.values()) {
                    count += labelStat.getCount();
                }
            }
            else if (stats.getImageBoundingBoxStats() != null || stats.getImageClassificationStats() != null) {
                ImageClassificationStats projectStats = stats.getImageBoundingBoxStats() != null?
                        stats.getImageBoundingBoxStats(): stats.getImageClassificationStats();

                List<ImageClassificationStats.LabelStat> labelStats = projectStats.getLaeblStats();
                for (ImageClassificationStats.LabelStat labelStat : labelStats) {
                    count += labelStat.getCount();
                }

            }
            else if (stats.getTextClassificationStats() != null) {
                TextClassificationStats projectStats = stats.getTextClassificationStats();

                Map<String, TextClassificationStats.ClassificationLabelStat> labelStats = projectStats.getLabelCounts();
                for (TextClassificationStats.ClassificationLabelStat labelStat : labelStats.values()) {
                    count += labelStat.getCount();
                }

            }
            else if (stats.getTextSummarizationStats() != null) {
                ProjectDetails details = Controlcenter.getProjectSummary(project);
                count += details.getTotalHitsDone();
            }

        }
        return count;
    }

    private void resetSchedule() {

        int intervalInSec = DBBasedConfigs.getConfig("dLabelCounterIntervalInSecs", Integer.class, 60*60);

        LOG.info("Rescheduling label counter work for " + intervalInSec + " secs.");
        if (executorService != null) executorService.shutdownNow();
        // schedule is such that it runs one more time and then we recreate the executor anyway
        // specifiy the next run time (make sure the subsequent interval is never executed).
        executorService = Executors.newSingleThreadScheduledExecutor();
        executorService.scheduleWithFixedDelay(new Runnable() {
            @Override
            public void run() {
                calculate();
            }
        }, intervalInSec, intervalInSec*200, TimeUnit.SECONDS);
    }


    public static void main(String[] args) {
        LabelCounts.getInstance().calculate();
    }
}
