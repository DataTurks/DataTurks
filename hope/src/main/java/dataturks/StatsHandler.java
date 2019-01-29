package dataturks;

import bonsai.config.AppConfig;
import bonsai.dropwizard.dao.d.DHits;
import bonsai.dropwizard.dao.d.DHitsDAO;
import bonsai.dropwizard.dao.d.DHitsResult;
import bonsai.dropwizard.dao.d.DProjects;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.google.common.collect.MinMaxPriorityQueue;
import com.google.gson.JsonArray;
import dataturks.response.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class StatsHandler {

    private static final Logger LOG = LoggerFactory.getLogger(StatsHandler.class);

    public static ProjectStats handlePOSTagging(DReqObj reqObj, DProjects project) {
        ProjectStats projectStats = new ProjectStats(project.getId());
        POSTaggingStats posTaggingStats = new POSTaggingStats();
        projectStats.setPosTaggingStats(posTaggingStats);

        // Get results stats.
        String labelSeparator = "____";
        List<DHitsResult> results = AppConfig.getInstance().getdHitsResultDAO().findAllByProjectIdInternal(project.getId());
        if (results != null) {
            Map<String, Set<String>> labelWords = new HashMap<>();
            Map<String, Long> labelCounts = new HashMap<>();

            for (DHitsResult result : results) {
                String data = result.getResult();
                String[] wordLabels = data.split(" ");
                for (String wordLabel : wordLabels) {
                    if (wordLabel.isEmpty()) continue;
                    String[] wordParts = wordLabel.trim().split(labelSeparator);
                    String word = wordParts[0];

                    if (wordParts.length != 2) continue;

                    String label = wordParts[1];

                    if (!labelWords.containsKey(label)) labelWords.put(label, new HashSet<>());
                    labelWords.get(label).add(word);

                    if (!labelCounts.containsKey(label)) labelCounts.put(label, 0l);
                    labelCounts.put(label, labelCounts.get(label) + 1);
                }
            }
            long totalWordsLabeled = 0;
            long totalUniqWordsLabeled = 0;
            for (String label : labelCounts.keySet()) {
                long uniqWords = labelWords.containsKey(label) ? labelWords.get(label).size() : 0;
                long count = labelCounts.get(label);
                posTaggingStats.addLabelDetails(label, count, uniqWords);
                totalWordsLabeled += count;
                totalUniqWordsLabeled += uniqWords;
            }
            posTaggingStats.setTotalUniqWordsWithLabels(totalUniqWordsLabeled);
            posTaggingStats.setTotalWordsWithLabels(totalWordsLabeled);
        }

        posTaggingStats.setPerLabelStat(sortMap(posTaggingStats.getPerLabelStat()));
        //set input data stats.
        updateTextHITsStats(project, posTaggingStats);

        return projectStats;
    }

    public static ProjectStats handlePOSTaggingGeneric(DReqObj reqObj, DProjects project) {
        return handleDocumentAnnotationInternal(reqObj, project);
    }

    public static ProjectStats handleDocumentAnnotation(DReqObj reqObj, DProjects project) {
        return handleDocumentAnnotationInternal(reqObj, project);
    }


    public static ProjectStats handleTextClassification(DReqObj reqObj, DProjects project) {

        ProjectStats projectStats = new ProjectStats(project.getId());
        TextClassificationStats stats = new TextClassificationStats();
        projectStats.setTextClassificationStats(stats);


        Map<String, TextClassificationStats.ClassificationLabelStat> labelCounts = new HashMap<>();
        Map<String, Integer> labelCountsRaw = getLabelCountsFromJsonClassification(reqObj, project);
        if (labelCountsRaw != null) {
            for (String label : labelCountsRaw.keySet()) {
                labelCounts.put(label, new TextClassificationStats.ClassificationLabelStat(labelCountsRaw.get(label)));
            }
        }
        stats.setLabelCounts(labelCounts);


        //get hit stats.
        int totalHits = 0;
        Object[] hitStats = getTextHITsStats(project);
        if (hitStats != null && hitStats.length >= 3) {
            Map<String, WordStats> wordStats = (Map<String, WordStats>)hitStats[0];
            long totalWords = (long)hitStats[1];

            stats.setTotalWords(totalWords);
            stats.setTotalUniqWords(wordStats.size());

            //get most/least frequent words.
            stats.setMostFrequentWords(findK(wordStats.values(), 20, true));
            stats.setLeastFrequentWords(findK(wordStats.values(), 20, false));
        }

        return projectStats;
    }


    public static ProjectStats handleTextSummarization(DReqObj reqObj, DProjects project) {
        ProjectStats projectStats = new ProjectStats(project.getId());
        TextSummarizationStats stats = new TextSummarizationStats();
        projectStats.setTextSummarizationStats(stats);

        //get hit stats.
        int totalHits = 0;
        Object[] hitStats = getTextHITsStats(project);
        if (hitStats != null && hitStats.length >= 3) {
            Map<String, WordStats> wordStats = (Map<String, WordStats>)hitStats[0];
            long totalWords = (long)hitStats[1];
            totalHits = (int) hitStats[2];

            stats.setTotalWords(totalWords);
            stats.setTotalUniqWords(wordStats.size());

            //get most/least frequent words.
            stats.setMostFrequentWords(findK(wordStats.values(), 20, true));
            stats.setLeastFrequentWords(findK(wordStats.values(), 20, false));

            stats.setAvrWordsInHits((long)Math.ceil(totalWords/totalHits));
        }



        //get results
        Object[] hitResultsStats = getTextHITResultsStats(project);
        if (hitResultsStats != null && hitResultsStats.length >= 3) {
            Map<String, WordStats> wordStatsHitResults = (Map<String, WordStats>)hitResultsStats[0];
            long totalWords = (long)hitResultsStats[1];
            int hitResults = (int) hitResultsStats[2];

            stats.setAvrWordsInHitResults((long)Math.ceil(totalWords/hitResults));

            // find the most excluded words. From all the hits which are done, substract words in HIT Results from words in input HITs.
            Object[] hitsDoneStats = getTextHITsStats(project, AppConfig.getInstance().getdHitsDAO().getInternal(
                                                                                                        project.getId(),
                                                                                                        0, totalHits ,
                                                                                                        DConstants.HIT_STATUS_DONE));
            if (hitsDoneStats != null && hitsDoneStats.length > 2) {
                Map<String, WordStats> wordStatsHitsDone = (Map<String, WordStats>)hitsDoneStats[0];
                //find the excluded words.
                if (wordStatsHitsDone != null && !wordStatsHitsDone.isEmpty() && wordStatsHitResults != null && !wordStatsHitResults.isEmpty()) {
                    for (String word : wordStatsHitResults.keySet()) {
                        if (!wordStatsHitsDone.containsKey(word)) continue;

                        WordStats resultStat = wordStatsHitResults.get(word);
                        //reduce the count for words which are present in the results.
                        // the residual words are those which were excluded from the results.
                        wordStatsHitsDone.get(word).decrementCount(resultStat.getCount());
                    }

                    stats.setMostFrequentExcludedWords(findK(wordStatsHitsDone.values(), 20, true));
                }
            }
        }

        return projectStats;
    }


    public static ProjectStats handleTextModeration(DReqObj reqObj, DProjects project) {
        return handleTextSummarization(reqObj, project);
    }

    private static ProjectStats handleDocumentAnnotationInternal(DReqObj reqObj, DProjects project) {
        ProjectStats projectStats = new ProjectStats(project.getId());
        POSTaggingStats posTaggingStats = new POSTaggingStats();
        projectStats.setDocumentTaggingStats(posTaggingStats);

        Map<String, Integer> labelCounts = getLabelCountsFromJson(reqObj, project);
        if (labelCounts != null) {
            for (String label : labelCounts.keySet()) {
                posTaggingStats.addLabelDetails(label, labelCounts.get(label), 0);
            }
        }
        posTaggingStats.setPerLabelStat(sortMap(posTaggingStats.getPerLabelStat()));
        return projectStats;
    }


    public static ProjectStats handleImageClassification(DReqObj reqObj, DProjects project) {
        ProjectStats projectStats = new ProjectStats(project.getId());
        ImageClassificationStats stats = new ImageClassificationStats();
        projectStats.setImageClassificationStats(stats);
        populateClassificationStats(reqObj, stats, project);
        return projectStats;
    }

    public static ProjectStats handleImageBoundingBox(DReqObj reqObj, DProjects project) {
        return imageBoundingBox(reqObj, project);
    }
    public static ProjectStats handleImagePolygonBoundingBox(DReqObj reqObj, DProjects project) {
        return imageBoundingBox(reqObj, project);
    }


    public static ProjectStats handleVideoBoundingBox(DReqObj reqObj, DProjects project) {
        ProjectStats stats = new ProjectStats(project.getId());
        ImageClassificationStats imageStats = new ImageClassificationStats();
        stats.setVideoBoundingBoxStats(imageStats);
        populateBoundingBoxStats(reqObj, imageStats, project);
        return stats;
    }

    public static ProjectStats handleVideoClassification(DReqObj reqObj, DProjects project) {
        ProjectStats projectStats = new ProjectStats(project.getId());
        ImageClassificationStats stats = new ImageClassificationStats();
        projectStats.setVideoClassificationStats(stats);
        populateClassificationStats(reqObj, stats, project);
        return projectStats;
    }


    private static void populateClassificationStats(DReqObj reqObj, ImageClassificationStats stats, DProjects project) {
        Map<String, ImageClassificationStats.LabelStat> labelCounts = new HashMap<>();
        Map<String, Integer> labelCountsRaw = getLabelCountsFromJsonClassification(reqObj, project);
        if (labelCountsRaw != null) {
            for (String label : labelCountsRaw.keySet()) {
                labelCounts.put(label, new ImageClassificationStats.LabelStat(label, labelCountsRaw.get(label)));
            }
        }
        stats.setLaeblStats(sort(labelCounts));
    }

    //just add the count of labels.
    private static ProjectStats imageBoundingBox(DReqObj reqObj, DProjects project) {
        ProjectStats stats = new ProjectStats(project.getId());
        ImageClassificationStats imageStats = new ImageClassificationStats();
        stats.setImageBoundingBoxStats(imageStats);
        populateBoundingBoxStats(reqObj, imageStats, project);
        return stats;
    }

    private static void populateBoundingBoxStats(DReqObj reqObj, ImageClassificationStats imageStats, DProjects project) {
        Map<String, ImageClassificationStats.LabelStat> labelCounts = new HashMap<>();
        Map<String, Integer> labelCountsRaw = getLabelCountsFromJson(reqObj, project);
        if (labelCountsRaw != null) {
            for (String label : labelCountsRaw.keySet()) {
                labelCounts.put(label, new ImageClassificationStats.LabelStat(label, labelCountsRaw.get(label)));
            }
        }
        imageStats.setLaeblStats(sort(labelCounts));

    }

    //  Used for doc annotation/image bounding box etc.
    // Here result is an array of  json objects like : [{"label":["train"],"notes":"","points":[{"x":0.2703125,"y":0.6604166666666667},{"x":0.478125,"y":0.8270833333333333}],"imageWidth":640,"imageHeight":480}]
    private static Map<String, Integer> getLabelCountsFromJson(DReqObj reqObj, DProjects project) {

        Map<String, Integer> labelCounts = new HashMap<>();

        //only use hits which are in the state for which we are calculating stats for (done/pre-tagged)
        List<String> hitStatusForStats = reqObj.getValidStatesForStatsCalculation();
        DHitsDAO hitsDAO = AppConfig.getInstance().getdHitsDAO();
        long totalHits = hitsDAO.getCountForProject(project.getId());
        Set<Long> validHITIds = new HashSet<>();
        for (String status : hitStatusForStats) {
            List<DHits> hits = hitsDAO.getInternal(project.getId(), 0, totalHits, status);
            for (DHits hit : hits) {
                validHITIds.add(hit.getId());
            }
        }


        List<DHitsResult> hitsResults = AppConfig.getInstance().getdHitsResultDAO().findAllByProjectIdInternal(project.getId());
        if (hitsResults != null && !hitsResults.isEmpty()) {
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            for (DHitsResult result : hitsResults) {
                try {
                    if (!validHITIds.contains(result.getHitId())) continue;

                    String content = result.getResult();
                    if (content != null) {

                        JsonNode root = mapper.readTree(content);
                        // When we have classification, we add pos array as a sub-child of the uber JSON.
                        // Else the data just has pos arary.
                        if (root.has("annotationResult")) {
                            root = root.get("annotationResult");
                        }
                        // content is an json array, each element is an object which has a label tag and points.
                        ArrayNode arrNode = (ArrayNode) root;

                        if (arrNode != null && arrNode.isArray()) {
                            for (JsonNode objNode : arrNode) {

                                //either the label is a string as in case of image bounding boxes.
                                // or a list of labels as in case of document annotation.
                                if (objNode.has("label") || objNode.has("labels")) {

                                    String labelTagName = objNode.has("label")? "label" : "labels";
                                    JsonNode labelNode = objNode.get(labelTagName);

                                    List<String> labels = new ArrayList<>();
                                    if (labelNode.isArray()) {
                                        for (JsonNode labelItem : labelNode) {
                                            labels.add(labelItem.textValue());
                                        }
                                    } else {
                                        labels.add(labelNode.asText());
                                    }

                                    for (String label : labels) {
                                        if (!labelCounts.containsKey(label)) {
                                            labelCounts.put(label, 0);
                                        }
                                        labelCounts.put(label, labelCounts.get(label) + 1);
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    LOG.error("Error building stats item for project " + project.getId() + " Error = " + e.toString());
                }
            }
        }
        return labelCounts;

    }


    //Used for text classification/image classification.
    // Here result is a single json object like : {"labels":["Jeans"],"note":""}}
    private static Map<String, Integer> getLabelCountsFromJsonClassification(DReqObj reqObj, DProjects project) {

        Map<String, Integer> labelCounts = new HashMap<>();
        List<DHitsResult> hitsResults = AppConfig.getInstance().getdHitsResultDAO().findAllByProjectIdInternal(project.getId());
        if (hitsResults != null && !hitsResults.isEmpty()) {
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            for (DHitsResult result : hitsResults) {
                try {
                    String content = result.getResult();
                    if (content != null) {
                        // {"labels":["Jeans"],"note":""}}
                        JsonNode objNode = mapper.readTree(content);

                        //either the label is a string as in case of image bounding boxes.
                        // or a list of labels as in case of document annotation.
                        if (objNode.has("label") || objNode.has("labels")) {

                            String labelTagName = objNode.has("label")? "label" : "labels";
                            JsonNode labelNode = objNode.get(labelTagName);

                            List<String> labels = new ArrayList<>();
                            if (labelNode.isArray()) {
                                for (JsonNode labelItem : labelNode) {
                                    labels.add(labelItem.textValue());
                                }
                            } else {
                                labels.add(labelNode.asText());
                            }

                            for (String label : labels) {
                                if (!labelCounts.containsKey(label)) {
                                    labelCounts.put(label, 0);
                                }
                                labelCounts.put(label, labelCounts.get(label) + 1);
                            }
                        }
                    }
                } catch (Exception e) {
                    LOG.error("Error building stats item for project " + project.getId() + " Error = " + e.toString());
                }
            }
        }
        return labelCounts;

    }



    //update stats based on the input HITs for the project. like most/least frequent words in the input.
    private static void updateTextHITsStats(DProjects project, POSTaggingStats posTaggingStats) {
            Object[] stats = getTextHITsStats(project);
            if (stats != null && stats.length >= 2) {
                Map<String, WordStats> wordStats = (Map<String, WordStats>)stats[0];
                long totalWords = (long)stats[1];
                posTaggingStats.setTotalWords(totalWords);
                posTaggingStats.setTotalUniqWords(wordStats.size());

                //get most/least frequent words.
                posTaggingStats.setMostFrequentWords(findK(wordStats.values(), 20, true));
                posTaggingStats.setLeastFrequentWords(findK(wordStats.values(), 20, false));
            }
    }

    private static Object[] getTextHITsStats(DProjects project, List<DHits> hits) {
        String labelSeparator = "____";
        if (hits != null && !hits.isEmpty()) {
            Map<String, WordStats> wordStats = new HashMap<>();
            long totalWords = 0;
            for (DHits hit : hits) {
                if (hit.isURL()) continue;
                String input = hit.getData();
                String[] words = input.trim().split(" ");
                for (String word : words) {
                    if (word.isEmpty() || word.endsWith(labelSeparator)) continue;
                    if (!wordStats.containsKey(word)) {
                        wordStats.put(word, new WordStats(word));
                    }
                    wordStats.get(word).incrementCount();
                    totalWords++;
                }
            }
            return new Object[]{wordStats, totalWords, hits.size()};
        }
        return null;
    }
    private static Object[] getTextHITsStats(DProjects project) {
        List<DHits> hits = AppConfig.getInstance().getdHitsDAO().findAllByProjectIdInternal(project.getId());
        return getTextHITsStats(project, hits);
    }


    private static Object[] getTextHITResultsStats(DProjects project) {
        List<DHitsResult> hitsResults = AppConfig.getInstance().getdHitsResultDAO().findAllByProjectIdInternal(project.getId());
        if (hitsResults != null && !hitsResults.isEmpty()) {
            Map<String, WordStats> wordStats = new HashMap<>();
            long totalWords = 0;
            for (DHitsResult hit : hitsResults) {
                String input = hit.getResult();
                String[] words = input.trim().split(" ");
                for (String word : words) {
                    if (word.isEmpty()) continue;
                    if (!wordStats.containsKey(word)) {
                        wordStats.put(word, new WordStats(word));
                    }
                    wordStats.get(word).incrementCount();
                    totalWords++;
                }
            }
            return new Object[]{wordStats, totalWords, hitsResults.size()};
        }
        return null;
    }

    private static List<WordStats> findK(Collection<WordStats> wordStats, int k, boolean topK) {
        //NOTE: priority queue keeps lowest value at the top.
        Comparator<WordStats> comparator = new Comparator<WordStats>() {
            @Override
            public int compare(WordStats o1, WordStats o2) {
                return (int) (o2.getCount() - o1.getCount());
            }
        };
        if (!topK) {
            comparator = comparator.reversed();
        }

        MinMaxPriorityQueue<WordStats> priorityQueue = MinMaxPriorityQueue.orderedBy(comparator).maximumSize(k).create();

        //PriorityQueue<WordStats> priorityQueue = new PriorityQueue<>(wordStats.size(), comparator);
        priorityQueue.addAll(wordStats);

        List<WordStats> values = new ArrayList<>(k);

        for (int i =0; i<k; i++) {
            WordStats wordStat = priorityQueue.poll();
            if (wordStat == null) break;
            values.add(wordStat);
        }

        return values;
    }

    private static List<ImageClassificationStats.LabelStat> sort(Map<String, ImageClassificationStats.LabelStat> labelCounts ) {
        List<ImageClassificationStats.LabelStat> labelStats = new ArrayList<>(labelCounts.values());

        Collections.sort(labelStats, Collections.reverseOrder(new Comparator<ImageClassificationStats.LabelStat>() {
            @Override
            public int compare(ImageClassificationStats.LabelStat o1, ImageClassificationStats.LabelStat o2) {
                return o1.getCount() - o2.getCount();
            }
        }));
        return labelStats;
    }

    private static Map<String, POSTaggingStats.LabelStat> sortMap(Map<String, POSTaggingStats.LabelStat> labelCounts ) {

        // 1. Convert Map to List of Map
        List<Map.Entry<String, POSTaggingStats.LabelStat>> list =
                new LinkedList<Map.Entry<String, POSTaggingStats.LabelStat>>(labelCounts.entrySet());

        // 2. Sort list with Collections.sort(), provide a custom Comparator
        //    Try switch the o1 o2 position for a different order
        Collections.sort(list, Collections.reverseOrder(new Comparator<Map.Entry<String, POSTaggingStats.LabelStat>>() {
            public int compare(Map.Entry<String, POSTaggingStats.LabelStat> o1,
                               Map.Entry<String, POSTaggingStats.LabelStat> o2) {
                return (int)(o1.getValue().getCount() - o2.getValue().getCount());
            }
        }));

        // 3. Loop the sorted list and put it into a new insertion order Map LinkedHashMap
        Map<String, POSTaggingStats.LabelStat> sortedMap = new LinkedHashMap<String, POSTaggingStats.LabelStat>();
        for (Map.Entry<String, POSTaggingStats.LabelStat> entry : list) {
            sortedMap.put(entry.getKey(), entry.getValue());
        }

        return sortedMap;
    }

}
