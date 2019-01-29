package bonsai.dropwizard.resources;

import bonsai.Utils.CommonUtils;
import bonsai.Utils.UploadFileUtil;
import bonsai.config.AppConfig;
import bonsai.dropwizard.dao.d.DProjects;
import bonsai.email.EmailSender;
import bonsai.sa.EventsLogger;
import bonsai.security.LoginAuth;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import dataturks.DConstants;
import dataturks.DReqObj;
import dataturks.DUtils;
import dataturks.Validations;
import dataturks.aws.S3Handler;
import dataturks.cache.CacheWrapper;
import dataturks.response.ContributorDetails;
import dataturks.response.ProjectDetails;
import dataturks.response.UploadResponse;
import dataturks.response.UserDetails;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.ws.WebServiceException;
import java.io.File;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/*
 * DT annotations platform API access
 * */
@Path("/dtAPI")
@Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
public class DataturksAPIEndPoint {

    private static final Logger LOG = LoggerFactory.getLogger(DataturksAPIEndPoint.class);


    @POST
    @Path("/{version}/{orgName}/createProject")
    public DataturksEndpoint.DummyResponse createProject(@NotNull @HeaderParam("secret") String token,
                                                         @NotNull @HeaderParam("key") String key,
                                                         @NotNull @PathParam("orgName") String orgName,
                                                         @NotNull Map<String,String> req) {
        EventsLogger.logEvent("d_API_newProject");

        String id = Validations.validateAPIAccessGetUidElseThrowException(key, token);

        String regStr = "API_createProject: " +  req.toString();
        LOG.info(regStr);

        try {
            //we need to fix the req object as the format is different than what we use for internal APIs.
            if (req != null && req.containsKey("tags") && req.get("tags") != null) {
                String instructions = null;
                if (req.containsKey("instructions")) {
                    instructions = req.get("instructions");
                }

                try {
                    ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
                    JsonNode rootNode = mapper.createObjectNode();
                    //add notes.
                    ((ObjectNode) rootNode).put("tags", req.get("tags"));
                    ((ObjectNode) rootNode).put("instructions", instructions);

                    req.put("rules", mapper.writeValueAsString(rootNode));
                }
                catch (Exception e) {
                    throw new WebApplicationException("Invalid tags in request", Response.Status.BAD_REQUEST);
                }
            }

            DReqObj reqObj = new DReqObj(id, req);
            DataturksEndpoint.DummyResponse response = DataturksEndpoint.createProjectInternal(reqObj);

            //invalidate the cache for the user.
            CacheWrapper.updateProjectCreateDelete(reqObj, reqObj.getOrgId());

            //don't return id.
            response.setResponse("OK");
            return response;
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_API_newProjectError");
            EmailSender.sendEventMail("Dataturks API errors: Create project", "uid = " + id + "\n Reg: = " + req.toString() +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/{version}/{orgName}/{projectName}/updateProject")
    public DataturksEndpoint.DummyResponse updateProject(@NotNull @HeaderParam("secret") String token,
                                                         @NotNull @HeaderParam("key") String key,
                                                         @NotNull @PathParam("orgName") String orgName,
                                                         @NotNull @PathParam("projectName") String projectName,
                                                         @NotNull Map<String,String> req) {

        EventsLogger.logEvent("d_API_updateProject");

        String id = Validations.validateAPIAccessGetUidElseThrowException(key, token);

        String regStr = "API updateProject: " +  projectName;
        LOG.info(regStr);

        try {
            String projectId = getProjectByOrgName(orgName, projectName);
            DReqObj reqObj = new DReqObj(id, req);
            DataturksEndpoint.DummyResponse response =  DataturksEndpoint.updateProjectInternal(projectId, reqObj);

            //invalidate the cache for the user.
            CacheWrapper.updateProjectCreateDelete(reqObj, reqObj.getOrgId());
            return response;
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_APIupdateProjectError");
            EmailSender.sendEventMail("Dataturks API errors: update project", "uid = " + id +
                    "projectName = " + projectName + "\n Reg: = "  + regStr +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/{version}/{orgName}/{projectName}/deleteProject")
    public DataturksEndpoint.DummyResponse deleteProject(@NotNull @HeaderParam("secret") String token,
                                                         @NotNull @HeaderParam("key") String key,
                                                         @NotNull @PathParam("orgName") String orgName,
                                                         @NotNull @PathParam("projectName") String projectName) {

        EventsLogger.logEvent("d_API_deleteProject");

        String id = Validations.validateAPIAccessGetUidElseThrowException(key, token);

        String regStr = "API deleteProject: " +  projectName;
        LOG.info(regStr);

        try {
            String projectId = getProjectByOrgName(orgName, projectName);
            DReqObj reqObj = new DReqObj(id);
            DataturksEndpoint.DummyResponse response =  DataturksEndpoint.deleteProjectInternal(projectId, reqObj);

            //invalidate the cache for the user.
            CacheWrapper.updateProjectCreateDelete(reqObj, reqObj.getOrgId());
            return response;
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_APIdeleteProjectError");
            EmailSender.sendEventMail("Dataturks API errors: delete project", "uid = " + id +
                    "projectName = " + projectName + "\n Reg: = "  +
                    "\n" + "error = " + e.toString());
            throw e;
        }
    }

    @POST
    @Path("/{version}/{orgName}/{projectName}/getProjectDetails")
    public ProjectDetails getProjectDetails(@NotNull @HeaderParam("secret") String token,
                                            @NotNull @HeaderParam("key") String key,
                                            @NotNull @PathParam("orgName") String orgName,
                                            @NotNull @PathParam("projectName") String projectName) {

        String id = Validations.validateAPIAccessGetUidElseThrowException(key, token);

        String reqLogStr = "API_getProjectDetails: project= " +  projectName  + " uid = " + id;
        LOG.info(reqLogStr);


        try {
            String projectId = getProjectByOrgName(orgName, projectName);
            DReqObj reqObj = new DReqObj(id, null);
            ProjectDetails details = DataturksEndpoint.getProjectDetailsInternal(reqObj, projectId);
            maskInternalDetails(details);
            return details;
        }
        catch (Exception e) {
            LOG.error("Error " + reqLogStr + e.toString());
            EventsLogger.logErrorEvent("d_APIgetProjectDetailsError");
            throw e;
        }
    }



    @POST
    @Path("/{version}/{orgName}/{projectName}/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public UploadResponse fileUpload(@NotNull @HeaderParam("secret") String token,
                                     @NotNull @HeaderParam("key") String key,
                                     @NotNull @PathParam("orgName") String orgName,
                                     @NotNull @PathParam("projectName") String projectName,
                                     @NotNull @FormDataParam("file") InputStream stream,
                                     @FormDataParam("file") FormDataContentDisposition fileDetail,
                                     @QueryParam("format") String uploadFormat,
                                     @QueryParam("itemStatus") String itemStatus) {

        EventsLogger.logEvent("d_API_projectFileUpload");

        String id = Validations.validateAPIAccessGetUidElseThrowException(key, token);


        String regStr = "API_projectFileUpload: orgName = " + orgName + " projectName = " +  projectName + " filename = " + fileDetail.getFileName() + " uid = " + id;
        LOG.info(regStr);


        try {
            String projectId = getProjectByOrgName(orgName, projectName);
            DReqObj reqObj = new DReqObj(id, null);

            //handle if upload format specified.
            if (uploadFormat != null) {
                Map<String, String> reqMap = new HashMap<>();
                reqMap.put(DConstants.UPLOAD_FORMAT_PARAM_NAME, uploadFormat);
                if (itemStatus != null) {
                    reqMap.put(DConstants.UPLOAD_DATA_STATUS_PARAM_NAME, itemStatus);
                }
                reqObj.setReqMap(reqMap);
            }


            UploadResponse response = DataturksEndpoint.handleFileUpload(reqObj, projectId, stream, fileDetail);

            EventsLogger.logEventLine("New file upload:" + regStr +
                    "\n\n"  + " Number of records created = " + response.getNumHitsCreated() +
                    "\n\n" + " Number of records ignored = " + response.getNumHitsIgnored() +
                    "\n\n" + " File size (KB) = " + response.getTotalUploadSizeInBytes()/1024);

            return response;
        }
        catch (Exception e) {
            LOG.error("Error "+ regStr + e.toString() + " " + CommonUtils.getStackTraceString(e));
            EventsLogger.logErrorEvent("d_API_projectFileUploadError");
            EmailSender.sendEventMail("Dataturks API errors:", regStr +
                    "\n" + "error = " + e.toString());

            throw e;
        }

    }

    @POST
    @Path("/{version}/{orgName}/{projectName}/download")
    @Produces(MediaType.APPLICATION_OCTET_STREAM + ";charset=utf-8")
    public Response downloadData(@NotNull @HeaderParam("secret") String token,
                                 @NotNull @HeaderParam("key") String key,
                                 @NotNull @PathParam("orgName") String orgName,
                                 @NotNull @PathParam("projectName") String projectName,
                                 @QueryParam("items") String items,
                                 @QueryParam("format") String format) {

        EventsLogger.logEvent("d_APIdownloadData");

        String id = Validations.validateAPIAccessGetUidElseThrowException(key, token);

        String regStr = "APIdownloadData: orgName = " + orgName + " projectName = " +  projectName +  " uid = " + id;
        LOG.info(regStr);

        try {
            String projectId = getProjectByOrgName(orgName, projectName);
            DReqObj reqObj = new DReqObj(id, null);
            return DataturksEndpoint.handleDataDownload(reqObj, projectId, items, format);
        }
        catch (Exception e) {
            LOG.error("Error " + regStr + e.toString());
            EventsLogger.logErrorEvent("d_APIdownloadDatadError");
            EmailSender.sendEventMail("Dataturks API errors: download", "uid = " + id  + "orgName = " + orgName + " projectName = " +  projectName +
                    "\n" + "error = " + e.toString());

            throw e;
        }

    }

    @POST
    @Path("/{version}/{orgName}/{projectName}/uploadImage")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    public DataturksEndpoint.DummyResponse fileUpload(@NotNull @HeaderParam("secret") String token,
                                                      @NotNull @HeaderParam("key") String key,
                                                      @NotNull @PathParam("orgName") String orgName,
                                                      @NotNull @PathParam("projectName") String projectName,
                                                      @NotNull @FormDataParam("file") InputStream stream,
                                                      @FormDataParam("file") FormDataContentDisposition fileDetail) {

        EventsLogger.logEvent("d_API_projectFileUploadImage");

        String id = Validations.validateAPIAccessGetUidElseThrowException(key, token);


        String regStr = "d_API_projectFileUploadImage:  " + " filename = " + fileDetail.getFileName() + " uid = " + id;
        LOG.info(regStr);

        String uploadedFile = null;

        try {

            DReqObj reqObj = new DReqObj(id, null);
            // get the config for the org.
            DUtils.setConfigForOrg(reqObj);

            DProjects project = DUtils.getProjectByOrgName(orgName, projectName);
            uploadedFile = UploadFileUtil.uploadStreamToFile(reqObj, stream, fileDetail);

            String url = S3Handler.uploadAndGetURL(uploadedFile, project);
            if (url == null) {
                throw new WebApplicationException("Unable to upload the file, some internal error occurred.", Response.Status.BAD_GATEWAY);
            }
            return new DataturksEndpoint.DummyResponse(url);
        }
        catch (Exception e) {
            LOG.error("Error "+ regStr + e.toString() + " " + CommonUtils.getStackTraceString(e));
            EventsLogger.logErrorEvent("d_API_projectFileUploadImage");
            EmailSender.sendEventMail("Dataturks API errors:", regStr +
                    "\n" + "error = " + e.toString());

            throw e;
        }
        finally {
            //delete the temp file.
            if (uploadedFile != null) {
                try {
                    File file = new File(uploadedFile);
                    file.delete();
                }
                catch (Exception e) {
                    //do nothing
                }
            }
        }

    }


    private static String getProjectByOrgName(String orgName, String projectName) {
        if (orgName ==null || orgName.isEmpty()) {
            throw new WebApplicationException("Bad org name", Response.Status.BAD_REQUEST);
        }

        if (projectName ==null || projectName.isEmpty()) {
            throw new WebApplicationException("Bad project name", Response.Status.BAD_REQUEST);
        }

        DProjects project = DUtils.getProjectByOrgName(orgName, projectName);
        if (project == null) {
            throw new WebApplicationException("No such project found.", Response.Status.BAD_REQUEST);
        }

        return project.getId();
    }

    private static void maskInternalDetails(ProjectDetails details) {
        if (details != null) {
            details.setOrgId("0");
            details.setId("0");
            details.setPermissions(null);
            for (ContributorDetails contributorDetail : details.getContributorDetails()) {
                UserDetails userDetails = contributorDetail.getUserDetails();
                userDetails.setUid(userDetails.getFirstName() + " " + userDetails.getSecondName());
            }
        }
    }
}
