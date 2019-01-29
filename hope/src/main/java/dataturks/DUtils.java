package dataturks;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;

import bonsai.dropwizard.dao.d.*;
import bonsai.dropwizard.resources.DataturksEndpoint;
import dataturks.aws.S3Handler;
import dataturks.cache.CacheWrapper;
import dataturks.license.LicenseHandler;
import dataturks.response.ProjectDetails;
import dataturks.response.UserProjectPermissions;
import org.apache.commons.collections4.comparators.ReverseComparator;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.util.*;

public class DUtils {
    private static final Logger LOG = LoggerFactory.getLogger(DUtils.class);

    public static String createUniqOrgName(DUsers user) {
        String emailName = getNameFromEmailString(user.getEmail());
        DOrgsDAO dao = AppConfig.getInstance().getdOrgsDAO();
        int count = 0;
        DOrgs org = null;
        while (count++ < 10) {
            org = dao.findByNameInternal(emailName);
            //found an available name.
            if (org == null) {
                break;
            }
            emailName = emailName + count;
        }

        //even after 10 tries couldn't find, something must be wrong.
        if (org != null) emailName = null;

        return emailName;
    }




    public static DProjects getProjectByOrgName(String orgName, String name) {
        DOrgs orgs = AppConfig.getInstance().getdOrgsDAO().findByNameInternal(orgName);
        String orgId = null;
        if (orgs != null) {
            orgId = orgs.getId();
        }
        if (orgId == null) return null;

        return getProject(orgId, name);
    }

    public static DProjects getProject(String orgId, String name) {
        return AppConfig.getInstance().getdProjectsDAO().findByOrgIdAndNameInternal(orgId, name);
    }

    public static String getNonLoggedInUserId() {
        String id = DBBasedConfigs.getConfig("nonLoggedInUserId", String.class, DConstants.NON_LOGGED_IN_USER_ID);
        return id;
    }

    public static boolean isNonLoggedInUser(DReqObj reqObj) {
        if (reqObj == null) return false;
        return (getNonLoggedInUserId().equalsIgnoreCase(reqObj.getUid()));
    }

    public static boolean isLoggedInUser(DReqObj reqObj) {
        return !(getNonLoggedInUserId().equalsIgnoreCase(reqObj.getUid()));
    }

    public static boolean isTrendingOrg(String orgId) {
        return DBBasedConfigs.getConfig("dTrendingOrgId", String.class, DConstants.TRENDING_ORG_ID).equalsIgnoreCase(orgId);
    }

    public static UserProjectPermissions getProjectPermissionsForRole(DTypes.Project_User_Role role) {
        UserProjectPermissions permissions = new UserProjectPermissions();
        if (role == DTypes.Project_User_Role.CONTRIBUTOR) {
            addContributorPermissions(permissions);
        }
        else if (role == DTypes.Project_User_Role.OWNER) {
            addOwnerPermissions(permissions);
        }
        return permissions;
    }

    private static void addContributorPermissions(UserProjectPermissions permissions){
        permissions.setCanCompleteHITs(true);
        permissions.setCanInviteCollaborators(false);
    }

    private static void addOwnerPermissions(UserProjectPermissions permissions){
        addContributorPermissions(permissions);
        permissions.setCanUploadData(true);
        permissions.setCanEditProject(true);
        permissions.setCanInviteCollaborators(true);
    }

    public static String getNameFromEmailString(String email) {
        String emailName = "user";
        try {
            if (email != null) {
                String[] parts = email.split("@");
                if (parts.length == 2 && !parts[0].isEmpty()) {
                    emailName = parts[0].trim();
                }
            }
        }
        catch (Exception e) {
            LOG.error("getNameFromEmailString Error: " + e.toString());
        }

        return emailName;
    }

    //first try the client specific config, if not present then try the plan specific config, else fallback to default global config
    public static void setConfigForOrg(DReqObj reqObj) {
        DOrgConfigs orgConfigs = getConfigForOrg(reqObj.getOrgId());
        reqObj.setConfigs(orgConfigs);
    }

