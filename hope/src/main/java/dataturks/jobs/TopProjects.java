package dataturks.jobs;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DProjects;
import bonsai.dropwizard.dao.d.DProjectsDAO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dataturks.*;
import dataturks.response.OrgProjects;
import dataturks.response.ProjectDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

//A heavy operation which calculates top projects, updates their description and returns.
public class TopProjects {

    private static Logger LOG = LoggerFactory.getLogger(TopProjects.class);

    public static OrgProjects getAllTopProjects() {

        OrgProjects orgProjects = new OrgProjects(DBBasedConfigs.getConfig("dTrendingOrgName", String.class, "trending"));
        orgProjects.setOrgId(DBBasedConfigs.getConfig("dTrendingOrgId", String.class, DConstants.TRENDING_ORG_ID));

        List<String> topProjectIds = getAllTopProjectIds();
        DProjectsDAO projectsDAO = AppConfig.getInstance().getdProjectsDAO();
        for (String projectId : topProjectIds) {
            try {
                DProjects project = projectsDAO.findByIdInternal(projectId);

                if (project == null) continue;

                //not public
                if (Validations.isPaidPlanProject(project)) {
                    continue;
                }


                ProjectDetails details = Controlcenter.getProjectSummary(project);

                details.setSubtitle(project.getSubtitle());

                //update description (also save to DB)
                autoUpdateProjectDesc(project, details);
                //use the updated description.
                details.setDescription(project.getDescription());
                details.setShortDescription(project.getShortDescription());


                orgProjects.addProject(details);
            }
            catch (Exception e) {
                LOG.error("Error for project id " + projectId + " " + e.toString());
            }
        }

        DUtils.sortProjectsByHitsDone(orgProjects.getProjects(), false);
        return orgProjects;

    }

    //update the description of the project and also save the same to db.
    private static void autoUpdateProjectDesc(DProjects project, ProjectDetails details) {
        if (project.getDescription() == null ||
                DConstants.PROJECT_STATUS_AUTO_UPDATED.equalsIgnoreCase(project.getStatus())) {

            //generate desc/short desc.
            String taskType = project.getTaskType().toString().toLowerCase().replaceAll("_", " ");
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            List<String> labels = new ArrayList<>();
            try {
                JsonNode node = mapper.readTree(project.getTaskRules());
                if (node.has("tags")) {
                    String str = node.get("tags").asText("");
                    labels = Arrays.asList(str.split(","));
                }
            }
            catch (Exception e) {
                LOG.error("Mapping task rules for " + project.getId() +  " " + e.toString());
            }

            String shortDesc = "A";

            if (project.getTaskType() == DTypes.Project_Task_Type.IMAGE_BOUNDING_BOX ||
                    project.getTaskType() == DTypes.Project_Task_Type.IMAGE_POLYGON_BOUNDING_BOX ||
                    project.getTaskType() == DTypes.Project_Task_Type.IMAGE_POLYGON_BOUNDING_BOX_V2 ||
                    project.getTaskType() == DTypes.Project_Task_Type.IMAGE_CLASSIFICATION) {
                shortDesc = "An";
            }

            shortDesc += " " + taskType + " dataset with "  + labels.size() + " classes.";

            StringBuilder sb = new StringBuilder();
            sb.append("<div>");
            sb.append("<h2>").append(shortDesc).append("</h2>");
            sb.append("<p>").append("The dataset has ").append(details.getTotalHits()).append(" items of which ").append(
                    details.getTotalHitsDone()).append(" items have been manually labeled.").append("</p>");

            sb.append("<p class=\"marginTop\"> The labels are divided into following ").append(labels.size()).append(" categories:");

            sb.append("<ul class=\"bulleted list\">");
            for (String label : labels) {
                sb.append("<li>").append(label).append("</li>");
            }
            sb.append("</ul>");

            sb.append("</p>");

            sb.append("<div class=\"marginTop\">").append("<p>Key Features</p>");
            sb.append("<ul class=\"bulleted list\">");
            sb.append("<li>").append(details.getTotalHits()).append( " items").append("</li>");
            sb.append("<li>").append(labels.size()).append( " categories").append("</li>");
            sb.append("<li>").append( "Human labeled dataset").append("</li>");
            sb.append("</ul>");
            sb.append("</div>");


            sb.append("</div>");

            String longDesc = sb.toString();

            project.setShortDescription(shortDesc);
            project.setDescription(longDesc);

            //save to db.
            project.setStatus(DConstants.PROJECT_STATUS_AUTO_UPDATED);
            AppConfig.getInstance().getdProjectsDAO().saveOrUpdateInternal(project);
        }
    }

    public static List<String> getAllTopProjectIds() {
        List<String> topProjects = new ArrayList<>();
        Map<String, Long> projectCounts =  AppConfig.getInstance().getdHitsResultDAO().getProjectResultCountsInternal();
        int countThreshold = DBBasedConfigs.getConfig("dtTopProjectCountThreshold", Integer.class, 50);

        for (String projectId : projectCounts.keySet()) {
            if (projectCounts.get(projectId) >= countThreshold) {
                topProjects.add(projectId);
            }
        }
        return topProjects;
    }
}
