package dataturks;

import bonsai.Utils.CommonUtils;
import bonsai.Utils.UploadFileUtil;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DHits;
import bonsai.dropwizard.dao.d.DHitsResult;
import bonsai.dropwizard.dao.d.DProjects;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import dataturks.aws.S3Handler;
import dataturks.response.UploadResponse;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// Make sure the file is of proper type.
// process file for creating hits.
public class DataUploadHandler {
    private static final Logger LOG = LoggerFactory.getLogger(DataUploadHandler.class);

    public static UploadResponse handlePOSTagging(DReqObj reqObj, DProjects project, String filePath) {
        return handleTextTasks(reqObj, project, filePath);
    }

    public static UploadResponse handlePOSTaggingGeneric(DReqObj reqObj, DProjects project, String filePath) {
        return handleTextTasks(reqObj, project, filePath);
    }

    public static UploadResponse handleTextClassification(DReqObj reqObj, DProjects project, String filePath) {
        return handleTextClassificationZIPSingleFile(reqObj, project, filePath);
    }

    public static UploadResponse handleTextSummarization(DReqObj reqObj, DProjects project, String filePath) {
        return handleTextClassificationZIPSingleFile(reqObj, project, filePath);
    }

    public static UploadResponse handleTextModeration(DReqObj reqObj, DProjects project, String filePath) {
        return handleTextClassificationZIPSingleFile(reqObj, project, filePath);
    }

    //if zip, each file is one record, if file then each line is a record.
    private static UploadResponse handleTextClassificationZIPSingleFile(DReqObj reqObj, DProjects project, String filePath) {
        DTypes.File_Type type = UploadFileUtil.getFileType(filePath);
        if (type == DTypes.File_Type.IMAGE) {
            throw new WebApplicationException("Image file not supported for text tasks. Please upload a valid text/pdf/doc/zip file.", Response.Status.BAD_REQUEST);
        }

        //each file becomes one record.
        if (type == DTypes.File_Type.ZIP || type == DTypes.File_Type.TAR || type == DTypes.File_Type.GZIP) {
            return handleDocumentAnnotationZip(reqObj, project, filePath);
        }
        else { //each line becomes one record.
            return handleTextTasks(reqObj, project, filePath);
        }
    }

    public static UploadResponse handleDocumentAnnotation(DReqObj reqObj, DProjects project, String filePath) {
        DTypes.File_Type type = UploadFileUtil.getFileType(filePath);
        if (type == DTypes.File_Type.IMAGE) {
            throw new WebApplicationException("Image file not supported for text tasks. Please upload a valid text/pdf/doc/zip file.", Response.Status.BAD_REQUEST);
        }

        if (type == DTypes.File_Type.ZIP || type == DTypes.File_Type.TAR || type == DTypes.File_Type.GZIP) {
            return handleDocumentAnnotationZip(reqObj, project, filePath);
        }
        else {
            return handleDocumentAnnotationSingleFile(reqObj, project, filePath);
        }
    }

    // the passed file is a zip or tar.
    private static UploadResponse handleDocumentAnnotationZip(DReqObj reqObj, DProjects project, String filePath) {
        UploadResponse response = new UploadResponse();
        String unzipDir = UploadFileUtil.getRandomUploadPath(null);
        try {
            List<String> files = UploadFileUtil.getAllFilesFromArchive(filePath, unzipDir);
            if (files == null || files.isEmpty()) {
                throw new WebApplicationException("Please upload a valid zip (.zip) file.", Response.Status.BAD_REQUEST);
            }

            for (String file : files) {
                if (handleDocumentAnnotationSingleFileInternal(reqObj, project, file)) {
                    response.incrementHits();
                }
                else {
                    response.incrementIgnored();
                }

            }
            response.setTotalUploadSizeInBytes(UploadFileUtil.getFileSize(filePath));
        }
        finally {
            try {
                FileUtils.deleteDirectory(new File(unzipDir));
            }
            catch (Exception e) {
                LOG.error("Unable to delete unzip directory " + unzipDir + " created for project " + project.getId() + " error = " + e.toString());
            }
        }
        return response;
    }