    public static DOrgConfigs getConfigForOrg(String orgId) {
        DOrgConfigs orgConfigs = null;

        try {
            DSubscriptions subscriptions = AppConfig.getInstance().getdSubscriptionsDAO().findByOrgIdInternal(orgId);
            if (subscriptions != null) {
                String config = subscriptions.getConfig();
                // try the plan config.
                if (config == null || config.isEmpty()) {
                    DSubscriptionPlans plan = AppConfig.getInstance().getdSubscriptionPlansDAO().findByIdInternal(subscriptions.getPlanId());
                    if (plan != null) {
                        config = plan.getConfig();
                    }
                }
                if (config != null) {
                    orgConfigs = DOrgConfigs.getConfig(config);
                }
            }
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }


        if (orgConfigs == null) {
            orgConfigs = DOrgConfigs.getDefault();
        }
        return orgConfigs;
    }

    //projects with latest create time first.
    public static void sortProjectsByDate(List<ProjectDetails> projects, boolean asc) {

        Comparator<ProjectDetails>  comparator = new Comparator<ProjectDetails>() {
            @Override //reverse sorted by date.
            public int compare(ProjectDetails o1, ProjectDetails o2) {
                return o2.getCreated_timestamp().compareTo(o1.getCreated_timestamp());
            }
        };

        if (asc) {
            comparator = new ReverseComparator<>(comparator);
        }

        Collections.sort(projects, comparator);
    }

    public static void sortProjectsByHitsDone(List<ProjectDetails> projects, boolean asc) {

        Comparator<ProjectDetails>  comparator = new Comparator<ProjectDetails>() {
            @Override //reverse sorted by hits done.
            public int compare(ProjectDetails o1, ProjectDetails o2) {
                return (int) (o2.getTotalHitsDone() - o1.getTotalHitsDone());
            }
        };

        if (asc) {
            comparator = new ReverseComparator<>(comparator);
        }

        Collections.sort(projects, comparator);
    }

    public static Set<String> getDefaultProjects(){
        // all default projects.
        List<java.lang.String> defaultProjects = DBBasedConfigs.getConfig("dtNewUserDefaultProjects", List.class, Collections.emptyList());
        //make a map.
        java.util.Set<java.lang.String> defaultProjectsSet = new HashSet<>(defaultProjects);
        return defaultProjectsSet;
    }


    public static String generateAPIKey() {
        return UUID.randomUUID().toString();
    }

