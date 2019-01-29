package dataturks;

import bonsai.Constants;
import bonsai.Utils.CommonUtils;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DHits;
import bonsai.dropwizard.dao.d.DHitsResult;
import bonsai.dropwizard.dao.d.DProjects;
import bonsai.dropwizard.dao.d.DUsers;
import com.fasterxml.jackson.core.io.JsonStringEncoder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class DataDownloadHelper {

    private static final Logger LOG = LoggerFactory.getLogger(DataDownloadHelper.class);

    // for image classification, old hit results may not have a well-formed json in result
    // fix that.
    public static String fixImageClassificationResultJson(String resultJson) {
        try {
            if (resultJson != null && !resultJson.isEmpty()) {
                resultJson = resultJson.trim();
                boolean shouldFix = DBBasedConfigs.getConfig("dFixImageClassificationResultJson", Boolean.class, false);
                // a json starts with '{'
                if (shouldFix && resultJson.charAt(0) != '{') {

                    ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();


                    JsonNode rootNode = mapper.createObjectNode();
                    //add notes.
                    ((ObjectNode) rootNode).put("notes", "");

                    //add labels.
                    String[] labels = resultJson.split(DConstants.LABEL_SEPARATOR);
                    ArrayNode labelsArrayNode = ((ObjectNode) rootNode).putArray("label");
                    for (String label : labels) {
                        labelsArrayNode.add(label);
                    }
                    return mapper.writeValueAsString(rootNode);

                }
            }
        }
        catch (Exception e) {
            LOG.error("Error fixImageClassificationResultJson for " + resultJson + " Error = " + e.toString());
            e.printStackTrace();
        }
        return resultJson;
    }

    //convert the hit result data stored as a____X b d____Y to spacy format.
    public static String convertPoSToJson(String hitResultString){
        if (hitResultString == null || hitResultString.isEmpty()) return hitResultString;

        try {
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            ArrayNode annotationArrayNode = mapper.createArrayNode();

            String[] words = hitResultString.trim().split(" ");

            StringBuilder sb = new StringBuilder();
            //keep track of the string length we are in.
            int strLenProceesed = 0;
            for (String word : words) {
                String wordToAdd = word;
                String labelToAdd = null;

                String[] wordLabel = word.split(DConstants.LABEL_SEPARATOR);
                if (wordLabel.length == 2) {
                    wordToAdd = wordLabel[0];
                    labelToAdd = wordLabel[1];
                }

                int wordLen = wordToAdd.length();
                if (labelToAdd != null) {
                    JsonNode node = mapper.createObjectNode();
                    ((ObjectNode) node).putArray("label").add(labelToAdd);
                    ArrayNode pointsArrayNode = ((ObjectNode) node).putArray("points");

                    JsonNode pointNode = mapper.createObjectNode();
                    ((ObjectNode) pointNode).put("start", strLenProceesed);
                    ((ObjectNode) pointNode).put("end", strLenProceesed + wordLen -1); //End index is inclusive.
                    ((ObjectNode) pointNode).put("text", wordToAdd);
                    pointsArrayNode.add(pointNode);

                    annotationArrayNode.add(node);

                }

                sb.append(wordToAdd).append(" ");
                strLenProceesed += wordLen + 1; //extra 1 for the space.
            }

            return mapper.writeValueAsString(annotationArrayNode);
        }
        catch (Exception e) {
            LOG.error("convertPoSToJson for item " + hitResultString + " Error = " + e.toString());
            e.printStackTrace();
            return null;
        }
    }


    public static String handleStanfordDownload(DReqObj reqObj, DProjects project) {

        List<DHits> hits = AppConfig.getInstance().getdHitsDAO().findAllByProjectIdInternal(project.getId());
        List<DHitsResult> results = AppConfig.getInstance().getdHitsResultDAO().findAllByProjectIdInternal(project.getId());

        Map<Long, DHitsResult> hitsResultMap = new HashMap<>();
        for (DHitsResult result : results) {
            hitsResultMap.put(result.getHitId(), result);
        }
        List<String> lines = new ArrayList<>();

        //get all hit/hit id pairs.
        for (DHits hit : hits) {
            if (hitsResultMap.containsKey(hit.getId())) {

                String hitData = hit.getData();
                String resultJson = hitsResultMap.get(hit.getId()).getResult();

                if (resultJson == null || resultJson.isEmpty()) continue;

                // if old POS is still storeing result in old format, first change that to json.
                if (DTypes.Project_Task_Type.POS_TAGGING == project.getTaskType()) {
                    resultJson = DataDownloadHelper.convertPoSToJson(resultJson);
                }

                lines.addAll(convertToStanfordNER(hitData, resultJson));
                lines.add(""); //an empty line
            }
        }
        String filePath = DataDownloadHelper.outputToTempFile(lines, project.getName() + ".json");
        return filePath;
    }

    /**
     * Each line is a "Word\tLabel" pair. word/label seperated by a tab.
     * Each word needs to be labeled, for non-entities add them as an unknown label.
     * NOTE: Stanford NER does not allow, multiple labels for the same word. So we use the first label as the label for a phrase.
     * Also, if a phrase is labeled as X, its actually represented by labeling each word as X.
     *
     * @param hitString
     * @param resultJson
     * format of the json [{
                            "label": ["Technology", "Cake"],
                            "points": [{
                                "start": 9541,
                                "end": 9543,
                                "text": "C++"
                                }]
                            }]
     * @return
     */
    public static List<String> convertToStanfordNER(String hitString, String resultJson) {
        String unknownTag = "O";
        List<String> lines = new ArrayList<>();
        try {
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            List<NEREntityItem> NEREntityItems = new ArrayList<>();
            JsonNode root = mapper.readTree(resultJson);
            //When we have classification, we add pos array as a sub-child of the uber JSON.
            // Else the data just has pos arary.
            if (root.has("annotationResult")) {
                root = root.get("annotationResult");
            }

            ArrayNode rootNode = (ArrayNode) root;
            for (JsonNode node : rootNode) {
                JsonNode pointNode = ((ArrayNode) node.get("points")).get(0);
                NEREntityItem item = new NEREntityItem(pointNode.get("start").intValue(),
                        pointNode.get("end").intValue(),
                        pointNode.get("text").textValue(), ((ArrayNode)node.get("label")).get(0).textValue());
                NEREntityItems.add(item);
            }
            //sort the NER items by the start location.
            Collections.sort(NEREntityItems, new Comparator<NEREntityItem>() {
                @Override
                public int compare(NEREntityItem o1, NEREntityItem o2) {
                    return o1.startIndex - o2.startIndex;
                }
            });

            // Walk through the sorted list and process each part of the hitString to generate stanford output.
            int maxIndexProcessed = -1;
            long strLen = hitString.length();
            for (NEREntityItem item : NEREntityItems) {
                // the part of the data after the previous NER item but before this NER item.
                // start index of the next item might be behind of where we are already proccesing inside the string
                // hence pick you indexes correctly.
                int nextStartIndex = Math.max(maxIndexProcessed +1, item.startIndex);
                int nextEndIndex = Math.max(nextStartIndex, item.endIndex);

                String subStringBefore = hitString.substring(maxIndexProcessed +1, nextStartIndex);
                String subString = hitString.substring(nextStartIndex, nextEndIndex + 1);

                lines.addAll(tagEveryWord(subStringBefore, unknownTag));
                lines.addAll(tagEveryWord(subString, item.label));

                maxIndexProcessed = nextEndIndex;

                if ((maxIndexProcessed +1) >= strLen) break; //done with the string.
            }

            //process the last part
            String lastPart = hitString.substring(maxIndexProcessed +1);
            lines.addAll(tagEveryWord(lastPart, unknownTag));
        }
        catch (Exception e) {
            LOG.error("convertToStanfordNER for item " + resultJson + " Error = " + e.toString());
            e.printStackTrace();
            return Collections.emptyList();
        }
        return lines;
    }



    private static List<String> tagEveryWord(String str, String label) {
        str = str.replaceAll("[\\t\\n\\r]+"," "); //remove all new lines by space

        String[] words = str.trim().split(" ");
        if (words.length > 0) {
            List<String> lines = new ArrayList<>();
            for (String word : words) {
                word = word.trim();
                if (word.isEmpty()) continue;
                lines.add(word + "\t" + label);
            }
            return lines;
        }
        return Collections.emptyList();
    }

    // a POJO to contain the NER item as kept in the JSON format.
    private static class NEREntityItem {
        public int startIndex;
        public int endIndex;
        public String text;
        public String label;
        public NEREntityItem(){ }
        public NEREntityItem(int startIndex, int endIndex, String text, String label){
            this.startIndex = startIndex;
            this.endIndex = endIndex;
            this.text = text;
            this.label = label;
        }
    }



    public static String formatAsJson(DHits hit, DHitsResult result, String resultJson, boolean isPaidPlanProject) {
        try {
            String hitData = hit.getData();
            String hitExtraJson = hit.getExtras();

            resultJson = (resultJson == null || resultJson.isEmpty())? null: resultJson;
            hitExtraJson = (hitExtraJson == null || hitExtraJson.isEmpty())? null: hitExtraJson;

            String hitdataJsonEncoded = getStringJsonEscaped(hitData);

            //meta data
            String metadataStr = null;

            if (result != null) {
                ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
                JsonNode node = mapper.createObjectNode();
                ((ObjectNode) node).put("first_done_at", result.getCreated_timestamp().getTime());
                ((ObjectNode) node).put("last_updated_at", result.getUpdated_timestamp().getTime());
                ((ObjectNode) node).put("sec_taken", result.getTimeTakenToLabelInSec());
                ((ObjectNode) node).put("last_updated_by", isPaidPlanProject? maybeGetUserEmail(result.getUserId()) : result.getUserId());
                ((ObjectNode) node).put("status", hit.getStatus());
                ((ObjectNode) node).put("evaluation", hit.getEvaluationType().toString());
                metadataStr = mapper.writeValueAsString(node);
            }

            return "{" + "\"content\": \"" + hitdataJsonEncoded + "\"," + "\"annotation\":" + resultJson +   "," + "\"extras\":" + hitExtraJson +   "," + "\"metadata\":" + metadataStr +"}";
        }
        catch (Exception e) {
            LOG.error("Error creating a download record..skipping..");
        }
        return "{}";
    }

    public static String maybeGetUserEmail(String uid) {
        DUsers user = DUtils.getUser(uid);
        if (user != null) return user.getEmail();
        return uid;
    }


    private static String getStringJsonEscaped(String str) {
        //convert the hit data in a valid json string, pick the result json as it is.
        JsonStringEncoder e = JsonStringEncoder.getInstance();
        StringBuilder sb = new StringBuilder();
        e.quoteAsString(str, sb);
        return sb.toString();
    }

    //fileName is the suffix of the file to be created, ex xxxxxxfileName.tsv
    public static String outputToTempFile(List<String> lines, String fileName) {
        String downloadDir = DBBasedConfigs.getConfig("fileDownloadDir", String.class, Constants.DEFAULT_FILE_DOWNLOAD_DIR);
        String targetFileName = UUID.randomUUID().toString() + "____" + fileName;
        String targetFilepath = downloadDir + "/" + targetFileName;
        CommonUtils.writeAllLines(lines, targetFilepath);

        return targetFilepath;
    }
}