    private static UploadResponse handleDocumentAnnotationSingleFile(DReqObj reqObj, DProjects project, String filePath) {
        UploadResponse response =null;
        //when json is uploaded.
        if (reqObj.getUploadFileType() == DTypes.File_Upload_Format.PRE_TAGGED_JSON) {
            response = handleTasksWithPreTaggedJSONFile(reqObj, project, filePath);
            return response;
        }
        if (reqObj.getUploadFileType() == DTypes.File_Upload_Format.URL_FILE) {
            response = handleTasksWithTextFileWithURLs(reqObj, project, filePath);
            return response;
        }

        boolean status = handleDocumentAnnotationSingleFileInternal(reqObj, project, filePath);
        if (!status) {
            if (!Validations.isValidDataItemFromFileForTextTask(filePath, reqObj)) {
                throw new WebApplicationException("The file is too big, max characters allowed = " + reqObj.getConfigs().maxHitDataLength + " .(for document annotation, entire file is displayed as one data-item, if you want each line to become one data-item, please create a 'NER tagging' project)", Response.Status.BAD_REQUEST);

            }
            throw new WebApplicationException("Unable to create data item, uploaded file not a valid text/pdf/doc file.", Response.Status.BAD_REQUEST);

        }
        response = new UploadResponse();
        response.incrementHits();
        return response;
    }

    private static boolean handleDocumentAnnotationSingleFileInternal(DReqObj reqObj, DProjects project, String filePath) {
        boolean status = false;
        try {
            String content = UploadFileUtil.readText(filePath);
            if(createHitWithContent(reqObj, project, content, false, false) != null) {
                status = true;
            }
        }
        catch (Exception e) {
            LOG.error("handleDocumentAnnotationSingleFile for project " + project.getId() + " file= " + filePath + " Error: " + e.toString());
        }
        return status;
    }

    // given the contents and status of a hit, create it.
    private static String createHitWithContent(DReqObj reqObj, DProjects project, String content, boolean hitStatus, boolean isURL) {

        if (Validations.isValidDataItemForTextTask(content, reqObj)) {
            DHits hits = new DHits(project.getId(), content);
            if (hitStatus) hits.setStatus(DConstants.HIT_STATUS_DONE);
            if (isURL) hits.setURL(true);
            String hitIdStr = AppConfig.getInstance().getdHitsDAO().createInternal(hits);
            return hitIdStr;
        }
        return null;
    }

    public static UploadResponse handleImageClassification(DReqObj reqObj, DProjects project, String filePath) {
        return handleImageTasks(reqObj, project, filePath);
    }

    public static UploadResponse handleImageBoundingBox(DReqObj reqObj, DProjects project, String filePath) {
        return handleImageTasks(reqObj, project, filePath);
    }

    public static UploadResponse handleImagePolygonBoundingBox(DReqObj reqObj, DProjects project, String filePath) {
        return handleImageTasks(reqObj, project, filePath);
    }


    private static UploadResponse handleTasksWithPreTaggedJSONFile(DReqObj reqObj, DProjects project, String filePath) {
        UploadResponse response = new UploadResponse();

        List<String> lines = null;
        try {
            lines = Arrays.asList(UploadFileUtil.readPreTaggedFromText(filePath).split("\n"));
        }
        catch (Exception e) {
            throw new WebApplicationException("Please upload a valid text file where each line is an JSON.", Response.Status.BAD_REQUEST);
        }

        for (String line : lines) {
            if (line.trim().isEmpty()) continue;

            if (response.getNumHitsCreated() > reqObj.configs.getNumHitsPerProject()) {
                break;
            }

            boolean isHitAdded = false;
            boolean hitResultAdded = false;
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            String dataItemStatus = reqObj.getUploadDataItemStatus();
            dataItemStatus = dataItemStatus == null? DConstants.HIT_STATUS_SKIPPED : dataItemStatus; //for auto-uploaded results we add it as skipped.

            try {

                JsonNode node = mapper.readTree(line);
                String hitData = node.get("content").textValue();
                String hitResultData = null;
                String hitExtras = null;

                if (node.has("annotation") &&
                        !(node.get("annotation") instanceof com.fasterxml.jackson.databind.node.NullNode)) {
                    hitResultData = mapper.writeValueAsString(node.get("annotation"));
                }

                if (node.has("extras") &&
                        !(node.get("extras") instanceof com.fasterxml.jackson.databind.node.NullNode)) {
                    hitExtras = mapper.writeValueAsString(node.get("extras"));
                }

                if (node.has("metadata") &&
                        !(node.get("metadata") instanceof com.fasterxml.jackson.databind.node.NullNode) &&
                        node.get("metadata").has("status")) {
                    dataItemStatus = node.get("metadata").get("status").textValue();
                }

                if (Validations.isValidDataItemForTextTask(hitData, reqObj)) {

                    DHits hit = new DHits(project.getId(), hitData, hitExtras);
                    String hitIdStr = AppConfig.getInstance().getdHitsDAO().createInternal(hit);
                    isHitAdded = true;

                    //update the result.
                    if (hitResultData != null) {
                        long hitId = Long.parseLong(hitIdStr);
                        DHitsResult hitsResult = new DHitsResult(hitId, project.getId(), reqObj.getUid());
                        hitsResult.setResult(hitResultData);
                        AppConfig.getInstance().getdHitsResultDAO().saveOrUpdateInternal(hitsResult);
                        //update the hit status.
                        DHits hitAdded =  AppConfig.getInstance().getdHitsDAO().findByIdInternal(hitId);
                        hitAdded.setStatus(dataItemStatus);
                        AppConfig.getInstance().getdHitsDAO().saveOrUpdateInternal(hitAdded);

                        hitResultAdded = true;
                    }

                }
            }
            catch (Exception e) {
                LOG.error("Error adding hit for project " + project.getName());
            }

            if (isHitAdded) {
                response.incrementHits();
                response.incrementSize(line.length());
            }
            else response.incrementIgnored();

            if (hitResultAdded) {
                response.incrementHitResults();
            }
        }

        return response;
    }