    public static String generateAPISecret() {
        int randomStrLength = DBBasedConfigs.getConfig("dAPIKeyLength", Integer.class, 64);
        char[] possibleCharacters = (new String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")).toCharArray();
        String randomStr = RandomStringUtils.random( randomStrLength, 0, possibleCharacters.length-1, false, false, possibleCharacters, new SecureRandom() );

        return randomStr;
    }

    //make sure the uid is one of the admin ids.
    // get a db mapping from the uid to actual id
    public static String getImpersonatedIdIfAny(String uid) {
        if (Validations.isDataturksAdminUser(uid)) {
            Map<String, String> map = DBBasedConfigs.getConfig("dImpersonationConfig", Map.class, Collections.emptyMap());
            if (map.containsKey(uid)) return map.get(uid);
        }
        return null;
    }

    public static boolean isValidURL(String url) {
        if (url == null || url.isEmpty()) return false;
        //when storing locally, we return path as '/uploads' etc.
        if (DUtils.isOnPremMode() && url.startsWith("/")) return true;
        try {
            URL u = new URL(url);
            u.toURI(); // does the extra checking required for validation of URI
            return true;
        }
        catch (Exception e) {

        }
        return false;
    }

    public static String getURLFilename(DHits hit) {
        if (hit == null || hit.getData() == null) return null;

        String url = hit.getData();
        //if dataturks url?
        if (url.startsWith("http://com.dataturks") || url.startsWith("https://com.dataturks") || url.startsWith("/")) {
            return S3Handler.getFileNameFromURL(url);
        }
        else return url;
    }

    static boolean isImageProject(ProjectDetails details) {
        if (details != null) {
            if (DTypes.Project_Task_Type.IMAGE_CLASSIFICATION == details.getTask_type() ||
                    DTypes.Project_Task_Type.IMAGE_POLYGON_BOUNDING_BOX == details.getTask_type() ||
                    DTypes.Project_Task_Type.IMAGE_BOUNDING_BOX == details.getTask_type()||
                    DTypes.Project_Task_Type.IMAGE_POLYGON_BOUNDING_BOX_V2 == details.getTask_type()) {
                return true;
            }
        }
        return false;
    }

    static boolean isVideoProject(ProjectDetails details) {
        if (details != null) {
            if (DTypes.Project_Task_Type.VIDEO_BOUNDING_BOX == details.getTask_type() ||
                    DTypes.Project_Task_Type.VIDEO_CLASSIFICATION == details.getTask_type()) {
                return true;
            }
        }
        return false;
    }

    public static boolean isProjectWithURLs(ProjectDetails details) {
        return isImageProject(details) || isVideoProject(details);
    }

    public static boolean isValidHitStatus(String status) {
        if (DConstants.HIT_STATUS_SKIPPED.equalsIgnoreCase(status) ||
                DConstants.HIT_STATUS_DONE.equalsIgnoreCase(status) ||
                DConstants.HIT_STATUS_NOT_DONE.equalsIgnoreCase(status) ||
                DConstants.HIT_STATUS_DELETED.equalsIgnoreCase(status) ||
                DConstants.HIT_STATUS_PRE_TAGGED.equalsIgnoreCase(status) ||
                DConstants.HIT_STATUS_REQUEUED.equalsIgnoreCase(status) ) {
            return true;
        }
        return false;
    }

    public static DUsers getUser(String uid) {
        DUsers user = CacheWrapper.getUserFromCache(uid);
        if (user == null) {
            user = AppConfig.getInstance().getdUsersDAO().findByIdInternal(uid);
            if (user != null) {
                CacheWrapper.addUser(uid, user);
            }
        }
        return user;
    }

    public static boolean isOnPremMode() {
        return DBBasedConfigs.isInternalLoginAllowed();
    }

    public static boolean isLicenseActive() {
        if (true)   //license is always active :)
            return true;
        Date expiryDate = LicenseHandler.getLicenseExpiry();
        Date currentDate = new Date();
        if (currentDate.after(expiryDate)) {
            return false;
        }
        //check if label limits.
        long labelCount = LicenseHandler.getLicenseLabelsAllowed();
        if (labelCount > 0) { // <0 means no limit.
            //sum up all labels used.
            long labelsUsed = 0;
            List<DSubscriptions> all = AppConfig.getInstance().getdSubscriptionsDAO().findAllInternal();
            for (DSubscriptions item : all) {
                labelsUsed += item.getLabelsDone();
            }

            if (labelsUsed >= labelCount) {
                return false;
            }
        }

        return true;
    }

    public static String createUniqueFileName(String filepath) {
        //create a random key for the filepath.
        // ideally we would want the key to be like "UUID___filename.jpg", this will make sure the
        // key is unique and the file extension/name is preserved.
        String uuid = UUID.randomUUID().toString();

        //the file name can already be formed as a UUID___filename.jpg while uploading to local fs.
        //if so, dpn't use that UUID, don't want to make the filename too long.
        Path p = Paths.get(filepath);
        String filename = p.getFileName().toString();
        String[] nameParts = filename.split("___");
        if (nameParts.length > 1) {
            filename = nameParts[1];
        }

        return uuid + "___" + filename;
    }

    public static boolean isSerialOrderingProject(String projectId) {
        return DBBasedConfigs.getConfig("dSerialOrderedProjects", List.class, Collections.emptyList()).contains(projectId);
    }

    public static void main(String[] args) {

        System.out.println( "Key= " + generateAPIKey() );
        System.out.println( "Secret= " + generateAPISecret() );



    }

}
