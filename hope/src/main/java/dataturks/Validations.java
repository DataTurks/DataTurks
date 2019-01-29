package dataturks;

import bonsai.Constants;
import bonsai.Utils.UploadFileUtil;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DAPIKeys;
import bonsai.dropwizard.dao.d.DProjects;
import bonsai.dropwizard.dao.d.DSubscriptionPlans;
import bonsai.dropwizard.dao.d.DSubscriptions;
import bonsai.dropwizard.resources.DataturksAPIEndPoint;
import bonsai.email.EmailSender;
import bonsai.exceptions.AuthException;
import bonsai.sa.EventsLogger;
import dataturks.response.ProjectDetails;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.Date;
import java.util.List;

public class Validations {

    private static final Logger LOG = LoggerFactory.getLogger(Validations.class);

    //make sure inputAccessType is one we understand.
    public static DTypes.Project_Access_Type getProjectAccessType(String inputAccessType) {
        return DTypes.Project_Access_Type.valueOf(inputAccessType.toUpperCase());
    }

    public static DTypes.Project_Task_Type getProjectTaskType(String inputTaskType) {
        return DTypes.Project_Task_Type.valueOf(inputTaskType.toUpperCase());
    }

    public static boolean isFreePlanUser(DReqObj reqObj) {
        String orgId = reqObj.getOrgId();
        return !isPaidPlanOrg(orgId);
    }


    public static boolean isPaidPlanOrg(String orgId) {
        //get subscription plan.
        DSubscriptions subscriptions = AppConfig.getInstance().getdSubscriptionsDAO().findByOrgIdInternal(orgId);
        if (subscriptions != null) {
            DSubscriptionPlans plan =AppConfig.getInstance().getdSubscriptionPlansDAO().findByIdInternal(subscriptions.getPlanId());
            if (plan != null) {
                return plan.isPaid();
            }
        }
        return false;
    }

    public static DOrgConfigs getOrgConfigs(String orgId) {
        DSubscriptionPlans plan = getOrgPlan(orgId);
        if (plan != null && plan.getConfig() != null) {
            String config = plan.getConfig();
            DOrgConfigs orgConfigs = DOrgConfigs.getConfig(config);
            return orgConfigs;
        }
        return null;
    }

    public static DSubscriptionPlans getOrgPlan(String orgId) {
        DSubscriptions subscriptions = AppConfig.getInstance().getdSubscriptionsDAO().findByOrgIdInternal(orgId);
        if (subscriptions != null) {
            DSubscriptionPlans plan = AppConfig.getInstance().getdSubscriptionPlansDAO().findByIdInternal(subscriptions.getPlanId());
            return plan;
        }
        return null;
    }


    public static boolean isFreePlanProject(DProjects project) {
        return !isPaidPlanProject(project);
    }

    public static boolean isPaidPlanProject(String projectId) {
        return isPaidPlanProject(AppConfig.getInstance().getdProjectsDAO().findByIdInternal(projectId));

    }
    public static boolean isPaidPlanProject(DProjects project) {
        if (project != null) {
            String orgId = project.getOrgId();
            return isPaidPlanOrg(orgId);
        }
        return false;
    }


    public static boolean doesUserBelongToOrg(DReqObj reqObj, String orgId) {
        return false;
    }

    public static boolean isValidDataItemForTextTask(String line, DReqObj reqObj) {
        long maxLength = reqObj.getConfigs().maxHitDataLength;

        if (line != null && !line.isEmpty() && line.length() < maxLength) {
            return true;
        }

        return  false;
    }

    public static boolean isValidDataItemFromFileForTextTask(String filepath, DReqObj reqObj) {
        try {
            String content = UploadFileUtil.readText(filepath);
            return isValidDataItemForTextTask(content, reqObj);
        }
        catch (Exception e) {
            //ignore.
        }

        return  false;
    }

