package dataturks.security;


import bonsai.exceptions.AuthException;
import bonsai.sa.EventsLogger;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class InternalLoginAuth {

    private static final Logger LOG = LoggerFactory.getLogger(InternalLoginAuth.class);

    public static int UID_LENGTH = 28;
    public static int TOKEN_LENGTH = 64;

    private  static char[] possibleCharacters = (new String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")).toCharArray();

    private static InternalLoginAuth instance = new InternalLoginAuth();
    private Map<String, String> tokenCache = new ConcurrentHashMap<>();

    private InternalLoginAuth() {
    }
    private static InternalLoginAuth getInstance() {
        return instance;
    }

    public static String generateUserId() {
        String randomStr = RandomStringUtils.random( UID_LENGTH, 0, possibleCharacters.length-1, false, false, possibleCharacters, new SecureRandom() );
        return randomStr;
    }

    public static String generateRandomUserToken() {
        String randomStr = RandomStringUtils.random( TOKEN_LENGTH, 0, possibleCharacters.length-1, false, false, possibleCharacters, new SecureRandom() );
        return randomStr;
    }

    public static String encryptedPassword(String password) {
        return DigestUtils.sha256Hex(password);
    }

    public static void validateDataturksTokenElseThrowException(String userId, String token) {
        if (!isDataturksUserValid(userId, token)) {
            LOG.error("Dataturks validation failed for user " + userId);
            EventsLogger.logErrorEvent("d_TokenValidationFailed");
            throw new AuthException();
        }
    }

    public static void addToken(String userId, String token) {
        getInstance().tokenCache.put(userId, token);
    }

    private static boolean isDataturksUserValid(String userId, String token) {
        if (getInstance().tokenCache.containsKey(userId)) {
            return getInstance().tokenCache.get(userId).contentEquals(token);
        }
        return false;
    }


}
