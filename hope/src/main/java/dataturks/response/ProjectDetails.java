package dataturks.response;

import dataturks.DTypes;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ProjectDetails {
    public String id;
    public String name;
    public String subtitle;
    public String orgId;
    public String orgName;
    public boolean hasSubscriptionExpired = false;

    public DTypes.Project_Access_Type access_type;
    public DTypes.Project_Visibility_Type visibility_type;
    public DTypes.Project_Task_Type task_type;
    private String taskRules;

    private long totalHits;
    private long totalHitsDone;
    private long totalHitsSkipped;
    private long totalHitsDeleted;


    private long totalEvaluationCorrect;
    private long totalEvaluationInCorrect;

    private String description;

    private String shortDescription;

    private java.util.Date created_timestamp;

    private List<ContributorDetails> contributorDetails;

    // Possible permissions for the user context this project object is being sent.
    // not sure if this is a right place to add this.
    private UserProjectPermissions permissions;

    public ProjectDetails(){}

    public ProjectDetails(String id, String name) {
        this();
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public boolean isHasSubscriptionExpired() {
        return hasSubscriptionExpired;
    }

    public void setHasSubscriptionExpired(boolean hasSubscriptionExpired) {
        this.hasSubscriptionExpired = hasSubscriptionExpired;
    }

    public DTypes.Project_Access_Type getAccess_type() {
        return access_type;
    }

    public void setAccess_type(DTypes.Project_Access_Type access_type) {
        this.access_type = access_type;
    }

    public DTypes.Project_Visibility_Type getVisibility_type() {
        return visibility_type;
    }

    public void setVisibility_type(DTypes.Project_Visibility_Type visibility_type) {
        this.visibility_type = visibility_type;
    }

    public DTypes.Project_Task_Type getTask_type() {
        return task_type;
    }

    public void setTask_type(DTypes.Project_Task_Type task_type) {
        this.task_type = task_type;
    }

    public String getTaskRules() {
        return taskRules;
    }

    public void setTaskRules(String taskRules) {
        this.taskRules = taskRules;
    }

    public long getTotalHits() {
        return totalHits;
    }

    public void setTotalHits(long totalHits) {
        this.totalHits = totalHits;
    }

    public long getTotalHitsDone() {
        return totalHitsDone;
    }

    public void setTotalHitsDone(long totalHitsDone) {
        this.totalHitsDone = totalHitsDone;
    }

    public long getTotalHitsSkipped() {
        return totalHitsSkipped;
    }

    public void setTotalHitsSkipped(long totalHitsSkipped) {
        this.totalHitsSkipped = totalHitsSkipped;
    }

    public long getTotalHitsDeleted() {
        return totalHitsDeleted;
    }

    public void setTotalHitsDeleted(long totalHitsDeleted) {
        this.totalHitsDeleted = totalHitsDeleted;
    }

    public long getTotalEvaluationCorrect() {
        return totalEvaluationCorrect;
    }

    public void setTotalEvaluationCorrect(long totalEvaluationCorrect) {
        this.totalEvaluationCorrect = totalEvaluationCorrect;
    }

    public long getTotalEvaluationInCorrect() {
        return totalEvaluationInCorrect;
    }

    public void setTotalEvaluationInCorrect(long totalEvaluationInCorrect) {
        this.totalEvaluationInCorrect = totalEvaluationInCorrect;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public Date getCreated_timestamp() {
        return created_timestamp;
    }

    public void setCreated_timestamp(Date created_timestamp) {
        this.created_timestamp = created_timestamp;
    }

    public List<ContributorDetails> getContributorDetails() {
        return contributorDetails;
    }

    public void setContributorDetails(List<ContributorDetails> contributorDetails) {
        this.contributorDetails = contributorDetails;
    }
    public void addContributorDetails(ContributorDetails contributorDetails) {
        if (this.contributorDetails == null) this.contributorDetails = new ArrayList<>();
        this.contributorDetails.add(contributorDetails);
    }

    public UserProjectPermissions getPermissions() {
        return permissions;
    }

    public void setPermissions(UserProjectPermissions permissions) {
        this.permissions = permissions;
    }
}
