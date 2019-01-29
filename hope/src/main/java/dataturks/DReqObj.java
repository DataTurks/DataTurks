package dataturks;

import bonsai.config.AppConfig;
import bonsai.dropwizard.dao.d.DOrgUsers;
import bonsai.dropwizard.dao.d.DOrgs;
import bonsai.dropwizard.dao.d.DUsers;

import java.util.List;
import java.util.Map;

public class DReqObj {

    String uid;
    String orgId;
    DUsers user;
    DOrgs org;
    Map<String,String> reqMap;
    DOrgConfigs configs;

    //valid HIT stats for which to calculate stats from.
    // Done and Pretagged.
    List<String> validStatesForStatsCalculation ;

    public DReqObj(String uid) {
        this.uid = uid;
    }

    public DReqObj(String uid, Map<String,String> reqMap) {
        this(uid);
        this.reqMap = reqMap;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getOrgId() {
        if (orgId == null)
            loadOrgId();
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public DUsers getUser() {
        if (user == null)
            loadUser();
        return user;
    }

    public void setUser(DUsers user) {
        this.user = user;
    }

    public DOrgs getOrg() {
        if (org == null) {
            loadOrg();
        }
        return org;
    }

    public void setOrg(DOrgs org) {
        this.org = org;
    }

    public Map<String, String> getReqMap() {
        return reqMap;
    }

    public void setReqMap(Map<String, String> reqMap) {
        this.reqMap = reqMap;
    }

    public List<String> getValidStatesForStatsCalculation() {
        return validStatesForStatsCalculation;
    }

    public void setValidStatesForStatsCalculation(List<String> validStatesForStatsCalculation) {
        this.validStatesForStatsCalculation = validStatesForStatsCalculation;
    }

    ////////////////////////////// All transparent loading functions ////////////////////////////////////////////////////
    ////////////////// Load the actual values only when needed, one downside is if something is null even after loading
    /////////////////  then on subsequent call it will still hit the db and again return null.

    private void loadUser() {
        user = AppConfig.getInstance().getdUsersDAO().findByIdInternal(uid);
    }

    private void loadOrg() {
        if (orgId == null) {
            loadOrgId();
        }
        setOrg(AppConfig.getInstance().getdOrgsDAO().findByIdInternal(orgId));

    }

    private void loadOrgId() {
        //find org for the user.
        DOrgUsers orgUsers = AppConfig.getInstance().getdOrgUsersDAO().findByUserIdInternal(uid);
        if (orgUsers != null)
            orgId = orgUsers.getOrgId();

    }

    public DOrgConfigs getConfigs() {
        return configs;
    }

    public void setConfigs(DOrgConfigs configs) {
        this.configs = configs;
    }

    public DTypes.File_Upload_Format getUploadFileType() {
        if (reqMap != null && reqMap.containsKey(DConstants.UPLOAD_FORMAT_PARAM_NAME)) {
            return DTypes.File_Upload_Format.valueOf(reqMap.get(DConstants.UPLOAD_FORMAT_PARAM_NAME));
        }

        return DTypes.File_Upload_Format.UNSPECIFIED;
    }

    //when we add data items during upload, what status should we add them with, DONE/Skipped etc.
    public String getUploadDataItemStatus() {
        if (reqMap != null && reqMap.containsKey(DConstants.UPLOAD_DATA_STATUS_PARAM_NAME)) {
            String status = reqMap.get(DConstants.UPLOAD_DATA_STATUS_PARAM_NAME);

            if (DUtils.isValidHitStatus(status)) return status;
        }

        return null;
    }
}
