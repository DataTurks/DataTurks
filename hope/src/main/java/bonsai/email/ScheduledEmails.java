package bonsai.email;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.*;
import bonsai.sa.Events;
import bonsai.sa.EventsLogger;
import dataturks.Controlcenter;
import dataturks.DReqObj;
import dataturks.DTypes;
import dataturks.Validations;
import dataturks.drip.DripFlows;
import dataturks.response.ProjectDetails;
import dataturks.response.UserHome;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import sun.rmi.runtime.Log;

import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

//based on a schedule do an email sending task.
//after 1 hrs of first signup, if no hits uploaded tagged, send a mail
public class ScheduledEmails {

    private static final Logger LOG = LoggerFactory.getLogger(ScheduledEmails.class);

    private static long ONE_DAY_MILISEC = 24*60*60*1000;

    private static volatile Date lastRunDate;

    private ScheduledExecutorService executorService;

    private static ScheduledEmails instance = new ScheduledEmails();

    private ScheduledEmails(){
        lastRunDate = new Date();
        resetSchedule();
    }

    public static ScheduledEmails getInstance() {
        return instance;
    }

    private void doScheduledWork() {
        try{
            //sendFeedbackEmail();
            setupDripFlows();
        }
        catch (Exception e) {
            LOG.error("Error = " + e.toString());
        }
        lastRunDate = new Date();
        resetSchedule();
    }

    private void setupDripFlows() {
        if (DBBasedConfigs.getConfig("dDripFlowsStatus", Boolean.class, false)) {
            LOG.info("Running drip flows for the interval..last date value = " + lastRunDate.toString());
            setupInvitedDripFlow();
            setupSignInDripFlow();
            setupHitsDoneDripFlow();
            handlePaidUsersDripFlow();
            setupProjectIncompleteDripFlow();
        }
        else {
            sendFeedbackEmail();
        }
    }

    // note: we have send an invite mail the moment the user was added.
    //flow to people who have been invited to do contribute in last interval hrs.
    // Logic: Add: All invited in the last interval.
    private void setupInvitedDripFlow() {
        // all the entries created in invite in the last interval.
        List<DProjectInvites> invites = AppConfig.getInstance().getdProjectInvitesDAO().findAllInternal();
        if (invites == null || invites.isEmpty()) return;
        List<DProjectInvites> newInvites = new ArrayList<>();
        for (DProjectInvites invite : invites) {
            if (invite.getCreated_timestamp().after(lastRunDate)) {
                newInvites.add(invite);
            }
        }
        LOG.info("setupInvitedDripFlow newInvites =  " + newInvites.size());
        if (newInvites.isEmpty()) return;

        DripFlows.addToProjectInviteFlow(newInvites);
    }

    // Flow movement for people who have signedin in the last interval.
    // Logic: Remove from invite if in invite table.
    //        Remove from ProjectIncompleteDripFlow
    //       Add to signup flow.
    private void setupSignInDripFlow() {
        List<DUsers> users = AppConfig.getInstance().getdUsersDAO().findAllInternal();
        if (users == null || users.isEmpty()) return;

        LOG.info("setupSignInDripFlow total users =  " + users.size());

        // anyone who logged-in even 1 hr before the last run time.
        Date recentEnoughLoginTime = new Date(lastRunDate.getTime() - 60*60*1000);
        List<DUsers> recentlyLoggedInUsers = usersLoggedInPostDate(users, recentEnoughLoginTime);
        DripFlows.removeFromProjectInviteFlow(recentlyLoggedInUsers);
        DripFlows.removeFromProjectIncompleteFlow(recentlyLoggedInUsers);


        List<DUsers> recentlyCreatedUsers = usersCreatedPostDate(users, lastRunDate);

        LOG.info("setupSignInDripFlow recentlyCreatedUsers =  " + recentlyCreatedUsers.size());
        DripFlows.addToSignInFlow(recentlyCreatedUsers);

        LOG.info("setupSignInDripFlow post drip call recentlyCreatedUsers =  " + recentlyCreatedUsers.size());
    }


    private void handlePaidUsersDripFlow() {
        List<DUsers> users = AppConfig.getInstance().getdUsersDAO().findAllInternal();
        if (users == null || users.isEmpty()) return;
        List<DUsers> recentlyCreatedUsers = usersCreatedPostDate(users, lastRunDate);
        List<DUsers> usersWhoRecentlyBecamePaid = new ArrayList<>();
        for (DUsers user: recentlyCreatedUsers) {
            //if any of the user's project belongs to an org with paid plain, remove the user from signup flow.
            List<DProjectUsers> projectUsers = AppConfig.getInstance().getdProjectUsersDAO().findAllByUserIdInternal(user.getId());
            if (projectUsers != null) {
                for (DProjectUsers projectUser : projectUsers) {
                    String projectId = projectUser.getProjectId();
                    if (Validations.isPaidPlanProject(projectId)) {
                        usersWhoRecentlyBecamePaid.add(user);
                        break;
                    }
                }
            }
        }

        LOG.info("handlePaidUsersDripFlow usersWhoRecentlyBecamePaid =  " + usersWhoRecentlyBecamePaid.size());
        DripFlows.removeFromSignInFlow(usersWhoRecentlyBecamePaid);

    }

