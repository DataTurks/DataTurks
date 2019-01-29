package dataturks.license;

import bonsai.DB.Refresher;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.DBConfigEntry;
import bonsai.dropwizard.dao.DBConfigEntryDAO;
import com.codahale.metrics.MetricRegistry;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dataturks.DataUploadHandler;
import dataturks.response.LicenseInfo;
import io.dropwizard.client.HttpClientBuilder;
import io.dropwizard.client.HttpClientConfiguration;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Cipher;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;

//used in onprem cases
// license decrpt format
// {"d":expiry_date, "c": customerId, "l": maxLabels_allowed}
public class LicenseHandler {

    private static final Logger LOG = LoggerFactory.getLogger(LicenseHandler.class);
    final int keySize = 2048;
    private static final String DATATURKS_LICENSE_ENDPOINT = "https://dataturks.com/dataturks/getLicense";
    private static final String LICENSE_KEY_FIELD_NAME = "dlicenseKey";
    private static final String LICENSE_FIELD_NAME = "dlicense";
    public static final String LICENSE_EXPIRED_FIELD_NAME = "dlicenseExpired";
    //write the license to DB.

    public static void handleAddNewLicense(String licenseOrKey) {
        String license = licenseOrKey;
        boolean isLicenseKeyMode = DBBasedConfigs.getConfig("isLicenseKeyMode", Boolean.class, true);
        if (isLicenseKeyMode) {
            String key = licenseOrKey;
            if (isSameLicenseAlreadyPresent(key)) { //duplicate call?
                return;
            }
            //use the key to fetch the actual license from dataturks.
            license = fetchLicenseFromServer(key);
        }

        if (LicenseHandler.isValidFormatLicense(license)) {
            LicenseHandler.saveLicense(license);
            markLicenseActive();
            if (isLicenseKeyMode) {
                LicenseHandler.saveLicenseKey(licenseOrKey);
            }

        }
        return;
    }

    public static LicenseInfo getLicenseInfo() {
        LicenseInfo licenseInfo = new LicenseInfo();
        try {
            JsonNode license = getDecryptedLicense();
            Date d = getLicenseExpiry();
            licenseInfo.setExpiry(d);
            long num = getLicenseLabelsAllowed();
            licenseInfo.setLabelsAllowed(num);
        }
        catch (Exception e) {
            licenseInfo.setPresent(false);
            return licenseInfo;
        }
        return licenseInfo;
    }

    private static boolean isSameLicenseAlreadyPresent(String key) {
        String licenseKey = LicenseHandler.getLicenseKey();
        if (licenseKey != null && key.contentEquals(licenseKey)) {
            return true;
        }
        return false;
    }

    private static String getLicenseKey() {
        return DBBasedConfigs.getConfig(LICENSE_KEY_FIELD_NAME, String.class, null);
    }

    private static void saveLicenseKey(String key) {
        DBConfigEntryDAO dao = AppConfig.getInstance().getDbConfigEntryDAO();
        DBConfigEntry entry = dao.findByKeyInternal(LICENSE_KEY_FIELD_NAME);
        if (entry == null) {
            entry = new DBConfigEntry(LICENSE_KEY_FIELD_NAME, key, "string");
            dao.createInternal(entry);
        }
        else {
            entry.setValue(key);
            dao.saveOrUpdateInternal(entry);
        }

        //refresh the config.
        Refresher.refresh();
    }

    // throw exception based on the server response.
    private static String fetchLicenseFromServer(String key) {
        //HttpClient httpClient = new HttpClientBuilder(new MetricRegistry()).using(new HttpClientConfiguration()).build("DataturksLicenseHandler");

        CloseableHttpClient httpClient = HttpClients.custom().useSystemProperties().build();

        JsonNode node = null;
        ObjectMapper objectMapper = AppConfig.getInstance().getObjectMapper();
        //make sure we are able to connect to remote.
        try {
            String url = DBBasedConfigs.getConfig("dDataturksLicenseEndpoint", String.class, DATATURKS_LICENSE_ENDPOINT);
            HttpPost request = new HttpPost(url);
            request.setHeader("key", key);
            HttpResponse response = httpClient.execute(request);
            HttpEntity entity = response.getEntity();
            if (entity != null) {
                node = objectMapper.readTree(EntityUtils.toByteArray(entity));
            }
        }
        catch (Exception e) {
            LOG.error(e.toString());
            e.printStackTrace();
            throw new WebApplicationException("Not able to connect to Dataturks.com, please ensure internet connectivity during license update.", Response.Status.BAD_GATEWAY);
        }

        if (node == null) {
            throw new WebApplicationException("No such license key found. Please contact us at support@dataturks.com.", Response.Status.BAD_REQUEST);

        }
        // all good.
        if (node.has("licenseText") &&
                node.get("licenseText") != null &&
                node.get("licenseText").textValue() != null &&
                node.get("licenseText").textValue().length() > 5) {
            return node.get("licenseText").textValue();
        }

        //validate the license key is valid

        if (!node.has("doesKeyExist") || node.get("doesKeyExist").booleanValue() == false) {
            throw new WebApplicationException("No such license key found. Please contact us at support@dataturks.com.", Response.Status.BAD_REQUEST);
        }
        //validate if the license key is not already in use.
        if (!node.has("keyAvailable") || node.get("keyAvailable").booleanValue() == false) {
            throw new WebApplicationException("The given license key is already in use. Please contact us at support@dataturks.com.", Response.Status.BAD_REQUEST);
        }


        throw new WebApplicationException("No such license key found. Please contact us at support@dataturks.com.", Response.Status.BAD_REQUEST);

    }


