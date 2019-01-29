package dataturks.response;

import bonsai.dropwizard.dao.d.DHits;
import bonsai.dropwizard.dao.d.DHitsResult;
import bonsai.dropwizard.dao.d.DProjects;
import dataturks.DTypes;
import dataturks.DUtils;

import java.util.ArrayList;
import java.util.List;

public class GetHits {
    public ProjectDetails projectDetails;
    public List<SingleHit> hits;

    public GetHits() {
        this.hits = new ArrayList<>();
    }
    public void addRelevantProjectDetails(DProjects project) {
        if (project != null) {
            this.projectDetails = new ProjectDetails(project.getId(), project.getName());
            projectDetails.setTask_type(project.getTaskType());
            projectDetails.setAccess_type(project.getAccessType());
            projectDetails.setTaskRules(project.getTaskRules());
        }
    }

    public void addSigleHit(DHits hit, List<DHitsResult> results) {
        if (hit != null) {
            SingleHit singleHit = new SingleHit(hit.getId(), hit.getData(), hit.getExtras());
            singleHit.setURL(hit.isURL());
            singleHit.setStatus(hit.getStatus());
            if (DUtils.isProjectWithURLs(projectDetails) || hit.isURL() ) {
                singleHit.setFileName(DUtils.getURLFilename(hit));
            }
            singleHit.setEvaluation(getHitEvaluationDisplay(hit));
            singleHit.addHitResults(results);
            this.hits.add(singleHit);

        }
    }

    //only return a valid display value.
    private static String getHitEvaluationDisplay(DHits hit) {
        if (hit != null) {
            if (DTypes.HIT_Evaluation_Type.NONE != hit.getEvaluationType()) {
                return hit.getEvaluationType().toString();
            }
        }
        return null;
    }

}
