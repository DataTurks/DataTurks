package bonsai.security;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.exceptions.AuthException;
import bonsai.sa.EventsLogger;
import dataturks.DUtils;
import dataturks.security.InternalLoginAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by mohan on 8/5/17.
 */
public class LoginAuth {

    public static final String Google_Auth_Type = "google";
    public static final String Facebook_Auth_Type = "facebook";
    public static final String Firebase_Auth_Type = "firebase";
    private static final Logger LOG = LoggerFactory.getLogger(LoginAuth.class);

    //make calls using the token and validate that the provided ID matches
    public static boolean isUserIdValid(String userId, String token) {
        if (userId != null && token != null) {
            String userIdFromToken = FirebaseSignIn.getUserId(token);
            if (userId != null && userIdFromToken != null && userId.equalsIgnoreCase(userIdFromToken)) {
                return true;
            }
        }
        return false;
    }



    public static boolean isDataturksUserIdValid(String userId, String token) {
        if (userId != null && token != null) {
            String userIdFromToken = FirebaseDataturksSignIn.getUserId(token);
            if (userId != null && userIdFromToken != null && userId.equalsIgnoreCase(userIdFromToken)) {
                return true;
            }
        }
        return false;
    }


    public static void validateTokenElseThrowException(String userId, String token) {
        if (!isUserIdValid(userId, token)) {
            throw new AuthException();
        }
    }



    public static void validateDataturksTokenElseThrowException(String userId, String token) {
        if (!isDataturksUserIdValid(userId, token)) {
            LOG.error("Dataturks validation failed for user " + userId);
            EventsLogger.logErrorEvent("d_TokenValidationFailed");
            throw new AuthException();
        }
    }




    public static void validateAndGetDataturksUserIdElseThrowException(String userId, String token) {

        if (DBBasedConfigs.getConfig("isDataturksAuthTokenEnabled", Boolean.class, false)) {

            if(DUtils.getNonLoggedInUserId().equalsIgnoreCase(userId)) return;


            if (DBBasedConfigs.isInternalLoginAllowed()) {
                try {
                    InternalLoginAuth.validateDataturksTokenElseThrowException(userId, token);
                    return;
                }
                catch (Exception e) {
                    LOG.error(" Internal login failed for user id = " + userId);
                    //do nothing.
                    //TODO
                    //throw e;
                }
            }

            validateDataturksTokenElseThrowException(userId, token);
        }
    }
}
