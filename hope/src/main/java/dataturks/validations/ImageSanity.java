package dataturks.validations;

import bonsai.config.AppConfig;
import bonsai.dropwizard.dao.d.DHits;
import bonsai.dropwizard.dao.d.DHitsResult;
import bonsai.dropwizard.dao.d.DProjects;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.google.gson.JsonArray;
import dataturks.DConstants;

import java.util.*;

// A helper class to have logic to do quick sanity tests on the image project types.
public class ImageSanity {

    //calculate BBX overlap between results of project1 and project2
    public static List<String> validate(String projectId1, String projectId2) {
        DProjects project1 = AppConfig.getInstance().getdProjectsDAO().findByIdInternal(projectId1);
        DProjects project2 = AppConfig.getInstance().getdProjectsDAO().findByIdInternal(projectId2);

        List<String> output = new ArrayList<>();

        //find pairs of hit results to compare.
        List<DHits> dHits1 = AppConfig.getInstance().getdHitsDAO().getInternal(projectId1, 0, 100, DConstants.HIT_STATUS_DONE);
        List<DHits> dHits2 = AppConfig.getInstance().getdHitsDAO().getInternal(projectId2, 0, 100, DConstants.HIT_STATUS_DONE);

        Map<String, DHitsResult> imageResultMap1 = new HashMap<>();
        if (dHits1 != null && !dHits1.isEmpty()) {
            for (DHits hit : dHits1) {
                List<DHitsResult> results = AppConfig.getInstance().getdHitsResultDAO().findByHitIdInternal(hit.getId());
                if (results != null && results.size() >0 ) {
                    imageResultMap1.put(hit.getData(), results.get(0));
                }
            }

        }
        output.add("\nHITs found in project 1 = " + imageResultMap1.size());

        Map<String, DHitsResult> imageResultMap2 = new HashMap<>();
        if (dHits2 != null && !dHits2.isEmpty()) {
            for (DHits hit : dHits2) {
                List<DHitsResult> results = AppConfig.getInstance().getdHitsResultDAO().findByHitIdInternal(hit.getId());
                if (results != null && results.size() >0 ) {
                    imageResultMap2.put(hit.getData(), results.get(0));
                }
            }

        }
        output.add("\nHITs found in project 2 = " + imageResultMap2.size());

        ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();

        double totalIOU = 0;
        int numEntities = 0;
        int commonHits = 0;
        for (String image : imageResultMap2.keySet()) {
            if (imageResultMap1.containsKey(image)) {
                try {
                    JsonNode node1 = mapper.readTree(imageResultMap1.get(image).getResult());
                    JsonNode node2 = mapper.readTree(imageResultMap2.get(image).getResult());

                    commonHits++;
                    if (node1 instanceof ArrayNode && node2 instanceof ArrayNode) {
                        ArrayNode array1 = (ArrayNode) node1;
                        ArrayNode array2 = (ArrayNode) node2;
                        if (array1.size() != array2.size()) {
                            output.add("\nError : for " + image + ": Number of items tagged in project1 = " + array1.size() + " , in project 2= " + array2.size());
                            continue;
                        }

                        for (int i = 0; i< array1.size(); i++) {
                            JsonNode n1 = array1.get(i);
                            JsonNode n2 = array2.get(i);
                            if (!sameDimentions(n1, n2)) {
                                output.add("\nError : for " + image + ": " +
                                        "Dimentions in project1 = (" + n1.get("imageWidth") + ", " + n1.get("imageHeight") + ") " +
                                        " in  project2 = (" + n2.get("imageWidth") + ", " + n2.get("imageHeight") + ")");
                                continue;
                            }
                            if (((ArrayNode)n1.get("points")).size() != 4 ||
                                    ((ArrayNode)n2.get("points")).size() != 4) {
                                output.add("\nError : for " + image + ": Number of points != 4");
                                continue;
                            }

                            double IOU = findIOU(n1, n2);
                            output.add("\nInfo : for " + image + ": IOU for object number " + i + " = " + IOU);

                            totalIOU += IOU;
                            numEntities++;
                        }
                    }
                }
                catch (Exception e) {
                    output.add("\nError : for " + image + ": " + e.toString());
                }
            }
        }
        output.add("Common HITS found = " + commonHits);
        output.add("\n\n\nOverall IOU for (" + numEntities + " entities) = " + (totalIOU*100)/numEntities + " %");

        return output;

    }


    /*

    #boxA=[x1, y1, x2, y2] (x1, y1) is top left.
def bb_intersection_over_union(boxA, boxB):
    # determine the (x, y)-coordinates of the intersection rectangle
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    # compute the area of intersection rectangle
    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)

    # compute the area of both the prediction and ground-truth
    # rectangles
    boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
    boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)

    # compute the intersection over union by taking the intersection
    # area and dividing it by the sum of prediction + ground-truth
    # areas - the interesection area
    iou = interArea / float(boxAArea + boxBArea - interArea)

    # return the intersection over union value
    return iou

     */

    public static double findIOU(JsonNode n1, JsonNode n2) {
        ArrayNode points1 = (ArrayNode)n1.get("points");
        ArrayNode points2 = (ArrayNode)n2.get("points");
        if (points1.size() == points2.size() && points1.size() == 4) {
            double minx1 = Collections.min(getAllPoints(points1, true));
            double maxx1 = Collections.max(getAllPoints(points1, true));
            double miny1 = Collections.min(getAllPoints(points1, false));
            double maxy1 = Collections.max(getAllPoints(points1, false));


            double minx2 = Collections.min(getAllPoints(points2, true));
            double maxx2 = Collections.max(getAllPoints(points2, true));
            double miny2 = Collections.min(getAllPoints(points2, false));
            double maxy2 = Collections.max(getAllPoints(points2, false));

            //for the intersetcion.
            double minx = Math.max(minx1, minx2);
            double minY = Math.max(miny1, miny2);
            double maxx = Math.min(maxx1, maxx2);
            double maxY = Math.max(maxy1, maxy2);

            double area1 = Math.max(0, maxx1 - minx1 + 1) * Math.max(0, maxy1 - miny1 + 1);
            double area2 = Math.max(0, maxx2 - minx2 + 1) * Math.max(0, maxy2 - miny2 + 1);
            double intersectArea = Math.max(0, maxx - minx + 1) * Math.max(0, maxY - minY + 1);

            double iou = intersectArea/ (area1 + area2 - intersectArea);
            return iou;

        }

        return 0.0;
    }

    public static List<Double> getAllPoints(ArrayNode points, boolean x) {
        int index = x? 0 : 1;
        return Arrays.asList(new Double[] { ((ArrayNode)points.get(0)).get(index).asDouble(),
                ((ArrayNode)points.get(1)).get(index).asDouble(),
                ((ArrayNode)points.get(2)).get(index).asDouble(),
                ((ArrayNode)points.get(3)).get(index).asDouble()});
    }


    public static boolean sameDimentions(JsonNode n1, JsonNode n2) {
        if (n1.get("imageWidth").asInt() == n2.get("imageWidth").asInt() && n1.get("imageHeight").asInt() == n2.get("imageHeight").asInt()) {
            return true;
        }

        return false;
    }

    public static void main(String[] args) {
        //System.out.println(validate());
    }

}