    //
    // only supported for TEXT_CLASSIFICATION, TEXT_SUMMARIZATION, IMAGE_CLASSIFICATION.
    // expected file format: data TAB comma-separated classes  extra1(key=value)  extra2 etc
    // to create hit result JSON: hit result format for both image and text classification is
    // {"labels":["Unclear", "Unknown"],"note":"not enough context?"}
    //
    private static UploadResponse handleTasksWithPreTaggedTSVFile(DReqObj reqObj, DProjects project, String filePath) {
        DTypes.Project_Task_Type taskType = project.getTaskType();
        if (!(taskType == DTypes.Project_Task_Type.IMAGE_CLASSIFICATION ||
                taskType == DTypes.Project_Task_Type.TEXT_CLASSIFICATION||
                taskType == DTypes.Project_Task_Type.TEXT_MODERATION||
                taskType == DTypes.Project_Task_Type.TEXT_SUMMARIZATION)) {

            throw new  WebApplicationException("TSV file upload not supported for " + taskType.toString() + ", please upload pre-tagged JSON for this project.", Response.Status.BAD_REQUEST);

        }

        //both classifications have json datatype and both text summarization has normal result text.
        boolean isResultJSON = true;
        if (taskType == DTypes.Project_Task_Type.TEXT_MODERATION||
                taskType == DTypes.Project_Task_Type.TEXT_SUMMARIZATION) {
            isResultJSON = false;
        }

        UploadResponse response = new UploadResponse();

        List<String> lines = null;
        try {
            lines = Arrays.asList(UploadFileUtil.readPreTaggedFromText(filePath).split("\n"));
        }
        catch (Exception e) {
            throw new WebApplicationException("Please upload a valid text file where each line is an TSV (tab separated) record.", Response.Status.BAD_REQUEST);
        }

        for (String line : lines) {
            line = line.trim();
            String[] lineColumns = line.split("\t");
            if (lineColumns.length < 2) continue;

            String hitData = lineColumns[0].trim();
            String labelsStr = lineColumns[1].trim();


            if (response.getNumHitsCreated() > reqObj.configs.getNumHitsPerProject()) {
                break;
            }

            boolean isHitAdded = false;
            boolean hitResultAdded = false;
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            String dataItemStatus = reqObj.getUploadDataItemStatus();
            dataItemStatus = dataItemStatus == null? DConstants.HIT_STATUS_SKIPPED : dataItemStatus; //for auto-uploaded results we add it as skipped.

            try {
                String hitExtras = null;
                String hitResultData = null;

                //create JSON for HIT Result.
                if (isResultJSON) {
                    JsonNode rootNode = mapper.createObjectNode();
                    //add notes.
                    ((ObjectNode) rootNode).put("notes", "");
                    //add labels.
                    String[] labels = labelsStr.split(",");
                    ArrayNode labelsArrayNode = ((ObjectNode) rootNode).putArray("labels");
                    for (String label : labels) {
                        labelsArrayNode.add(label.trim());
                    }
                    hitResultData = mapper.writeValueAsString(rootNode);
                }
                else {
                    hitResultData = labelsStr;
                }

                //has extras?
                if (lineColumns.length > 2) {
                    JsonNode rootNode = mapper.createObjectNode();
                    for (int i = 2; i < lineColumns.length; i++) {
                        String keyValueStr = lineColumns[i].trim();
                        String[] parts = keyValueStr.split("=");
                        if (parts.length == 2) {
                            //add key-value.
                            ((ObjectNode) rootNode).put(parts[0], parts[1]);
                        }
                    }
                    hitExtras = mapper.writeValueAsString(rootNode);
                }

                if (Validations.isValidDataItemForTextTask(hitData, reqObj)) {

                    DHits hit = new DHits(project.getId(), hitData, hitExtras);
                    String hitIdStr = AppConfig.getInstance().getdHitsDAO().createInternal(hit);
                    isHitAdded = true;

                    //update the result.
                    if (hitResultData != null) {
                        long hitId = Long.parseLong(hitIdStr);
                        DHitsResult hitsResult = new DHitsResult(hitId, project.getId(), reqObj.getUid());
                        hitsResult.setResult(hitResultData);
                        AppConfig.getInstance().getdHitsResultDAO().saveOrUpdateInternal(hitsResult);
                        //update the hit status.
                        DHits hitAdded =  AppConfig.getInstance().getdHitsDAO().findByIdInternal(hitId);
                        hitAdded.setStatus(dataItemStatus);
                        AppConfig.getInstance().getdHitsDAO().saveOrUpdateInternal(hitAdded);

                        hitResultAdded = true;
                    }

                }
            }
            catch (Exception e) {
                LOG.error("Error adding hit for project " + project.getName());
            }

            if (isHitAdded) {
                response.incrementHits();
                response.incrementSize(line.length());
            }
            else response.incrementIgnored();

            if (hitResultAdded) {
                response.incrementHitResults();
            }
        }

        return response;
    }