    // flow for users who have done enough hits, in the last interval their total exceeded some value.
    // Logic: Remove from signup flow.
    //        Add to many hits flow.
    private void setupHitsDoneDripFlow() {
        List<DUsers> users = AppConfig.getInstance().getdUsersDAO().findAllInternal();
        if (users == null || users.isEmpty()) return;

        List<DUsers> usersWhoRecentlyCompletedHits = new ArrayList<>();
        for (DUsers user: users) {
            List<DHitsResult> userHits = AppConfig.getInstance().getdHitsResultDAO().findAllByUserIdInternal(user.getId());

            // people who would have crossed 100 hits in the last run (some might have done a long time back, don't re-add them.
            // Checking when they did the latest hit, if it was in the last interval then they might have
            // crossed 100 in the last interval unless they have been
            // continuosly using and then might already have done more than 500 hits (these might already be in flow in some previous interval).
            if (userHits != null && userHits.size() > 100 && userHits.size() < 500) {
                Date latestHitDone = userHits.get(0).getUpdated_timestamp();
                for (DHitsResult hitsResult : userHits) {
                    if (hitsResult.getUpdated_timestamp().after(latestHitDone)) {
                        latestHitDone = hitsResult.getUpdated_timestamp();
                    }
                }

                if (latestHitDone.after(lastRunDate)) {
                    usersWhoRecentlyCompletedHits.add(user);
                }
            }
        }

        LOG.info("setupHitsDoneDripFlow usersWhoRecentlyCompletedHits =  " + usersWhoRecentlyCompletedHits.size());
        if (usersWhoRecentlyCompletedHits.isEmpty()) return;

        DripFlows.removeFromSignInFlow(usersWhoRecentlyCompletedHits);
        DripFlows.addToManyHitsDownFlow(usersWhoRecentlyCompletedHits);
    }

    //flow for users who contribute to projects but the project is not done much and they did not login recently.
    // in the last interval the time to login has become 2 days.
    //Logic: Add to projectIncompleteFlow
    private void setupProjectIncompleteDripFlow() {
        List<DProjects> projects = AppConfig.getInstance().getdProjectsDAO().findAllInternal();
        if (projects == null || projects.isEmpty()) return;

        // 5 days old project created
        Date recentEnoughProjectAccessed = new Date(lastRunDate.getTime() - 5*ONE_DAY_MILISEC);

        //3 days old login.
        Date recentEnoughLoginTime = new Date(lastRunDate.getTime() - 3*ONE_DAY_MILISEC);

        // one notification per user is enough.
        Map<DUsers, DProjects> userProjectMap = new HashMap<>();
        // find projects which are not complete.
        for (DProjects project : projects) {

            // ignore old projects (accessed older than 5 days), they may be already in the flow.
            if (lastAccessTime(project).before(recentEnoughProjectAccessed)) {
                continue;
            }

            ProjectDetails details  = Controlcenter.getProjectSummary(project);
            long totalDone = details.getTotalHitsDone() + details.getTotalHitsSkipped();
            // if > 70% done, then ignore.
            if (details.getTotalHits() == 0 || (totalDone/(double)details.getTotalHits()) < .70) {
                // Find all the project users.
                List<DProjectUsers> projectUsers = AppConfig.getInstance().getdProjectUsersDAO().findAllByProjectIdInternal(project.getId());
                if (projectUsers == null || projectUsers.isEmpty()) break;

                for (DProjectUsers projectUser : projectUsers) {
                    //not sending to contributors as we add everyone to default projects,
                    // would be sad to send them mail asking them to finish Default projects.
                    if (projectUser.getRole() == DTypes.Project_User_Role.OWNER) {
                        DUsers user = AppConfig.getInstance().getdUsersDAO().findByIdInternal(projectUser.getUserId());
                        //if the user has not logged in anytime soon.
                        if (user != null && user.getUpdated_timestamp().before(recentEnoughLoginTime)) {
                            userProjectMap.put(user, project);
                        }
                    }
                }
            }
        }
        LOG.info("setupProjectIncompleteDripFlow userProjectMap =  " + userProjectMap.size());
        DripFlows.addToProjectIncompleteFlow(userProjectMap);

    }

