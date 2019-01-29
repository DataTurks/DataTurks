package bonsai.security;

import bonsai.Constants;
import bonsai.config.DBBasedConfigs;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.LoadingCache;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * Created by gajendra.dadheech on 6/17/17.
 */
public class InstaMojoSec {

    private static LoadingCache<String, String> accessTokens;

    private InstaMojoSec() {
        accessTokens = CacheBuilder.newBuilder().maximumSize(10).refreshAfterWrite(35550, TimeUnit.SECONDS).build(new SecKeyLoader());
    }

    private static InstaMojoSec instaMojoSec = new InstaMojoSec();

    public static InstaMojoSec getInstance() {
        return instaMojoSec;
    }

    private String getMeAccessToken(String type) throws UnirestException {
        HttpResponse<JsonNode> response;
        if (type.equalsIgnoreCase("test")) {
            response = Unirest.post(Constants.INSTAMOJO_TEST_AUTH_ENDPOINT)
                    .header("accept", "application/json")
                    .field("client_id", Constants.TEST_CLIENT_ID)
                    .field("client_secret", Constants.TEST_CLIENT_SECRET)
                    .field("grant_type", "client_credentials")
                    .asJson();

        } else {
            response = Unirest.post(Constants.INSTAMOJO_PROD_AUTH_ENDPOINT)
                    .header("accept", "application/json")
                    .field("client_id", Constants.PROD_CLIENT_ID)
                    .field("client_secret", Constants.PROD_CLIENT_SECRET)
                    .field("grant_type", "client_credentials")
                    .asJson();

        }
        return response.getBody().getObject().getString("access_token");
    }

    public String getMeToken(String type) {
        try {
            return accessTokens.get(type);
        } catch (ExecutionException e) {
            return null;
        }
    }

    public static void main(String[] args) {
        InstaMojoSec instaMojoSec = new InstaMojoSec();
        System.out.println(instaMojoSec.getMeToken("test"));
        System.out.println(instaMojoSec.getMeToken("test"));
        System.out.println(instaMojoSec.getMeToken("production"));
        System.out.println(instaMojoSec.getMeToken("production"));
    }


    private class SecKeyLoader extends com.google.common.cache.CacheLoader<String, String> {
        public String load(String key) throws Exception {
            return getMeAccessToken(key);
        }
    }

}