    private static UploadResponse handleTextTasks(DReqObj reqObj, DProjects project, String filePath) {
        UploadResponse response = null;

        //when json is uploaded.
        if (reqObj.getUploadFileType() == DTypes.File_Upload_Format.PRE_TAGGED_JSON) {
            response = handleTasksWithPreTaggedJSONFile(reqObj, project, filePath);
            return response;
        }
        if (reqObj.getUploadFileType() == DTypes.File_Upload_Format.PRE_TAGGED_TSV) {
            response = handleTasksWithPreTaggedTSVFile(reqObj, project, filePath);
            return response;
        }

        if (reqObj.getUploadFileType() == DTypes.File_Upload_Format.URL_FILE) {
            response = handleTasksWithTextFileWithURLs(reqObj, project, filePath);
            return response;
        }

        List<String> lines = null;
        try {
            lines = Arrays.asList(UploadFileUtil.readText(filePath).split("\n"));
        }
        catch (Exception e) {
            throw new WebApplicationException("Please upload a valid text/pdf/doc file.", Response.Status.BAD_REQUEST);
        }
        response = new UploadResponse();
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            if (response.getNumHitsCreated() > reqObj.configs.getNumHitsPerProject()) {
                break;
            }

            boolean isHitAdded = false;
            try {
                String input = line;

                if (Validations.isValidDataItemForTextTask(input, reqObj)) {
                    DHits hit = new DHits(project.getId(), input);
                    String hitIdStr = AppConfig.getInstance().getdHitsDAO().createInternal(hit);
                    isHitAdded = true;
                }
            }
            catch (Exception e) {
                LOG.error("Error adding hit for project " + project.getName());
            }

            if (isHitAdded) {
                response.incrementHits();
                response.incrementSize(line.length());
            }
            else response.incrementIgnored();
        }