    private static List<DUsers> usersLoggedInPostDate(List<DUsers> users, Date timeSince) {
        List<DUsers> loggedInSince = new ArrayList<>();
        for (DUsers user : users) {
            if (user.getUpdated_timestamp().after(timeSince)) {
                loggedInSince.add(user);
            }
        }
        return loggedInSince;
    }

    private static List<DUsers> usersCreatedPostDate(List<DUsers> users, Date timeSince) {
        List<DUsers> loggedInSince = new ArrayList<>();
        for (DUsers user : users) {
            if (user.getCreated_timestamp().after(timeSince)) {
                loggedInSince.add(user);
            }
        }
        return loggedInSince;
    }

    private static Date lastAccessTime(DProjects project) {
        List<DHitsResult> hitsResults = AppConfig.getInstance().getdHitsResultDAO().findAllByProjectIdInternal(project.getId());
        Date latestHitDoneTime = new Date(lastRunDate.getTime() - 30*ONE_DAY_MILISEC);
        if (hitsResults != null) {
            for (DHitsResult result : hitsResults) {
                if (result.getUpdated_timestamp().after(latestHitDoneTime)) {
                    latestHitDoneTime = result.getUpdated_timestamp();
                }
            }
        }

        LOG.info("lastAccessTime for project " + project.getId() + " = " + latestHitDoneTime.toString());

        return latestHitDoneTime;
    }


    private void sendFeedbackEmail() {
        if (DBBasedConfigs.getConfig("dScheduledFeedbackEmail", boolean.class, true)) {
            int intervalInSec = DBBasedConfigs.getConfig("dScheduledFeedbackEmailIntervalInSecs", Integer.class, 60*60);
            //fetch all users who logged in the last intervalInSec time.
            List<DUsers> users = AppConfig.getInstance().getdUsersDAO().findAllInternal();
            if (users != null) {
                //signup windows from [-2*interval to -1*interval]
                // the duration is "last mail send timestamp" till "intervalInSec old signups".
                // last window of time which we processed to send mail. We have already send mails to people
                // who signed-up on or before lastWindowEnd.
                Date lastWindowEnd = new Date(lastRunDate.getTime() - intervalInSec * 1000 );
                Date till = new Date(System.currentTimeMillis() - intervalInSec * 1000);


                //may be these users have already replied etc, do not send them a feedback mail.
                // helps prevent spamming folks.
                List<String> noFeedbackEmails = DBBasedConfigs.getConfig("dFeedbackEmailBlacklist", List.class, Collections.emptyList());
                Set<String> blacklisted = new HashSet<>();
                for (String email : noFeedbackEmails) {
                    blacklisted.add(email.trim().toLowerCase());
                    LOG.info("blacklisted feedback email  " + email);
                }


                for (DUsers user : users) {
                    if (user.getCreated_timestamp().after(lastWindowEnd) && user.getCreated_timestamp().before(till)) {
                        if (!isUserActivated(user) && !blacklisted.contains(user.getEmail())) {
                            EmailSender.sendDataturksUserFeedbackEmail(user);
                            LOG.info("Sending feedback email to " + user.getEmail());
                        }
                    }
                }
            }

        }
    }

    //did the user do enough usage of the app?
    private boolean isUserActivated(DUsers user) {
        return isUserWithMoreHits(user, 30);
    }

    private static boolean isUserWithMoreHits(DUsers user, int hitsCount) {
        boolean withMoreHits = false;
        List<DHitsResult> userHits = AppConfig.getInstance().getdHitsResultDAO().findAllByUserIdInternal(user.getId());
        if (userHits != null && userHits.size() > hitsCount) {
            withMoreHits = true;
        }
        return withMoreHits;
    }


    private boolean isIntervalDone(int intervalInSec) {
        int intervalSinceLastRun = (int) ((new Date()).getTime() - lastRunDate.getTime())/1000;
        return (intervalSinceLastRun >= intervalInSec);
    }

    private void resetSchedule() {

        int intervalInSec = DBBasedConfigs.getConfig("dScheduledWorkIntervalInSecs", Integer.class, 60*60);

        LOG.info("Rescheduling work for " + intervalInSec + " secs.");
        if (executorService != null) executorService.shutdownNow();
        // schedule is such that it runs one more time and then we recreate the executor anyway
        // specifiy the next run time (make sure the subsequent interval is never executed).
        executorService = Executors.newSingleThreadScheduledExecutor();
        executorService.scheduleWithFixedDelay(new Runnable() {
            @Override
            public void run() {
                doScheduledWork();
            }
        }, intervalInSec, intervalInSec*200, TimeUnit.SECONDS);
    }

}