    public static void saveLicense(String license) {
        DBConfigEntryDAO dao = AppConfig.getInstance().getDbConfigEntryDAO();
        DBConfigEntry entry = dao.findByKeyInternal(LICENSE_FIELD_NAME);
        if (entry == null) {
            entry = new DBConfigEntry(LICENSE_FIELD_NAME, license, "string");
            dao.createInternal(entry);
        }
        else {
            entry.setValue(license);
            dao.saveOrUpdateInternal(entry);
        }

        //refresh the config.
        Refresher.refresh();
    }

    //make sure the format is correct
    public static boolean isValidFormatLicense(String license) {
        JsonNode data = getDecrypted(license); //throw exception if not valid.
        return true;
    }


    public static Date getLicenseExpiry() {
        JsonNode data = getDecryptedLicense();
        try {
            String dateStr = data.get("d").asText();
            DateFormat format = new SimpleDateFormat("dd-MM-yyyy");
            Date date = format.parse(dateStr);
            return date;
        }
        catch (Exception e) {
            LOG.error(e.toString());
            throw new WebApplicationException("A corrupted license found. Please contact us at support@dataturks.com", Response.Status.BAD_REQUEST);
        }

    }

    public static void markLicenseExpired() {
        DBConfigEntryDAO dao = AppConfig.getInstance().getDbConfigEntryDAO();
        DBConfigEntry entry = dao.findByKeyInternal(LICENSE_EXPIRED_FIELD_NAME);
        if (entry == null) {
            entry = new DBConfigEntry(LICENSE_EXPIRED_FIELD_NAME, "true", "boolean");
            dao.createInternal(entry);
        }
        else {
            entry.setValue("true");
            dao.saveOrUpdateInternal(entry);
        }
        //refresh the config.
        Refresher.refresh();
    }

    public static void markLicenseActive() {
        DBConfigEntryDAO dao = AppConfig.getInstance().getDbConfigEntryDAO();
        DBConfigEntry entry = dao.findByKeyInternal(LICENSE_EXPIRED_FIELD_NAME);
        if (entry != null) {
            entry.setValue("false");
            dao.saveOrUpdateInternal(entry);
        }
        //refresh the config.
        Refresher.refresh();
    }

    public static boolean isLicenseExpiredQuickCheck() {
        return DBBasedConfigs.getConfig(LICENSE_EXPIRED_FIELD_NAME, Boolean.class, false);
    }

    public static long getLicenseLabelsAllowed() {
        JsonNode data = getDecryptedLicense();
        try {
            return data.get("l").asLong();
        }
        catch (Exception e) {
            LOG.error(e.toString());
            throw new WebApplicationException("A corrupted license found. Please contact us at support@dataturks.com", Response.Status.BAD_REQUEST);
        }

    }

    //is the passed license equal to currently active license?
    public static boolean isCurrentLicense(String license) {
        if (license != null && !license.isEmpty()) {
            if (license.contentEquals(getLicenseKey())) {
                return true;
            }
        }
        return false;
    }


    public static JsonNode getDecrypted(String license) {
        try {
            String publicKey = getPublicKey();
            if (publicKey == null || publicKey.isEmpty()) {
                throw new WebApplicationException("No valid key found. Please contact us at support@dataturks.com", Response.Status.BAD_REQUEST);
            }
            String str = decrypt(license, publicKey);

            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            JsonNode node = mapper.readTree(str);
            return node;

        }
        catch (Exception e) {
            LOG.error(e.toString());
            throw new WebApplicationException("Either a corrupted key or corrupted license. Please contact us at support@dataturks.com", Response.Status.BAD_REQUEST);
        }
    }

    private static JsonNode getDecryptedLicense() {
        String license = getLicenseString();
        if (license == null || license.isEmpty()) {
            throw new WebApplicationException("No valid license found. Please contact us at support@dataturks.com", Response.Status.BAD_REQUEST);
        }

        return getDecrypted(license);
    }

    private static String getLicenseString() {
        return DBBasedConfigs.getConfig(LICENSE_FIELD_NAME, String.class, null);
    }

    private static String getPublicKey() {
        return DBBasedConfigs.getConfig("publicKey", String.class, null);
    }

    private static String decrypt(String cipherText, String key) throws Exception{
        byte[] reCipherBytes = Base64.getDecoder().decode(cipherText);
        byte[] verified = decryptRSA(getKey(key), reCipherBytes);
        return new String(verified);
    }

    private static byte[] decryptRSA(PublicKey publicKey, byte [] encrypted) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.DECRYPT_MODE, publicKey);
        return cipher.doFinal(encrypted);
    }

    private static PublicKey getKey(String key){
        try{
            String publicKeyContent = key.replaceAll("\\n", "").replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "");
            KeyFactory kf = KeyFactory.getInstance("RSA");
            X509EncodedKeySpec keySpecX509 = new X509EncodedKeySpec(Base64.getDecoder().decode(publicKeyContent));
            RSAPublicKey pubKey = (RSAPublicKey) kf.generatePublic(keySpecX509);
            return pubKey;
        }
        catch(Exception e){
            LOG.error(e.toString());
            e.printStackTrace();
        }

        return null;
    }


    public static PrivateKey getPrivateKey(String privateKeyStr) throws Exception{
        String privateKeyContent = privateKeyStr.replaceAll("\\n", "").replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "");
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec keySpecPKCS8 = new PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKeyContent));
        PrivateKey privKey = kf.generatePrivate(keySpecPKCS8);
        return privKey;

    }

    public static String encrypt(PrivateKey key, String str) throws Exception{

        Cipher cipher = Cipher.getInstance("RSA");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] bytes = cipher.doFinal(str.getBytes());
        String cipherText = Base64.getEncoder().encodeToString(bytes);
        return cipherText;
    }

    public static void main(String[] args) {

    }
}
