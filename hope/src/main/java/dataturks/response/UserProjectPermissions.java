package dataturks.response;

public class UserProjectPermissions {

    //read-all
    private boolean canSeeInsights;
    private boolean canSeeLeaderboard;
    private boolean canSeeCompletedHITs;

    //contributors
    private boolean canCompleteHITs;

    //owners
    private boolean canInviteCollaborators;
    private boolean canDownloadData;
    private boolean canUploadData;
    private boolean canEditProject;
    private boolean canDeleteProject;

    public UserProjectPermissions() {
        canSeeCompletedHITs =true;
        canSeeLeaderboard = true;
        canSeeInsights = true;
        canDownloadData = true;

    }

    public boolean isCanSeeInsights() {
        return canSeeInsights;
    }

    public void setCanSeeInsights(boolean canSeeInsights) {
        this.canSeeInsights = canSeeInsights;
    }

    public boolean isCanSeeLeaderboard() {
        return canSeeLeaderboard;
    }

    public void setCanSeeLeaderboard(boolean canSeeLeaderboard) {
        this.canSeeLeaderboard = canSeeLeaderboard;
    }

    public boolean isCanSeeCompletedHITs() {
        return canSeeCompletedHITs;
    }

    public void setCanSeeCompletedHITs(boolean canSeeCompletedHITs) {
        this.canSeeCompletedHITs = canSeeCompletedHITs;
    }

    public boolean isCanCompleteHITs() {
        return canCompleteHITs;
    }

    public void setCanCompleteHITs(boolean canCompleteHITs) {
        this.canCompleteHITs = canCompleteHITs;
    }

    public boolean isCanInviteCollaborators() {
        return canInviteCollaborators;
    }

    public void setCanInviteCollaborators(boolean canInviteCollaborators) {
        this.canInviteCollaborators = canInviteCollaborators;
    }

    public boolean isCanDownloadData() {
        return canDownloadData;
    }

    public void setCanDownloadData(boolean canDownloadData) {
        this.canDownloadData = canDownloadData;
    }

    public boolean isCanUploadData() {
        return canUploadData;
    }

    public void setCanUploadData(boolean canUploadData) {
        this.canUploadData = canUploadData;
    }

    public boolean isCanEditProject() {
        return canEditProject;
    }

    public void setCanEditProject(boolean canEditProject) {
        this.canEditProject = canEditProject;
    }

    public boolean isCanDeleteProject() {
        return canDeleteProject;
    }

    public void setCanDeleteProject(boolean canDeleteProject) {
        this.canDeleteProject = canDeleteProject;
    }
}
