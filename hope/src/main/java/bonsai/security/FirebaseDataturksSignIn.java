package bonsai.security;

import bonsai.Utils.CommonUtils;
import bonsai.config.DBBasedConfigs;
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

public class FirebaseDataturksSignIn {
    private static final Logger LOG = LoggerFactory.getLogger(FirebaseDataturksSignIn.class);
    private static boolean isInited = false;
    static FirebaseApp firebaseApp = null;
    public static void initFirebase() {
        try {

            String path = "./keys/dataturksFirebase.json";
            FileInputStream serviceAccount = new FileInputStream(path);

            String dataBaseLink = DBBasedConfigs.getConfig("d_firebaseDatabaseURL", String.class, "https://dataturks-e8a90.firebaseio.com");
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredential(FirebaseCredentials.fromCertificate(serviceAccount))
                    .setDatabaseUrl(dataBaseLink)
                    .build();

            firebaseApp = FirebaseApp.initializeApp(options, "dataturksFirebaseApp");
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }
        isInited = true;
    }

    public static String getUserId(String token) {
        if (!isInited || firebaseApp == null) initFirebase();


        Task<FirebaseToken> authTask = FirebaseAuth.getInstance(firebaseApp).verifyIdToken(token);
        try {
            Tasks.await(authTask);
            FirebaseToken decodedToken = authTask.getResult();
            if (decodedToken != null) {
                return decodedToken.getUid();
            }
        } catch (Exception e ) {
            LOG.error(e.getMessage() + CommonUtils.getStackTraceString(e));
        }
        return null;
    }



}
