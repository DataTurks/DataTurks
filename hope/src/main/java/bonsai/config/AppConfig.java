package bonsai.config;

import bonsai.App;
import bonsai.dropwizard.DbConfig;
import bonsai.dropwizard.dao.*;
import bonsai.dropwizard.dao.d.*;
import com.codahale.metrics.MetricRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.LoggerFactory;

import org.slf4j.Logger;

/**
 * Created by mohan.gupta on 04/04/17.
 */
public class AppConfig {

    private static Logger LOG = LoggerFactory.getLogger(AppConfig.class);
    private ObjectMapper objectMapper = new ObjectMapper();
    private DbConfig dbConfig = null;


    private DBConfigEntryDAO dbConfigEntryDAO;

    private KeyValueItemDAO keyValueItemDAO;


    //Dataturks annotation.
    private DHitsDAO dHitsDAO;
    private DHitsResultDAO dHitsResultDAO;
    private DOrgsDAO dOrgsDAO;
    private DOrgUsersDAO dOrgUsersDAO;
    private DProjectsDAO dProjectsDAO;
    private DProjectUsersDAO dProjectUsersDAO;
    private DSubscriptionPlansDAO dSubscriptionPlansDAO;
    private DSubscriptionsDAO dSubscriptionsDAO;
    private DUsersDAO dUsersDAO;
    private DProjectInvitesDAO dProjectInvitesDAO;
    private DAPIKeysDAO dapiKeysDAO;
    private DLicenseDAO dLicenseDAO;




    private final MetricRegistry metrics = new MetricRegistry();

    private static AppConfig instance = new AppConfig();

    private AppConfig(){
    }

    public static AppConfig getInstance() {
        return instance;
    }
    //NOTE: make sure this method is called on app initialization always.
    public void init(DbConfig dbConfig) {
        LOG.info("Initing the app config...");
        this.dbConfig = dbConfig;
        fetchAllConfigsFromDB();
    }

    public String getDbHost() {
        return dbConfig.getHost();
    }
    public String getDbPort() {
        return dbConfig.getPort();
    }
    public String getDbName() {
        return dbConfig.getDbName();
    }
    public String getDbUser() {
        return dbConfig.getUser();
    }
    public String getDbPass() {
        return dbConfig.getPassword();
    }

    public String getFirebaseCredFilePath() {
        return dbConfig.getFirebaseCredFilePath();
    }

    private void fetchAllConfigsFromDB() {

    }

    public ObjectMapper getObjectMapper() { return objectMapper;}


    public DBConfigEntryDAO getDbConfigEntryDAO() {
        return dbConfigEntryDAO;
    }

    public void setDbConfigEntryDAO(DBConfigEntryDAO dbConfigEntryDAO) {
        this.dbConfigEntryDAO = dbConfigEntryDAO;
    }



    //Dataturks annotations.


    public DHitsDAO getdHitsDAO() {
        return dHitsDAO;
    }

    public void setdHitsDAO(DHitsDAO dHitsDAO) {
        this.dHitsDAO = dHitsDAO;
    }

    public DHitsResultDAO getdHitsResultDAO() {
        return dHitsResultDAO;
    }

    public void setdHitsResultDAO(DHitsResultDAO dHitsResultDAO) {
        this.dHitsResultDAO = dHitsResultDAO;
    }

    public DOrgsDAO getdOrgsDAO() {
        return dOrgsDAO;
    }

    public void setdOrgsDAO(DOrgsDAO dOrgsDAO) {
        this.dOrgsDAO = dOrgsDAO;
    }

    public DOrgUsersDAO getdOrgUsersDAO() {
        return dOrgUsersDAO;
    }

    public void setdOrgUsersDAO(DOrgUsersDAO dOrgUsersDAO) {
        this.dOrgUsersDAO = dOrgUsersDAO;
    }

    public DProjectsDAO getdProjectsDAO() {
        return dProjectsDAO;
    }

    public void setdProjectsDAO(DProjectsDAO dProjectsDAO) {
        this.dProjectsDAO = dProjectsDAO;
    }

    public DProjectUsersDAO getdProjectUsersDAO() {
        return dProjectUsersDAO;
    }

    public void setdProjectUsersDAO(DProjectUsersDAO dProjectUsersDAO) {
        this.dProjectUsersDAO = dProjectUsersDAO;
    }

    public DSubscriptionPlansDAO getdSubscriptionPlansDAO() {
        return dSubscriptionPlansDAO;
    }

    public void setdSubscriptionPlansDAO(DSubscriptionPlansDAO dSubscriptionPlansDAO) {
        this.dSubscriptionPlansDAO = dSubscriptionPlansDAO;
    }

    public DSubscriptionsDAO getdSubscriptionsDAO() {
        return dSubscriptionsDAO;
    }

    public void setdSubscriptionsDAO(DSubscriptionsDAO dSubscriptionsDAO) {
        this.dSubscriptionsDAO = dSubscriptionsDAO;
    }

    public DUsersDAO getdUsersDAO() {
        return dUsersDAO;
    }

    public void setdUsersDAO(DUsersDAO dUsersDAO) {
        this.dUsersDAO = dUsersDAO;
    }

    public DProjectInvitesDAO getdProjectInvitesDAO() {
        return dProjectInvitesDAO;
    }

    public void setdProjectInvitesDAO(DProjectInvitesDAO dProjectInvitesDAO) {
        this.dProjectInvitesDAO = dProjectInvitesDAO;
    }

    public DAPIKeysDAO getDapiKeysDAO() {
        return dapiKeysDAO;
    }

    public void setDapiKeysDAO(DAPIKeysDAO dapiKeysDAO) {
        this.dapiKeysDAO = dapiKeysDAO;
    }

    public DLicenseDAO getdLicenseDAO() {
        return dLicenseDAO;
    }

    public void setdLicenseDAO(DLicenseDAO dLicenseDAO) {
        this.dLicenseDAO = dLicenseDAO;
    }


    public KeyValueItemDAO getKeyValueItemDAO() {
        return keyValueItemDAO;
    }

    public void setKeyValueItemDAO(KeyValueItemDAO keyValueItemDAO) {
        this.keyValueItemDAO = keyValueItemDAO;
    }

    public MetricRegistry getMetrics() {
        return metrics;
    }
}


