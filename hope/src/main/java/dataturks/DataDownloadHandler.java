package dataturks;

import bonsai.Constants;
import bonsai.Utils.CommonUtils;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DHits;
import bonsai.dropwizard.dao.d.DHitsResult;
import bonsai.dropwizard.dao.d.DProjects;
import com.fasterxml.jackson.core.io.JsonStringEncoder;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import dataturks.response.UploadResponse;
import netscape.javascript.JSObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.util.*;

public class DataDownloadHandler {
    private static JsonStringEncoder e = JsonStringEncoder.getInstance();

    private static final Logger LOG = LoggerFactory.getLogger(DataDownloadHandler.class);

    public static String handlePOSTagging(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType,  DTypes.File_Download_Format format) {
        return handlePOSTypes(reqObj, project, downloadType, format);
    }

    public static String handlePOSTaggingGeneric(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType,  DTypes.File_Download_Format format) {
        return handlePOSTypes(reqObj, project, downloadType, format);
    }

    public static String handleTextClassification(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleJsonDownload(reqObj, project, downloadType);
    }

    public static String handleTextSummarization(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleForTextTypes(reqObj, project, downloadType);
    }

    public static String handleTextModeration(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleForTextTypes(reqObj, project, downloadType);
    }

    public static String handleDocumentAnnotation(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType,  DTypes.File_Download_Format format) {
        return handlePOSTypes(reqObj, project, downloadType, format);
    }

    public static String handleImageClassification(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleForImageTypes(reqObj, project, downloadType);
    }

    public static String handleImageBoundingBox(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleForImageTypes(reqObj, project, downloadType);
    }

    public static String handleImagePolygonBoundingBox(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleForImageTypes(reqObj, project, downloadType);
    }

    private static String handleForImageTypes(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleJsonDownload(reqObj, project, downloadType);
    }

    public static String handleVideoClassification(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleForImageTypes(reqObj, project, downloadType);
    }

    public static String handleVideoBoundingBox(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleForImageTypes(reqObj, project, downloadType);
    }

    private static String handleForVideoTypes(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        return handleJsonDownload(reqObj, project, downloadType);
    }



    private static String handlePOSTypes(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType, DTypes.File_Download_Format format) {
        if (format == DTypes.File_Download_Format.STANFORD_NER) {

            return DataDownloadHelper.handleStanfordDownload(reqObj, project);
        }
        else {
            return handleJsonDownload(reqObj, project, downloadType);
        }
    }

    private static String handleForTextTypes(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {

        List<DHits> hits = AppConfig.getInstance().getdHitsDAO().findAllByProjectIdInternal(project.getId());
        List<DHitsResult> results = AppConfig.getInstance().getdHitsResultDAO().findAllByProjectIdInternal(project.getId());

        Map<Long, DHitsResult> hitsResultMap = new HashMap<>();
        for (DHitsResult result : results) {
            hitsResultMap.put(result.getHitId(), result);
        }

        List<String> lines = new ArrayList<>();
        lines.add("input"+ DConstants.TEXT_INPUT_RESULT_SEPARATOR  + "result");
        //get all hit/hit id pairs.
        for (DHits hit : hits) {
            if (DConstants.HIT_STATUS_DONE.equalsIgnoreCase(hit.getStatus()) && hitsResultMap.containsKey(hit.getId())) {
                lines.add(hit.getData() + DConstants.TEXT_INPUT_RESULT_SEPARATOR  + hitsResultMap.get(hit.getId()).getResult());
            }

            else if (downloadType == DTypes.File_Download_Type.ALL) {
                //in case of skipped, we might have some result.
                String resultData = hitsResultMap.containsKey(hit.getId())? hitsResultMap.get(hit.getId()).getResult(): "";
                lines.add(hit.getData() + DConstants.TEXT_INPUT_RESULT_SEPARATOR  + resultData);
            }
        }

        String filePath = DataDownloadHelper.outputToTempFile(lines, project.getName() + ".tsv");
        return filePath;

    }

    private static String handleJsonDownload(DReqObj reqObj, DProjects project, DTypes.File_Download_Type downloadType) {
        List<DHits> hits = AppConfig.getInstance().getdHitsDAO().findAllByProjectIdInternal(project.getId());
        List<DHitsResult> results = AppConfig.getInstance().getdHitsResultDAO().findAllByProjectIdInternal(project.getId());

        Map<Long, DHitsResult> hitsResultMap = new HashMap<>();
        for (DHitsResult result : results) {
            hitsResultMap.put(result.getHitId(), result);
        }
        List<String> lines = new ArrayList<>();

        boolean isPaidProject = Validations.isPaidPlanProject(project);

        //get all hit/hit id pairs.
        for (DHits hit : hits) {
            if (DConstants.HIT_STATUS_DONE.equalsIgnoreCase(hit.getStatus())  && hitsResultMap.containsKey(hit.getId())) {
                lines.add(formatAsJson(project, hit, hitsResultMap.get(hit.getId()), isPaidProject));
            }
            else if (downloadType == DTypes.File_Download_Type.ALL) {
                //in case of skipped, we might have some result.
                DHitsResult result = hitsResultMap.containsKey(hit.getId())? hitsResultMap.get(hit.getId()): null;
                lines.add(formatAsJson(project, hit, result, isPaidProject));
            }
        }
        String filePath = DataDownloadHelper.outputToTempFile(lines, project.getName() + ".json");
        return filePath;
    }

    private static String formatAsJson(DProjects project, DHits hit, DHitsResult result, boolean isPaidPlanProject) {
        String resultJson = result != null ? result.getResult() : "";
        //for image classification, old hit results may not have a wellformed json in result
        // fix that.
        if (DTypes.Project_Task_Type.IMAGE_CLASSIFICATION == project.getTaskType()) {
            resultJson = DataDownloadHelper.fixImageClassificationResultJson(resultJson);
        }
        else if (DTypes.Project_Task_Type.TEXT_CLASSIFICATION == project.getTaskType()) {
            resultJson = DataDownloadHelper.fixImageClassificationResultJson(resultJson);
        }
        else if (DTypes.Project_Task_Type.POS_TAGGING == project.getTaskType()) {
            resultJson = DataDownloadHelper.convertPoSToJson(resultJson);
        }


        return DataDownloadHelper.formatAsJson(hit, result, resultJson, isPaidPlanProject);
    }




}