    //these characters break HTML URL formation.
    static char[] notAllowedCharacters = new char[] {'/', '\\', '&', '"', '\'', '<', '>', '~', '?', '%', '#', '{', '}', '|', '[', ']', '`', '^', '+', ':', ';', '=', '@', '$', ',' };
    public static boolean isValidProjectName(String name) {
        for (char c : notAllowedCharacters) {
            if (name.indexOf(c) >= 0) {
                return false;
            }
        }
//        if (name.matches("[A-Za-z0-9\\s_-]+")) {
//            return true;
//        }
        return true;
    }

    public static boolean isDataturksAdminUser(DReqObj reqObj) {
        return isDataturksAdminUser(reqObj.getUid());
    }

    public static boolean isDataturksAdminUser(String uid) {
        List<String> adminId = DBBasedConfigs.getConfig("dtAdminUsers", List.class, Collections.emptyList());
        if (adminId.contains(uid)) {
            return true;
        }
        return false;
    }


    // if the labels done has exceeded or the date has expired.
    public static boolean hasSubscriptionExpired(DOrgConfigs config, DSubscriptions subscriptions){
        if (subscriptions != null && config != null) {
            if (subscriptions.getLabelsDone() >= config.getNumLabelsAllowed() ||
                    (subscriptions.getValidTill() != null && (new Date()).after(subscriptions.getValidTill()) )) {

                return true;
            }
        }
        else {
            return true;
        }

       return false;
    }

    public static boolean hasSubscriptionExpired(String orgId){
        DOrgConfigs config = DUtils.getConfigForOrg(orgId);
        DSubscriptions subscriptions = AppConfig.getInstance().getdSubscriptionsDAO().findByOrgIdInternal(orgId);
        return hasSubscriptionExpired(config, subscriptions);
    }



    public static boolean isProjectDeletable(ProjectDetails projectDetails) {
        if (Validations.isPaidPlanOrg(projectDetails.getOrgId())) {
            //even for some private plans like university etc, we do not allow deleted.
            DOrgConfigs orgConfigs = getOrgConfigs(projectDetails.getOrgId());
            if (orgConfigs == null || orgConfigs.isProjectDeleteAllowed()) {
                return true;
            }
        }

        else if (projectDetails.getTotalHitsDone() < DBBasedConfigs.getConfig("dHitsDoneThresholdForProjectDelete", Long.class, 50l)) {
            return true;
        }

        return false;
    }

    public static boolean isDeleted(DProjects project) {
        if (DTypes.Project_Status.DELETED.toString().equalsIgnoreCase(project.getStatus())) {
            return true;
        }
        return false;
    }


    public static void setPermissionForDelete(DReqObj reqObj, ProjectDetails projectDetails) {

    }

    public static String validateAPIAccessGetUidElseThrowException(String key, String token) {

        if (DBBasedConfigs.getConfig("isDataturksAPIAccessEnabled", Boolean.class, true)) {
            //make sure the id/token is a valida pair.
            DAPIKeys apiKey = AppConfig.getInstance().getDapiKeysDAO().findByKeyInternal(key);
            if (apiKey != null && apiKey.getKey() != null) {
                if (apiKey.getSecret().equals(token)) return apiKey.getUid();
            }
        }
        else {
            throw new AuthException("API access is disabled, please contact support.");
        }

        //if we reach here means we need to throw exception.
        LOG.error("Dataturks API validation failed for key " + key);
        EventsLogger.logErrorEvent("d_APITokenValidationFailed");
        EmailSender.sendEventMail("Dataturks API errors auth exception:", "key = " + key + " token= " + token);
        throw new AuthException("Wrong credentials");
    }


    public static void main(String[] args) {
        String name = "mohi project";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "mohiproject";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "GOODBIY";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "kol/jggj";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "noy&34";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "not?goof";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = " this is good";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "allowed-ed";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "do_allow";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "pic-1-180720";
        System.out.println(name + " = "  + isValidProjectName(name));
        name = "图片分类180720";
        System.out.println(name + " = "  + isValidProjectName(name));
    }
}