        return response;
    }


    //TODO: For a text file, it might have a json of pre-existing annotations, handle that as well
    private static UploadResponse handleTasksWithTextFileWithURLs(DReqObj reqObj, DProjects project, String filePath) {
        DTypes.File_Type type = UploadFileUtil.getFileType(filePath);
        if (type == DTypes.File_Type.TEXT) {
            List<String> urls = CommonUtils.readAllLines(filePath);
            return handleTasksWithURLs(reqObj, project, urls);
        }
        else {
            throw new WebApplicationException("Please upload a txt file containing URLs to data files in each line.", Response.Status.BAD_REQUEST);
        }
    }

    private static UploadResponse handleTasksWithURLs(DReqObj reqObj, DProjects project, List<String> urls) {
        UploadResponse response = new UploadResponse();
        boolean shouldValidateUrl = DBBasedConfigs.getConfig("dDoURLValidations", Boolean.class, true);
        if (urls != null && !urls.isEmpty()) {
            for (String url : urls) {
                url = url.trim();
                if (shouldValidateUrl && !DUtils.isValidURL(url)) {
                    continue;
                }

                if (response.getNumHitsCreated() > reqObj.configs.getNumHitsPerProject()) {
                    break;
                }

                try {
                    if (createHitWithContent(reqObj, project, url, false, true) != null) {
                        response.incrementHits();
                    }
                    else {
                        response.incrementIgnored();
                    }
                } catch (Exception e) {
                    LOG.error("handleImageTasksWithURLs for project " + project.getId() + " url= " + url + " Error: " + e.toString());
                }
            }
        }

        if (response.getNumHitsCreated() == 0) {
            throw new WebApplicationException("Please upload a txt file containing only URLs in each line.", Response.Status.BAD_REQUEST);
        }

        return response;
    }

    private static UploadResponse handleImageTasksWithSingleImageFile(DReqObj reqObj, DProjects project, String filePath) {
        if (!DBBasedConfigs.isImageUploadAllowed()) {
            throw new WebApplicationException("Please upload a txt file containing only URLs in each line.", Response.Status.BAD_REQUEST);
        }

        List<String> urls = new ArrayList<>();
        String url = DataStorageHandler.uploadAndGetURL(filePath, project);
        if (url == null) {
            throw new WebApplicationException("Unable to upload the file, some internal error occurred.", Response.Status.BAD_GATEWAY);
        }

        urls.add(url);
        return handleTasksWithURLs(reqObj, project, urls);
    }

    // the passed file is a zip or tar.
    private static UploadResponse handleImageTasksZip(DReqObj reqObj, DProjects project, String filePath) {
        if (!DBBasedConfigs.isImageUploadAllowed()) {
            throw new WebApplicationException("Please upload a txt file containing only URLs in each line.", Response.Status.BAD_REQUEST);
        }

        String unzipDir = UploadFileUtil.getRandomUploadPath(null);
        try {
            List<String> files = UploadFileUtil.getAllFilesFromArchive(filePath, unzipDir);
            if (files == null || files.isEmpty()) {
                throw new WebApplicationException("Please upload a valid zip (.zip) file.", Response.Status.BAD_REQUEST);
            }

            List<String> imageFiles = UploadFileUtil.filterOnlyImageFiles(files);
            //upload all the image files to s3 and get their urls.
            List<String> urls = DataStorageHandler.uploadAndGetURLs(imageFiles, project);
            UploadResponse response =  handleTasksWithURLs(reqObj, project, urls);

            //update the files which were not uploaded.
            if (response != null) {
                int filesIgnored = imageFiles.size() - urls.size();
                response.setNumHitsIgnored(response.getNumHitsIgnored() + filesIgnored);
            }
            return response;
        }
        finally {
            try {
                FileUtils.deleteDirectory(new File(unzipDir));
            }
            catch (Exception e) {
                LOG.error("Unable to delete unzip directory " + unzipDir + " created for project " + project.getId() + " error = " + e.toString());
            }
        }
    }


    public static UploadResponse handleVideoTasks(DReqObj reqObj, DProjects project, String filePath) {
        DTypes.File_Type type = UploadFileUtil.getFileType(filePath);
        if (type == DTypes.File_Type.TEXT){
            return handleTasksWithTextFileWithURLs(reqObj, project, filePath);
        }
        else {
            throw new WebApplicationException("Please upload a valid text file containing Video URLs.", Response.Status.BAD_REQUEST);
        }
    }


    //for now we are just taking urls as input.
    private static UploadResponse handleImageTasks(DReqObj reqObj, DProjects project, String filePath) {

        UploadResponse response =null;
        //when json is uploaded.
        if (reqObj.getUploadFileType() == DTypes.File_Upload_Format.PRE_TAGGED_JSON) {
            response = handleTasksWithPreTaggedJSONFile(reqObj, project, filePath);
            return response;
        }
        if (reqObj.getUploadFileType() == DTypes.File_Upload_Format.PRE_TAGGED_TSV) {
            response = handleTasksWithPreTaggedTSVFile(reqObj, project, filePath);
            return response;
        }

        DTypes.File_Type type = UploadFileUtil.getFileType(filePath);

        if (type == DTypes.File_Type.IMAGE) {
            return handleImageTasksWithSingleImageFile(reqObj, project, filePath);
        }
        else if (type == DTypes.File_Type.ZIP || type == DTypes.File_Type.TAR || type == DTypes.File_Type.GZIP) {
            return handleImageTasksZip(reqObj, project, filePath);
        }
        else if (type == DTypes.File_Type.TEXT){
            return handleTasksWithTextFileWithURLs(reqObj, project, filePath);
        }
        else {
            throw new WebApplicationException("Please upload a valid image/zip file or a text file containing image URLs.", Response.Status.BAD_REQUEST);
        }
    }



}
