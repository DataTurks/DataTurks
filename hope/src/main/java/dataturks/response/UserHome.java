package dataturks.response;

import dataturks.DTypes;
import dataturks.DUtils;

import java.util.*;

//What we show on a user dashboard.
public class UserHome {
    public String userId;
    public UserDetails userDetails;

    //an user belongs to only one org.
    public String orgId;
    public String orgName;
    public String planName;

    public Long labelsAllowed;
    public Long labelsDone;
    private java.util.Date subscriptionExpiryTimestamp;

    private boolean hasSubscriptionExpired = false;

    public List<UserProjects> projects = new ArrayList<>();

    public UserHome(){}

    public UserHome(String userId) {
        this();
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public UserDetails getUserDetails() {
        return userDetails;
    }

    public void setUserDetails(UserDetails userDetails) {
        this.userDetails = userDetails;
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

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public Long getLabelsAllowed() {
        return labelsAllowed;
    }

    public void setLabelsAllowed(Long labelsAllowed) {
        this.labelsAllowed = labelsAllowed;
    }

    public Long getLabelsDone() {
        return labelsDone;
    }

    public void setLabelsDone(Long labelsDone) {
        this.labelsDone = labelsDone;
    }

    public Date getSubscriptionExpiryTimestamp() {
        return subscriptionExpiryTimestamp;
    }

    public void setSubscriptionExpiryTimestamp(Date subscriptionExpiryTimestamp) {
        this.subscriptionExpiryTimestamp = subscriptionExpiryTimestamp;
    }

    public boolean isHasSubscriptionExpired() {
        return hasSubscriptionExpired;
    }

    public void setHasSubscriptionExpired(boolean hasSubscriptionExpired) {
        this.hasSubscriptionExpired = hasSubscriptionExpired;
    }

    public List<UserProjects> getProjects() {
        return projects;
    }

    public void setProjects(List<UserProjects> projects) {
        this.projects = projects;
    }

    public void addUserProjects(ProjectDetails projectDetails, DTypes.Project_User_Role role, UserProjectPermissions permission) {
        projects.add(new UserProjects(projectDetails, role, permission));

    }


    public void reorderProjects(){
        Collections.sort(getProjects(), new Comparator<UserProjects>() {
            @Override //reverse sorted by date.
            public int compare(UserHome.UserProjects o1, UserHome.UserProjects o2) {
                return o2.getProjectDetails().getCreated_timestamp().compareTo(o1.getProjectDetails().getCreated_timestamp());
            }
        });
    }


    private static class UserProjects {
        public ProjectDetails projectDetails;
        public DTypes.Project_User_Role role;
        public UserProjectPermissions permissions;


        public UserProjects(ProjectDetails projectDetails, DTypes.Project_User_Role role, UserProjectPermissions permission) {
            this.projectDetails = projectDetails;
            this.role = role;
            permissions = permission;
        }

        public UserProjects(ProjectDetails projectDetails, DTypes.Project_User_Role role) {
            this(projectDetails, role, DUtils.getProjectPermissionsForRole(role));
        }


        public ProjectDetails getProjectDetails() {
            return projectDetails;
        }

        public void setProjectDetails(ProjectDetails projectDetails) {
            this.projectDetails = projectDetails;
        }

        public DTypes.Project_User_Role getRole() {
            return role;
        }

        public void setRole(DTypes.Project_User_Role role) {
            this.role = role;
        }

        public UserProjectPermissions getPermissions() {
            return permissions;
        }

        public void setPermissions(UserProjectPermissions permissions) {
            this.permissions = permissions;
        }
    }
}
