package bonsai.security;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.apache.ApacheHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;

/**
 * Created by mohan on 8/5/17.
 */
public class GoogleSignIn {

    private static Logger LOG = LoggerFactory.getLogger(GoogleSignIn.class);
    private static final JacksonFactory jacksonFactory = new JacksonFactory();

    public static final String Google_OAuth_Client_Id_Debug = "785673736022-c68gmbvhqbq24a5jd7j4vsipi4ab9jh4.apps.googleusercontent.com";
    public static final String Google_OAuth_Client_Id_Release = "";
    public static final String Google_OAuth_Client_Id = Google_OAuth_Client_Id_Debug;

    public static String getUserId(String token) {
        String userId = null;
        String CLIENT_ID = DBBasedConfigs.getConfig("googleSignInClientID", String.class, Google_OAuth_Client_Id);

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new ApacheHttpTransport(), jacksonFactory)
                    .setAudience(Collections.singletonList(CLIENT_ID)).build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                userId = payload.getSubject();

                // Get profile information from payload
//                String email = payload.getEmail();
//                boolean emailVerified = Boolean.valueOf(payload.getEmailVerified());
//                String name = (String) payload.get("name");
//                String pictureUrl = (String) payload.get("picture");
//                String locale = (String) payload.get("locale");
//                String familyName = (String) payload.get("family_name");
//                String givenName = (String) payload.get("given_name");
            }
        } catch (Exception e) {
            LOG.error(e.toString());
        }

        return userId;
    }
}
