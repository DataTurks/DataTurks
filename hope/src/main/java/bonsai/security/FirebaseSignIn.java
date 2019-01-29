package bonsai.security;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseCredentials;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.tasks.OnFailureListener;
import com.google.firebase.tasks.OnSuccessListener;
import com.google.firebase.tasks.Task;
import com.google.firebase.tasks.Tasks;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Created by mohan on 1/6/17.
 */
public class FirebaseSignIn {

    private static final Logger LOG = LoggerFactory.getLogger(FirebaseSignIn.class);
    private static boolean isInited = false;
    public static void initFirebase() {
        try {

            String path = AppConfig.getInstance().getFirebaseCredFilePath();
            path = path == null ? "./keys/bonsaiFirebase.json" : path;
            FileInputStream serviceAccount = new FileInputStream(path);

            String dataBaseLink = DBBasedConfigs.getConfig("firebaseDatabaseURL", String.class, "https://bonsai-b808c.firebaseio.com/");
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredential(FirebaseCredentials.fromCertificate(serviceAccount))
                    .setDatabaseUrl(dataBaseLink)
                    .build();

            FirebaseApp.initializeApp(options);
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }
        isInited = true;
    }

    public static String getUserId(String token) {
        if (!isInited) initFirebase();


        Task<FirebaseToken> authTask = FirebaseAuth.getInstance().verifyIdToken(token);
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
