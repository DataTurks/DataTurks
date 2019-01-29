package bonsai.manual;

import bonsai.config.AppConfig;
import bonsai.dropwizard.DbConfig;
import bonsai.dropwizard.core.MainApp;
import bonsai.dropwizard.dao.d.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dropwizard.testing.junit.DropwizardAppRule;
import org.apache.http.client.HttpClient;
import org.junit.ClassRule;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DDAOTests {
    private static Logger LOG = LoggerFactory.getLogger(DDAOTests.class);

    @ClassRule
    public static final DropwizardAppRule<DbConfig> RULE =
            new DropwizardAppRule<DbConfig>(MainApp.class, "local.properties.yml");


    private static HttpClient httpClient = null;
    private static ObjectMapper objectMapper = new ObjectMapper();

    private static void log(String msg) {
        System.out.println(msg);
        LOG.info(msg);
    }


    public <T extends IDdbPojo, K extends IDDao>  void testDBPOJO(T obj, K dao) {

        log("testing db<->pojo for " + obj.getClass().getSimpleName());
        T fromDB = null, fromDB1 = null, afterDelete = null;

        obj.setNotes("notes");
        Object idOut = dao.createInternal(obj);
        String id = null;
        if (idOut instanceof Long)
            id = Long.toString((Long)idOut);
        else id = (String) idOut;

        log("Created user with id = " + id);

        // try to get from cache.
        fromDB = (T)dao.findByIdInternal(id);
        assert (fromDB != null) : "fromDB is null";
        assert ( fromDB.getNotes().equalsIgnoreCase(obj.getNotes())): "fromDB value doesn't match";

        //update .
        String updateValue = "updated notes";
        fromDB.setNotes(updateValue);
        dao.saveOrUpdateInternal(fromDB);

        fromDB1 = (T)dao.findByIdInternal(id);
        assert (fromDB1 != null): "after update fromDB is null";
        assert (fromDB1.getNotes().equalsIgnoreCase(updateValue)): "after update fromDB value doesn't match";


        //delete the object.
        dao.deleteInternal(fromDB1);

        //make sure not found in db any more.
        afterDelete = (T)dao.findByIdInternal(id);
        assert (afterDelete == null) : "after delete fromDB is not null";

    }

    @Test
    public void testDBPojos() {

        testDBPOJO(new DHits("123"), AppConfig.getInstance().getdHitsDAO());
        testDBPOJO(new DHitsResult(23, "projectid", "123"), AppConfig.getInstance().getdHitsResultDAO());
        testDBPOJO(new DOrgs("123"), AppConfig.getInstance().getdOrgsDAO());
        testDBPOJO(new DOrgUsers("123", "123"), AppConfig.getInstance().getdOrgUsersDAO());
        testDBPOJO(new DProjects("123", "123"), AppConfig.getInstance().getdProjectsDAO());
        testDBPOJO(new DProjectUsers("123", "123"), AppConfig.getInstance().getdProjectUsersDAO());
        testDBPOJO(new DSubscriptionPlans("123"), AppConfig.getInstance().getdSubscriptionPlansDAO());
        testDBPOJO(new DSubscriptions("123"), AppConfig.getInstance().getdSubscriptionsDAO());
        testDBPOJO(new DUsers("abc", "mohangupta13@gmail.com"), AppConfig.getInstance().getdUsersDAO());
        testDBPOJO(new DProjectInvites("abc", "123", "mohan@bonsaiapp.in", "CONTRIBUTOR"), AppConfig.getInstance().getdProjectInvitesDAO());
    }


}
