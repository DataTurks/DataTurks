package dataturks.cache;

import bonsai.Utils.CommonUtils;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.DBConfigEntry;
import bonsai.dropwizard.dao.DBConfigEntryDAO;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.ListenableFutureTask;
import dataturks.jobs.TopProjects;
import dataturks.response.OrgProjects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class CachedItems {

    private static Logger LOG = LoggerFactory.getLogger(TopProjects.class);
    private static CachedItems instance = new CachedItems();

    private LoadingCache<String, Object> cache;
    private Cache<String, Object> keyValueStore; //non-loading cache.


    public static CachedItems getInstance() {
        return instance;
    }

    private static String KEY_TOP_PROJECTS = "topProjects";

    private CachedItems() {
        cache = CacheBuilder.newBuilder().maximumSize(100l).refreshAfterWrite(60*4, TimeUnit.MINUTES).build(new CacheLoaderInternal());

        int keyValueStoreMaxSize = DBBasedConfigs.getConfig("dkeyValueStoreMaxSize", Integer.class, 1000);
        int keyValueExpiryTimeSec = DBBasedConfigs.getConfig("keyValueExpiryTimeSec", Integer.class, 60*10);

        keyValueStore = CacheBuilder.newBuilder().maximumSize(keyValueStoreMaxSize).expireAfterWrite(keyValueExpiryTimeSec, TimeUnit.SECONDS).build();
    }


    public static OrgProjects getTopProjects() {
        String key = KEY_TOP_PROJECTS;
        try {
            Object val = getInstance().cache.get(key);
            if (val != null && val instanceof  OrgProjects)
                return (OrgProjects) val;
        }
        catch (Exception e) {
            LOG.error("Getting top projects from cache " + e.toString() + " " + CommonUtils.getStackTraceString(e));
        }
        return null;

    }

    // Methods for the keyValue store, non-loading cache.
    public static void put(String key, Object value) {
        if (key == null || value == null) return; //not storing null values.
        getInstance().keyValueStore.put(key, value);
    }

    public static void remove(String key) {
        if (key == null) return;
        getInstance().keyValueStore.invalidate(key);
    }

    public static Object get(String key) {
        if (key == null) return null;
        return getInstance().keyValueStore.getIfPresent(key);
    }



    private static class CacheLoaderInternal extends CacheLoader<String, Object> {

        private static ExecutorService executors = Executors.newFixedThreadPool(1);

        private Object getData(String key) {
            LOG.info("Calling getData method for CachedItems for key " + key + "..");
            if (key.equalsIgnoreCase(KEY_TOP_PROJECTS)) {
                return TopProjects.getAllTopProjects();
            }
            return new Object();
        }

        @Override
        public Object load(String key) throws Exception {
            LOG.info("Calling load method for CachedItems for key " + key + "..");
            return getData(key);
        }


        public ListenableFuture<Object> reload(final String key, Object object) {
            // asynchronous!
            ListenableFutureTask<Object> task = ListenableFutureTask.create(new Callable<Object>() {

                public Object call() throws Exception {
                    LOG.info("calling reloading method for CachedItems..");
                    return getData(key);
                }
            });

            executors.execute(task);
            return task;
        }
    }


}
