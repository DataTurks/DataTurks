package bonsai.security;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseCredentials;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.tasks.Task;
import com.google.firebase.tasks.Tasks;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;

/**
 * Created by mohan on 1/6/17.
 */
public class FirebaseSASignIn {

    private static final Logger LOG = LoggerFactory.getLogger(FirebaseSASignIn.class);
    private static boolean isInited = false;
    static FirebaseApp saFirebaseApp = null;
    public static void initFirebase() {
        try {

            String path = "./keys/saFirebase.json";
            FileInputStream serviceAccount = new FileInputStream(path);

            String dataBaseLink = "https://somethingawesome-179010.firebaseio.com";
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredential(FirebaseCredentials.fromCertificate(serviceAccount))
                    .setDatabaseUrl(dataBaseLink)
                    .build();

            saFirebaseApp = FirebaseApp.initializeApp(options, "saFirebaseApp");
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }
        isInited = true;
    }

    public static String getUserId(String token) {
        if (!isInited || saFirebaseApp == null) initFirebase();


        Task<FirebaseToken> authTask = FirebaseAuth.getInstance(saFirebaseApp).verifyIdToken(token);
        try {
            Tasks.await(authTask);
            FirebaseToken decodedToken = authTask.getResult();
            if (decodedToken != null) {
                return decodedToken.getUid();
            }
        } catch (Exception e ) {
            LOG.error(e.getMessage());
        }
        return null;
    }



}
