package dataturks.drip;

import bonsai.Utils.CommonUtils;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DProjectInvites;
import bonsai.dropwizard.dao.d.DProjects;
import bonsai.dropwizard.dao.d.DUsers;
import com.codahale.metrics.MetricRegistry;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.dropwizard.client.HttpClientBuilder;
import io.dropwizard.client.HttpClientConfiguration;
import io.dropwizard.util.Duration;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

public class KlentyAPI {
    private static final Logger LOG = LoggerFactory.getLogger(KlentyAPI.class);

    private static String klentyAPI = "https://app.klenty.com/apis/v1/user/mohan@dataturks.com";

    private static HttpClient httpClient = null;
    public static void init() {
        getHTTPClient();
    }

    private static HttpClient getHTTPClient() {
        if (httpClient == null) {
            HttpClientConfiguration conf = new HttpClientConfiguration();
            conf.setConnectionRequestTimeout(Duration.milliseconds(5000L));
            conf.setTimeout(Duration.milliseconds(5000L));
            conf.setConnectionTimeout(Duration.milliseconds(5000L));
            httpClient = new HttpClientBuilder(new MetricRegistry()).using(conf).build("KlentyAPI");
        }
        return httpClient;
    }

    private static boolean getResponse(HttpUriRequest request) {
        try {
            //ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            String klentyAPIKey = DBBasedConfigs.getConfig("dKlentyAPIKey",String.class, "");
            //request.setHeader("Content-Type", "application/json");
            request.setHeader("X-Api-Key", klentyAPIKey);

            HttpClient client = getHTTPClient();
            HttpResponse response = client.execute(request);
            HttpEntity entity = response.getEntity();
            if (entity != null) {
                //JsonNode node = mapper.readTree(EntityUtils.toByteArray(entity));
                return true;
            }
        }
        catch (Exception e) {
            LOG.error(e.toString());
            e.printStackTrace();
        }
        return false;
    }

    private static void createProspect(String firstName, String email) {

    }


    private static void createProspect(DUsers user) throws Exception{

        ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
        ObjectNode dataNode = mapper.createObjectNode();
        ((ObjectNode) dataNode).put("Email", user.getEmail().trim());
        ((ObjectNode) dataNode).put("FirstName", CommonUtils.getUserFirstName(user)); //End index is inclusive.
        ((ObjectNode) dataNode).put("LastName", "");
        ((ObjectNode) dataNode).put("FullName", user.getFirstName());
        ((ObjectNode) dataNode).put("Title", "");

        String jsonData = mapper.writeValueAsString(dataNode);
        StringEntity requestEntity = new StringEntity(
                jsonData,
                ContentType.APPLICATION_JSON);

        HttpPost postMethod = new HttpPost(klentyAPI + "/prospects");
        postMethod.setEntity(requestEntity);
        getResponse(postMethod);

    }

    private static void startCadence(String email, String cadenceName) throws Exception{
        ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
        JsonNode dataNode = mapper.createObjectNode();
        ((ObjectNode) dataNode).put("Email", email.trim());
        ((ObjectNode) dataNode).put("cadenceName", cadenceName);

        StringEntity requestEntity = new StringEntity(
                mapper.writeValueAsString(dataNode),
                ContentType.APPLICATION_JSON);

        HttpPost postMethod = new HttpPost(klentyAPI + "/cadences/start");
        postMethod.setEntity(requestEntity);
        getResponse(postMethod);

    }

    private static void stopCadence(String email) throws Exception{

        ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
        JsonNode dataNode = mapper.createObjectNode();
        ((ObjectNode) dataNode).put("Email", email.trim());

        StringEntity requestEntity = new StringEntity(
                mapper.writeValueAsString(dataNode),
                ContentType.APPLICATION_JSON);

        HttpPost postMethod = new HttpPost(klentyAPI + "/stopCadence");
        postMethod.setEntity(requestEntity);
        getResponse(postMethod);
    }




    //FIX last updated time.
    public static void addToProjectInviteFlow(DProjectInvites newInvites) {

        return;
    }

    public static int addToSignInFlow(DUsers user ) throws Exception{
        createProspect(user);
        String signInFlowCadenceName = DBBasedConfigs.getConfig("dsignInFlowCadenceName", String.class, "SignupFlow");
        startCadence(user.getEmail(), signInFlowCadenceName);
        return 0;
    }

    public static void addToManyHitsDownFlow(List<DUsers> users ) {


        return;
    }

    public static void addToProjectIncompleteFlow(Map<DUsers, DProjects> userProjectMap) {


        return;
    }


    public static void removeFromSignInFlow(DUsers user) throws Exception{
        stopCadence(user.getEmail());
        return;
    }

    public static void removeFromProjectInviteFlow(List<DUsers> users ) {


        return;
    }

    public static void removeFromProjectIncompleteFlow(List<DUsers> users ) {

        return;
    }

}
