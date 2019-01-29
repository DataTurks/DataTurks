package bonsai.dropwizard.resources;


import bonsai.Utils.CommonUtils;
import bonsai.Utils.UploadFileUtil;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.MetricUtils;
import bonsai.dropwizard.dao.d.*;
import bonsai.email.EmailSender;
import bonsai.sa.EventsLogger;
import bonsai.security.LoginAuth;
import com.codahale.metrics.Timer;
import dataturks.*;
import dataturks.cache.CacheWrapper;
import dataturks.license.LicenseHandler;
import dataturks.response.*;
import dataturks.security.InternalLoginAuth;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/*
* DT annotations platform
* */
@Path("/dataturks")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class DataturksEndpoint {
    private static final Logger LOG = LoggerFactory.getLogger(DataturksEndpoint.class);

    @POST
    @Path("/createUser")
    public DummyResponse createUser(@NotNull @HeaderParam("token") String token,
                             @NotNull @HeaderParam("uid") String id,
                            @NotNull Map<String,String> req) {
        EventsLogger.logEvent("d_newUserSignup");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);
        String regStr = "SaveUser: save user=  " + req.toString();
        LOG.info(regStr);

        try {
            DReqObj reqObj = new DReqObj(id, req);
            return createUserInternal(reqObj);
        }
        catch (Exception e) {
            LOG.error("Error " + regStr  + e.toString());
            EventsLogger.logErrorEvent("d_newUserSignupError");
            EmailSender.sendEventMail("Dataturks errors: User creation", "uid = " + id + "\n Reg: = " + req.toString() +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/createUserWithPassword")
    public LoginResponse createUser(@NotNull @HeaderParam("password") String password,
                                    @NotNull Map<String,String> req) {
        EventsLogger.logEvent("d_createUserWithPassword");


        String regStr = "SaveUser: save user=  " + req.toString();
        LOG.info(regStr);

        try {
            String id = InternalLoginAuth.generateUserId();
            String encryptedPassword = InternalLoginAuth.encryptedPassword(password);
            req.put("password", encryptedPassword);
            DReqObj reqObj = new DReqObj(id, req);
            createUserInternal(reqObj);
            DUsers user = AppConfig.getInstance().getdUsersDAO().findByOAuthIdInternal(id);
            return loginInternal(user, password);
        }
        catch (Exception e) {
            LOG.error("Error " + regStr  + e.toString());
            EventsLogger.logErrorEvent("d_newUserSignupError");
            EmailSender.sendEventMail("Dataturks errors: User creation",  "\n Reg: = " + req.toString() +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/login")
    public LoginResponse login(@NotNull @HeaderParam("email") String email,
                                    @NotNull @HeaderParam("password") String password) {

        EventsLogger.logEvent("d_login");

        String regStr = "login: login user email=  " + email ;
        LOG.info(regStr);
        try {
            DUsers user = AppConfig.getInstance().getdUsersDAO().findByEmailInternal(email);
            if (user == null) {
                throw new NotAuthorizedException("No such user found");
            }
            return loginInternal(user, password);
        }
        catch (Exception e) {
            LOG.error("Error " + regStr  + e.toString());
            EventsLogger.logErrorEvent("d_login");
            EmailSender.sendEventMail("Dataturks errors: User login",  "\n Reg: = " + regStr +
                    "\n" + "error = " + e.toString());
            throw e;
        }

    }


    @POST
    @Path("/createProject")
    public DummyResponse createProject(@NotNull @HeaderParam("token") String token,
                                @NotNull @HeaderParam("uid") String id,
                                @NotNull Map<String,String> req) {
        EventsLogger.logEvent("d_newProject");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String regStr = "createProject: " +  req.toString();
        LOG.info(regStr);

        try {
            DReqObj reqObj = new DReqObj(id, req);
            DummyResponse response = createProjectInternal(reqObj);

            //invalidate the cache for the user.
            CacheWrapper.updateProjectCreateDelete(reqObj, reqObj.getOrgId());

            return response;
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_newProjectError");
            EmailSender.sendEventMail("Dataturks errors: Create project", "uid = " + id + "\n Reg: = " + req.toString() +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/{projectId}/deleteProject")
    public DummyResponse deleteProject(@NotNull @HeaderParam("token") String token,
                                       @NotNull @HeaderParam("uid") String id,
                                       @NotNull @PathParam("projectId") String projectId) {
        EventsLogger.logEvent("d_deleteProject");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String regStr = "deleteProject: " +  projectId.toString();
        LOG.info(regStr);

        try {
            DReqObj reqObj = new DReqObj(id);
            DummyResponse response =  deleteProjectInternal(projectId, reqObj);

            //invalidate the cache for the user.
            CacheWrapper.updateProjectCreateDelete(reqObj, reqObj.getOrgId());
            return response;
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_deleteProjectError");
            EmailSender.sendEventMail("Dataturks errors: delete project", "uid = " + id +
                    "projectid = " + projectId + "\n Reg: = "  +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/{projectId}/updateProject")
    public DummyResponse updateProject(@NotNull @HeaderParam("token") String token,
                                       @NotNull @HeaderParam("uid") String id,
                                       @NotNull @PathParam("projectId") String projectId,
                                       @NotNull Map<String,String> req) {
        EventsLogger.logEvent("d_updateProject");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String regStr = "updateProject: " +  projectId.toString();
        LOG.info(regStr);

        try {
            DReqObj reqObj = new DReqObj(id, req);
            DummyResponse response = updateProjectInternal(projectId, reqObj);
            //invalidate the cache for the user.
            CacheWrapper.updateProjectCreateDelete(reqObj, reqObj.getOrgId());
            return response;
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_updateProjectError");
            EmailSender.sendEventMail("Dataturks errors: Update project", "uid = " + id +
                    "projectid = " + projectId + "\n Reg: = " + req.toString() +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/getUserHome")
    public UserHome getUserHome(@NotNull @HeaderParam("token") String token,
                                @NotNull @HeaderParam("uid") String id,
                                @QueryParam("cache") String cache) {


        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);


        //allows us to debug user issues.
        String impersonateId = DUtils.getImpersonatedIdIfAny(id);
        if (impersonateId != null) {
            LOG.info("Impersonating to " + impersonateId + " for the user with id= " + id);
            id = impersonateId;
        }

        boolean cacheEnabled = cache == null;

        String regStr = "getUserHome: " +  id;
        LOG.info(regStr);

        UserHome response = null;
        DReqObj reqObj = null;
        try {
            reqObj = new DReqObj(id, null);
            //get from cache.
            if (cacheEnabled) {
                response = CacheWrapper.getUserHome(reqObj);
                if (response != null)
                    return response;
            }

            response =  getUserHomeInternal(reqObj);
            //add to cache.
            CacheWrapper.addUserHome(reqObj, response);
            return response;

        }
        catch (Exception e) {
            if (!DUtils.isNonLoggedInUser(reqObj)) { //don't pollute logs for the non-logedin user case.
                LOG.error("Error " + regStr + e.toString());
                EventsLogger.logErrorEvent("d_getUserHomeError");
                EmailSender.sendEventMail("Dataturks errors: getUserHome", "uid = " + id  +
                        "\n" + "error = " + e.toString());
                throw e;
            }
        }
        return null;
    }

    @POST
    @Path("/{projectId}/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public UploadResponse fileUpload(@NotNull @HeaderParam("token") String token,
                             @NotNull @HeaderParam("uid") String id,
                             @NotNull @PathParam("projectId") String projectId,
                             @NotNull @FormDataParam("file") InputStream stream,
                                     @HeaderParam("format") String uploadFormat,
                                     @HeaderParam("itemStatus") String itemStatus,
                             @FormDataParam("file") FormDataContentDisposition fileDetail) {

        EventsLogger.logEvent("d_projectFileUpload");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String regStr = "projectFileUpload: projectId = " +  projectId + " filename = " + fileDetail.getFileName() + " uid = " + id;
        LOG.info(regStr);


        try {
            DReqObj reqObj = new DReqObj(id, null);

            if (uploadFormat != null) {
                Map<String, String> reqMap = new HashMap<>();
                reqMap.put(DConstants.UPLOAD_FORMAT_PARAM_NAME, uploadFormat);
                if (itemStatus != null) {
                    reqMap.put(DConstants.UPLOAD_DATA_STATUS_PARAM_NAME, itemStatus);
                }
                reqObj.setReqMap(reqMap);
            }

            UploadResponse response = handleFileUpload(reqObj, projectId, stream, fileDetail);

            EventsLogger.logEventLine("New file upload:" + regStr +
            "\n\n"  + " Number of records created = " + response.getNumHitsCreated() +
                    "\n\n" + " Number of records ignored = " + response.getNumHitsIgnored() +
                    "\n\n" + " File size (KB) = " + response.getTotalUploadSizeInBytes()/1024);



            return response;
        }
        catch (Exception e) {
            LOG.error("Error "+ regStr + e.toString() + " " + CommonUtils.getStackTraceString(e));
            EventsLogger.logErrorEvent("d_projectFileUploadError");
            EmailSender.sendEventMail("Dataturks errors:", regStr +
                    "\n" + "error = " + e.toString());

            throw e;
        }

    }

//    @GET
//    @Path("/{projectId}/downloadI")
//    @Produces(MediaType.APPLICATION_OCTET_STREAM)
//    public Response downloadDataInternal(@NotNull @PathParam("projectId") String projectId,
//                                 @QueryParam("items") String items) {
//
//        try {
//            DReqObj reqObj = new DReqObj(null, null);
//            return handleDataDownload(reqObj, projectId, items);
//        }
//        catch (Exception e) {
//            LOG.error("Error downloadData for project " + projectId + "error: " + e.toString());
//            EventsLogger.logErrorEvent("d_downloadDatadError");
//            throw e;
//        }
//
//    }

    @POST
    @Path("/{projectId}/download")
    @Produces(MediaType.APPLICATION_OCTET_STREAM + ";charset=utf-8")
    public Response downloadData(@NotNull @HeaderParam("token") String token,
                                     @NotNull @HeaderParam("uid") String id,
                                     @NotNull @PathParam("projectId") String projectId,
                                     @QueryParam("items") String items,
                                     @QueryParam("format") String format) {

        EventsLogger.logEvent("d_downloadData");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String regStr = "downloadData: " +  projectId + " uid = " + id;
        LOG.info(regStr);

        try {
            DReqObj reqObj = new DReqObj(id, null);
            return handleDataDownload(reqObj, projectId, items, format);
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_downloadDatadError");
            EmailSender.sendEventMail("Dataturks errors: download", "uid = " + id  + " projectID" + projectId +
                    "\n" + "error = " + e.toString());

            throw e;
        }

    }

    /* Get hits for a given project.
    @param status: if required use this to get only hits which are already 'done' (by default return only not done ones)
    allow filtering by userid/label etc.
     */
    @POST
    @Path("/{projectId}/getHits")
    public GetHits getHits(@NotNull @HeaderParam("token") String token,
                                @NotNull @HeaderParam("uid") String id,
                                @NotNull @PathParam("projectId") String projectId,
                                @QueryParam("status") String status,
                           @QueryParam("userId") String userId,
                           @QueryParam("label") String label,
                           @QueryParam("count") Long count,
                           @QueryParam("start") Long start,
                           @QueryParam("evaluation") String evaluation,
                           @QueryParam("order") String order) {

        //EventsLogger.logEvent("d_getHits");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String regStr = "getHits: project= " +  projectId + " status = " + status + "label = " + label + " evaluation=" + evaluation + " userId= " + userId +  " uid = " + id;
        LOG.info(regStr);


        try {
            DReqObj reqObj = new DReqObj(id, null);
            return getHitsInternal(reqObj, projectId, status, userId, label, evaluation, order, count, start);
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_getHitsError");
            throw e;
        }
    }

    @POST
    @Path("/{projectId}/addHitResult")
    public DummyResponse addHitResult(@NotNull @HeaderParam("token") String token,
                                      @NotNull @HeaderParam("uid") String id,
                                      @NotNull @PathParam("projectId") String projectId,
                                      @NotNull @QueryParam("hitId") long hitId,
                                      @NotNull Map<String,String> req) {

        EventsLogger.logEvent("d_addHitResult");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        //allows us to debug user issues.
        String impersonateId = DUtils.getImpersonatedIdIfAny(id);
        if (impersonateId != null) {
            LOG.info("Impersonating to " + impersonateId + " for the user with id= " + id);
            id = impersonateId;
        }


        String reqLogStr = "addHitResult: project= " +  projectId  + " uid = " + id + " hitId = " + hitId;
        LOG.info(reqLogStr);


        try {
            DReqObj reqObj = new DReqObj(id, req);
            return addHitResultInternal(reqObj, projectId, hitId);
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_addHitResultError");
            EmailSender.sendEventMail("Dataturks errors: addHitResult", "uid = " + id  + " projectID" + projectId +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/{projectId}/evaluationResult")
    public DummyResponse addEvaluationResult(@NotNull @HeaderParam("token") String token,
                                      @NotNull @HeaderParam("uid") String id,
                                      @NotNull @PathParam("projectId") String projectId,
                                      @NotNull @QueryParam("hitId") long hitId,
                                      @NotNull Map<String,String> req) {

        EventsLogger.logEvent("d_addEvaluationResult");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String reqLogStr = "addEvaluationResult: project= " +  projectId  + " uid = " + id + " hitId = " + hitId;
        LOG.info(reqLogStr);


        try {
            DReqObj reqObj = new DReqObj(id, req);
            return addEvaluationResultInternal(reqObj, projectId, hitId);
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_addEvaluationResultError");
            EmailSender.sendEventMail("Dataturks errors: addEvaluationResult", "uid = " + id  + " projectID" + projectId +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/{projectId}/addContributor")
    public DummyResponse addContributor(@NotNull @HeaderParam("token") String token,
                                        @NotNull @HeaderParam("uid") String id,
                                        @NotNull @PathParam("projectId") String projectId,
                                        @NotNull @QueryParam("userEmail") String userEmail,
                                        @QueryParam("role") String role) {

        EventsLogger.logEvent("d_addContributor");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        //allows us to debug user issues.
        String impersonateId = DUtils.getImpersonatedIdIfAny(id);
        if (impersonateId != null) {
            LOG.info("Impersonating to " + impersonateId + " for the user with id= " + id);
            id = impersonateId;
        }


        String reqLogStr = "addContributor: project= " +  projectId  + " uid = " + id + " email= " + userEmail +  " role=" + role;
        LOG.info(reqLogStr);


        try {
            DReqObj reqObj = new DReqObj(id, null);
            return addContributorInternal(reqObj, projectId, userEmail, role);
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_addContributorError");
            throw e;
        }
    }

    @POST
    @Path("/{projectId}/removeContributor")
    public DummyResponse removeContributor(@NotNull @HeaderParam("token") String token,
                                           @NotNull @HeaderParam("uid") String id,
                                           @NotNull @PathParam("projectId") String projectId,
                                           @NotNull @QueryParam("userEmail") String userEmail) {

        EventsLogger.logEvent("d_removeContributor");

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String reqLogStr = "removeContributor: project= " +  projectId  + " uid = " + id;
        LOG.info(reqLogStr);


        try {
            DReqObj reqObj = new DReqObj(id, null);
            return removeContributorInternal(reqObj, projectId, userEmail);
        }
        catch (Exception e) {
            LOG.error("Error  " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_removeContributorError");
            throw e;
        }
    }


    /////////////////////////////// Only view operations (may be allowed to non logged-in users) ////////////////////////////////
    @POST
    @Path("/{projectId}/getProjectDetails")
    public ProjectDetails getProjectDetails(@NotNull @HeaderParam("token") String token,
                                            @NotNull @HeaderParam("uid") String id,
                                    @NotNull @PathParam("projectId") String projectId) {

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        //allows us to debug user issues.
        String impersonateId = DUtils.getImpersonatedIdIfAny(id);
        if (impersonateId != null) {
            LOG.info("Impersonating to " + impersonateId + " for the user with id= " + id);
            id = impersonateId;
        }


        String reqLogStr = "getProjectDetails: project= " +  projectId  + " uid = " + id;
        LOG.info(reqLogStr);


        try {
            DReqObj reqObj = new DReqObj(id, null);
            return getProjectDetailsInternal(reqObj, projectId);
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_getProjectDetailsError");
            throw e;
        }
    }

    @POST
    @Path("/{projectId}/getProjectStats")
    public ProjectStats getProjectStats(@NotNull @HeaderParam("token") String token,
                                        @NotNull  @HeaderParam("uid") String id,
                                        @NotNull @PathParam("projectId") String projectId,
                                        @QueryParam("cache") String cache) {

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);
        boolean cacheEnabled = cache == null;
        ProjectStats response = null;
        String reqLogStr = "getProjectStats: project= " +  projectId  + " uid = " + id;
        LOG.info(reqLogStr);

        try {
            DReqObj reqObj = new DReqObj(id, null);

            //get from cache.
            if (cacheEnabled) {
                response = CacheWrapper.getProjectStats(reqObj, projectId);
                if (response != null)
                    return response;
            }

            response =  getProjectStatsInternal(reqObj, projectId);
            
            CacheWrapper.addProjectStats(reqObj, projectId, response);
            return response;
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_getProjectStatsError");
            throw e;
        }
    }

    @POST
    @Path("/getProjectId")
    public DummyResponse getProjectId(@NotNull @HeaderParam("token") String token,
                                      @NotNull @HeaderParam("uid") String id,
                                      @NotNull Map<String,String> req) {

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String reqLogStr = "getProjectId: uid = " + id + " reg= " +  req.toString();
        LOG.info(reqLogStr);

        try {
            DReqObj reqObj = new DReqObj(id, null);
            return DummyResponse.getString(getProjectIdInternal(reqObj, req));
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_getProjectId");
            throw e;
        }
    }

    @POST
    @Path("/getOrgProjects")
    public OrgProjects getOrgProjects(@NotNull @HeaderParam("token") String token,
                               @NotNull @HeaderParam("uid") String id,
                               @QueryParam("orgId") String orgId,
                               @QueryParam("orgName") String orgName,
                                      @QueryParam("cache") String cache) {

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        boolean cacheEnabled = cache == null;
        String reqLogStr = "getOrgProjects: uid= " +  id.toString() + " orgId = " + orgId + " orgName=" + orgName;
        LOG.info(reqLogStr);

        DReqObj reqObj =null;
        OrgProjects response = null;

        try {
            if (orgId == null && orgName != null) {
                DOrgs orgs = AppConfig.getInstance().getdOrgsDAO().findByNameInternal(orgName);
                if (orgs != null) {
                    orgId = orgs.getId();
                }
            }
            reqObj = new DReqObj(id, null);

            //get from cache.
            if (cacheEnabled) {
                response = CacheWrapper.getOrgProjects(reqObj, orgId);
                if (response != null)
                    return response;
            }


            response =  getOrgProjectsInternal(reqObj, orgId);
            //add to cache.
            CacheWrapper.addOrgProjects(reqObj, orgId, response);
            return response;
        }
        catch (Exception e) {
            //if an exception occured means something changed and we should unset the cache.
            //may be a public org became paid?
            CacheWrapper.removeOrgProjects(reqObj, orgId);

            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_getOrgProjects");

            //if we are not throwing 404, then something is broken.
            if (!(e instanceof  WebApplicationException) ||
                    ((WebApplicationException)e).getResponse().getStatus() != Response.Status.NOT_FOUND.getStatusCode()) {
                EmailSender.sendEventMail("Dataturks errors: getOrgProjects",  reqLogStr +
                        "\n" + "error = " + e.toString());
            }

            throw e;
        }
    }

    @POST
    @Path("/getAPIKey")
    public APIKey getOrCreateAPIKey(@NotNull @HeaderParam("token") String token,
                                      @NotNull @HeaderParam("uid") String id) {

        LoginAuth.validateAndGetDataturksUserIdElseThrowException(id, token);

        String reqLogStr = "createAPIKey: uid = " + id ;
        LOG.info(reqLogStr);

        try {
            DReqObj reqObj = new DReqObj(id, null);
            return getOrCreateAPIKeyInternal(reqObj);
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_createAPIKey");
            throw e;
        }
    }

    @POST
    @Path("/getLicense")
    public License getLicense(@NotNull @HeaderParam("key") String key) {


        String reqLogStr = "getLicense: ";
        LOG.info(reqLogStr);

        try {
            return getLicenseInternal(key);
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EmailSender.sendEventMail("Dataturks errors: getLicense",  reqLogStr +
                    "\n" + "error = " + e.toString());
            EventsLogger.logErrorEvent("getLicense");
            throw e;
        }
    }

    @POST
    @Path("/addLicense")
    public DummyResponse addLicense(@NotNull @HeaderParam("license") String license) {


        String reqLogStr = "addLicense: ";
        LOG.info(reqLogStr);

        try {
            return addLicenseInternal(license);
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EmailSender.sendEventMail("Dataturks errors: addLicense",  reqLogStr +
                    "\n" + "error = " + e.toString());
            EventsLogger.logErrorEvent("addLicense");
            throw e;
        }
    }

    @POST
    @Path("/getLicenseInfo")
    public LicenseInfo  getLicenseInfo() {


        String reqLogStr = "getLicenseInfo: ";
        LOG.info(reqLogStr);

        try {
            return getLicenseInfoInternal();
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EmailSender.sendEventMail("Dataturks errors: getLicenseInfo",  reqLogStr +
                    "\n" + "error = " + e.toString());
            EventsLogger.logErrorEvent("getLicenseInfo");
            throw e;
        }
    }

    @POST
    @Path("/updateAdminPassword")
    public DummyResponse updateAdminPassword(@NotNull @HeaderParam("license") String license,
                                      @NotNull @HeaderParam("email") String email,
                                      @NotNull @HeaderParam("password") String newPassword) {


        String reqLogStr = "updateAdminPassword: for email " + email;
        LOG.info(reqLogStr);

        try {
            return updateAdminPasswordInternal(license, email, newPassword);
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EmailSender.sendEventMail("Dataturks errors: updateAdminPassword",  reqLogStr +
                    "\n" + "error = " + e.toString());
            EventsLogger.logErrorEvent("updateAdminPassword");
            throw e;
        }
    }



        /////////////////////////////// ALL INTERNAL FUNCTIONS /////////////////////////////////////////////////////////


    public static Response handleDataDownload(DReqObj reqObj, String projectId, String items, String formatStr) {
        DTypes.File_Download_Type downloadType = DTypes.File_Download_Type.DONE;
        if (items != null &&!items.isEmpty()) {
            downloadType = DTypes.File_Download_Type.valueOf(items);
        }

        DTypes.File_Download_Format format = DTypes.File_Download_Format.ANY;
        if (formatStr != null &&!formatStr.isEmpty()) {
            try {
                format = DTypes.File_Download_Format.valueOf(formatStr);
            }
            catch (Exception e) {
                throw new WebApplicationException("Unkown format type " + formatStr, Response.Status.BAD_REQUEST);
            }
        }

        String filepath = Controlcenter.handleDataDownload(reqObj, projectId, downloadType, format);
        if (filepath != null) {
            java.nio.file.Path path = Paths.get(filepath);
            //show a good filename to user
            String[] parts = filepath.split("____");
            String fileName = parts[parts.length -1];


            return Response.ok().entity(new StreamingOutput() {
                @Override
                public void write(final OutputStream output) throws IOException, WebApplicationException {
                    try {
                        Files.copy(path, output);
                    } finally {
                        Files.delete(path);
                    }
                }
            }).header("content-disposition", "attachment; filename = "+ fileName).build();

        }
        throw new WebApplicationException("Unable to download data", Response.Status.BAD_GATEWAY);
    }

    public static ProjectDetails getProjectDetailsInternal(DReqObj reqObj, String projectId) {
        ProjectDetails projectDetails = Controlcenter.getProjectDetailsInternal(reqObj, projectId);
        return projectDetails;
    }

    public static ProjectStats getProjectStatsInternal(DReqObj reqObj, String projectId) {
        ProjectStats projectStats = Controlcenter.getProjectStatsInternal(reqObj, projectId);
        return projectStats;
    }

    public static String getProjectIdInternal(DReqObj reqObj,Map<String,String> req ){
        if (req.containsKey("orgName") && req.containsKey("projectName")) {
            return Controlcenter.getProjectIdInternal(reqObj, req.get("orgName"), req.get("projectName"));
        }
        throw new WebApplicationException("orgName or projectName not passed", Response.Status.BAD_REQUEST);
    }

    public static DummyResponse addContributorInternal(DReqObj reqObj, String projectId, String userEmail, String roleStr) {
        DTypes.Project_User_Role role = DTypes.Project_User_Role.CONTRIBUTOR;
        try {
            role = (roleStr == null) ? role : DTypes.Project_User_Role.valueOf(roleStr);
        }
        catch (Exception e) {
            LOG.error("addContributorInternal " + e.toString());
            throw new WebApplicationException("Invalid role", Response.Status.BAD_REQUEST);
        }

        Controlcenter.addContributorInternal(reqObj, projectId, userEmail.trim(), role);
        return DummyResponse.getOk();
    }

    public static DummyResponse removeContributorInternal(DReqObj reqObj, String projectId, String userEmail) {
        Controlcenter.removeContributorInternal(reqObj, projectId, userEmail.trim());
        return DummyResponse.getOk();
    }



    public static DummyResponse addHitResultInternal(DReqObj reqObj, String projectId, long hitId) {
         Controlcenter.addHitResultInternal(reqObj, projectId, hitId);
         return DummyResponse.getOk();
    }

    public static DummyResponse addEvaluationResultInternal(DReqObj reqObj, String projectId, long hitId) {
        Controlcenter.addEvaluationResultInternal(reqObj, projectId, hitId);
        return DummyResponse.getOk();
    }

    public static OrgProjects getOrgProjectsInternal(DReqObj reqObj, String orgId) {
        return Controlcenter.getOrgProjectsInternal(reqObj, orgId);
    }


    // return hits.
    // if the project is private, make sure to check if the user has permission
    // for public and restricted projects we can return the hits.
    // for pagination use start/count (used when accessing hits serially, mostly for viewing all done)
    public static GetHits getHitsInternal(DReqObj reqObj, String projectId, String status,
                                          String userId, String label, String evaluation, String orderByStr,
                                          Long count, Long start) {

        //don't let ppl crawl our APIs.
        int maxHitsToReturn  = DBBasedConfigs.getConfig("maxHitsToReturnPerCall", Integer.class, DConstants.MAX_HITS_TO_RETURN);
        if (count == null)
            count = (long)maxHitsToReturn;
        count = Math.min(count, maxHitsToReturn);

        if (start == null)
            start = 0l;

        if (status == null)
            status = DConstants.HIT_STATUS_ALL;

        userId = (userId == null || userId.isEmpty())? null: userId;
        label = (label == null || label.isEmpty())? null: label;
        evaluation = (evaluation == null || evaluation.isEmpty())? null: evaluation.toUpperCase();

        DTypes.HIT_ORDER_Type orderBy = DTypes.HIT_ORDER_Type.RANDOM;
        try {
            orderBy = (orderByStr == null || orderByStr.isEmpty()) ? DTypes.HIT_ORDER_Type.RANDOM : DTypes.HIT_ORDER_Type.valueOf(orderByStr);
        }
        catch (Exception e) {
            //do nothing.
        }

        return Controlcenter.getHits(reqObj, projectId, status, userId, label, evaluation, count, start, orderBy);
    }


    //> make sure the user has permission to upload file
    // Make sure the file is of proper type.
    // process file for creating hits.
    // delete the temp file from disk.
    public static UploadResponse handleFileUpload(DReqObj reqObj, String projectId, InputStream stream, FormDataContentDisposition fileDetail) {

        String uploadedFile = null;
        UploadResponse response = null;
        try {
            // get the config for the org.
            DUtils.setConfigForOrg(reqObj);

            uploadedFile = UploadFileUtil.uploadStreamToFile(reqObj, stream, fileDetail);

            response =  Controlcenter.handleFileUpload(reqObj, projectId, uploadedFile);
            return response;
        }
        finally {
            //delete the temp file.
            if (uploadedFile != null) {
                try {
                    //if the response is null, something wrong happened, lets not delete the file yet,
                    //which will help to analyse this issue
                    if (response != null) {
                        File file = new File(uploadedFile);
                        file.delete();
                    }
                }
                catch (Exception e) {
                    //do nothing
                }
            }
        }
    }

    private static UserHome getUserHomeInternal(DReqObj reqObj) {
        if (reqObj != null) {
            return Controlcenter.getUserHomeInternal(reqObj);
        }

        return null;
    }

    public static DummyResponse createProjectInternal(DReqObj reqObj) {
        if (reqObj != null && reqObj.getUid() != null &&
                reqObj.getReqMap() != null &&
                reqObj.getReqMap().containsKey("name") &&
                reqObj.getReqMap().containsKey("taskType")) {

            DProjects project = new DProjects(reqObj.getReqMap().get("name"), reqObj.getOrgId());
            updateProjectFromRequest(project, reqObj);

            String projectId = Controlcenter.createNewProject(project, reqObj);
            EventsLogger.logEventLine("New project created by uid= " + reqObj.getUid() + " " + project.getName() + " Rules= " + project.getTaskRules());
            return DummyResponse.getString(projectId);
        }
        return null;
    }

    public static DummyResponse updateProjectInternal(String projectId, DReqObj reqObj) {
        if (reqObj != null && reqObj.getReqMap() != null) {
            DProjects project = AppConfig.getInstance().getdProjectsDAO().findByIdInternal(projectId);
            if (project == null) {
                throw new WebApplicationException("No such project found", Response.Status.NOT_FOUND);
            }
            updateProjectFromRequest(project, reqObj);
            Controlcenter.updateProject(project, reqObj);

        }
        return DummyResponse.getOk();
    }

    public static DummyResponse deleteProjectInternal(String projectId, DReqObj reqObj) {
        DProjects project = AppConfig.getInstance().getdProjectsDAO().findByIdInternal(projectId);
        if (project == null) {
            throw new WebApplicationException("No such project found", Response.Status.NOT_FOUND);
        }
        Controlcenter.deleteProject(project, reqObj);
        return DummyResponse.getOk();
    }

    private static void updateProjectFromRequest(DProjects project, DReqObj reqObj) {

        if (reqObj.getReqMap().containsKey("name")) {
            project.setName(reqObj.getReqMap().get("name").trim());
        }

        if (reqObj.getReqMap().containsKey("taskType")) {
            project.setTaskType(Validations.getProjectTaskType(reqObj.getReqMap().get("taskType")));
        }

        if (reqObj.getReqMap().containsKey("accessType")) {
            project.setAccessType(Validations.getProjectAccessType(reqObj.getReqMap().get("accessType")));
        }

        if (reqObj.getReqMap().containsKey("rules")) {
            project.setTaskRules(reqObj.getReqMap().get("rules"));
        }

        if (reqObj.getReqMap().containsKey("description")) {
            project.setDescription(reqObj.getReqMap().get("description"));
        }

        if (reqObj.getReqMap().containsKey("shortDescription")) {
            project.setShortDescription(reqObj.getReqMap().get("shortDescription"));
        }

        if (reqObj.getReqMap().containsKey("minGoldenHITs")) {
            project.setMinGoldenHITs(CommonUtils.parseLong(reqObj.getReqMap().get("minGoldenHITs"), 0l));
        }

        if (reqObj.getReqMap().containsKey("HITRepeatCount")) {
            project.setHITRepeatCount(CommonUtils.parseLong(reqObj.getReqMap().get("HITRepeatCount"), 0l));
        }

        if (reqObj.getReqMap().containsKey("validateWithGoldenHITs")) {
            project.setValidateWithGoldenHITs(reqObj.getReqMap().containsKey("validateWithGoldenHITs"));
        }
    }


    private static DummyResponse createUserInternal(DReqObj reqObj) {
        if (reqObj != null && reqObj.getUid() != null &&
                reqObj.getReqMap() != null && reqObj.getReqMap().containsKey("email")) {
            Map<String,String> req = reqObj.getReqMap();
            DUsers user = new DUsers(reqObj.getUid(), req.get("email"));
            user.setFirstName(req.get("firstName"));
            user.setSecondName(req.get("secondName"));
            user.setOAuthType(req.get("authType"));
            user.setCity(req.get("city"));
            user.setPhone(req.get("phone"));
            if (req.containsKey("password")) {
                user.setPassword(req.get("password"));
            }
            user.setProfileLink(req.get("profileLink"));
            user.setProfilePic(req.get("profilePic"));
            user.setNotificationToken(req.get("notificationToken"));

            if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
                user.setFirstName(DUtils.getNameFromEmailString(user.getEmail()));
            }

            if (Controlcenter.createNewUser(user, reqObj)) {
                //have moved to drip flow.
                //EmailSender.sendDataturksUserSignupEmail(user);
            }
            EmailSender.sendEventMail("New d_user sign up", user.getFirstName() + " "+ user.getEmail());

        }
        else {
            throw new WebApplicationException("No email address for the user present.");
        }
        return DummyResponse.getOk();
    }

    private static APIKey getOrCreateAPIKeyInternal(DReqObj reqObj) {
        return Controlcenter.getOrCreateAPIKeyInternal(reqObj);
    }

    ////////////////// On prem function /////////////////////////////

    private LoginResponse loginInternal(DUsers user, String password) {
        if (user == null) {
            throw new NotAuthorizedException("No such user found");
        }
        if (user.getPassword().contentEquals(InternalLoginAuth.encryptedPassword(password))) {
            String token = InternalLoginAuth.generateRandomUserToken();
            InternalLoginAuth.addToken(user.getId(), token);
            return new LoginResponse(user.getId(), token);
        }
        throw new NotAuthorizedException("User email/password doesn't match", Response.Status.BAD_REQUEST);
    }

    private static DummyResponse addLicenseInternal(String licenseOrKey) {
        if (!DUtils.isOnPremMode()) {
            throw new NotAuthorizedException("You don't have permission for this");
        }

        LicenseHandler.handleAddNewLicense(licenseOrKey);

        return DummyResponse.getOk();
    }

    private static LicenseInfo getLicenseInfoInternal() {
        if (!DUtils.isOnPremMode()) {
            throw new NotAuthorizedException("You don't have permission for this");
        }

        return LicenseHandler.getLicenseInfo();
    }


    private static License getLicenseInternal(String key) {
        if (DUtils.isOnPremMode()) {
            throw new NotAuthorizedException("You don't have permission for this");
        }
        return Controlcenter.getLicenseInternal(key);
    }

    private static DummyResponse updateAdminPasswordInternal(String license, String email, String newPassword) {
        if (!DUtils.isOnPremMode()) {
            throw new NotAuthorizedException("You don't have permission for this");
        }

        if (LicenseHandler.isCurrentLicense(license)) {
            DUsers user = AppConfig.getInstance().getdUsersDAO().findByEmailInternal(email);
            if (user != null) {
                String password = InternalLoginAuth.encryptedPassword(newPassword);
                user.setPassword(password);
                AppConfig.getInstance().getdUsersDAO().saveOrUpdateInternal(user);
            }
            else {
                throw new WebApplicationException("No user with email " + email +  " found.", Response.Status.BAD_REQUEST);
            }
        }
        else {
            throw new WebApplicationException("The provided license is invalid. Please upload the currently active license or please contact us at support@dataturks.com", Response.Status.BAD_REQUEST);
        }
        return DummyResponse.getOk();
    }



    public static class DummyResponse {

        private String response;

        public DummyResponse(String response) {

            this.response = response;
        }

        public String getResponse() {
            return response;
        }

        public void setResponse(String response) {
            this.response = response;
        }

        public static DummyResponse getOk() {
            return new DummyResponse("Ok");
        }

        public static DummyResponse getString(String projectId) {
            return new DummyResponse(projectId);
        }
    }
}
