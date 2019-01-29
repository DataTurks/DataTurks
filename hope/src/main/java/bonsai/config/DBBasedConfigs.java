package bonsai.config;

import bonsai.DB.Refresher;

import bonsai.Utils.CommonUtils;

import bonsai.dropwizard.dao.DBConfigEntry;
import bonsai.dropwizard.dao.DBConfigEntryDAO;
import bonsai.interfaces.Reloadable;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.ListenableFutureTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Created by mohan.gupta on 11/04/17.
 */
public class DBBasedConfigs implements Reloadable {
    private static final Logger LOG = LoggerFactory.getLogger(DBBasedConfigs.class);
    private static final String key = "DBConfigsKey";

    private static DBBasedConfigs instance = new DBBasedConfigs();

    // Contains merchant Name  ---> info (the info if has a regex, we do matching based on regexmatch in a loop).
    private LoadingCache<String, Map<String, Object>> configs;

    private DBConfigEntryDAO dbConfigEntryDAO;


    public static DBBasedConfigs getInstance() {
        return instance;
    }

    private DBBasedConfigs() {
    }

    public void init(DBConfigEntryDAO dbConfigEntryDAO) {
        this.dbConfigEntryDAO = dbConfigEntryDAO;
        configs = CacheBuilder.newBuilder().maximumSize(10l).refreshAfterWrite(30, TimeUnit.MINUTES).build(new DBConfigLoader(dbConfigEntryDAO));
        Refresher.register(this);
    }

    private static Map<String, Object> getAllConfigs() {
        try {
            Map<String, Object> all =  getInstance().configs.get(key);
            return all;
        }
        catch (Exception e) {
            LOG.error(e.toString());

        }
        return Collections.emptyMap();
    }

    public static <T> T getConfig(String key, Class<T> classType, T defaultValue) {
        Map<String, Object> all = getAllConfigs();
        try {
            if (all.containsKey(key)) {
                Object valObj = all.get(key);
                if (classType.isAssignableFrom(valObj.getClass())) {
                    return classType.cast(valObj);
                }
            }
        }
        catch (Exception e) {
            LOG.error("For key = " + key + e.toString());
        }
        return defaultValue;

    }

    public void reload() {
        if (configs != null) {
            configs.refresh(key);
        }
    }

    //used for on-prem etc.
    public static boolean isInternalLoginAllowed() {
        return DBBasedConfigs.getConfig("internalLoginAllowed", Boolean.class, false);
    }

    //used for on-prem etc.
    public static boolean isImageUploadAllowed() {
        return DBBasedConfigs.getConfig("imageUploadAllowed", Boolean.class, true);
    }

    private static class DBConfigLoader extends CacheLoader<String, Map<String, Object>> {

        private ObjectMapper objectMapper = new ObjectMapper();
        private DBConfigEntryDAO dbConfigEntryDAO;
        public DBConfigLoader(DBConfigEntryDAO dbConfigEntryDAO) {
            this.dbConfigEntryDAO = dbConfigEntryDAO;
        }

        private static ExecutorService executors = Executors.newFixedThreadPool(1);

        @Override
        public  Map<String, Object> load(String key) throws Exception {
            LOG.info("Calling load method for DBConfigLoader ..");
            return getData();
        }

        private Map<String, Object> getData() {
            try {
                List<DBConfigEntry> configs =  dbConfigEntryDAO.findAllInternal();
                return processConfigs(configs);
            }
            catch (Exception e) {
                LOG.error(CommonUtils.getStackTraceString(e));
                return Collections.emptyMap();
            }
        }

        public ListenableFuture<Map<String, Object>> reload(final String key,Map<String, Object> object)  {
            // asynchronous!
            ListenableFutureTask<Map<String, Object>> task = ListenableFutureTask.create(new Callable<Map<String, Object>>() {

                public Map<String, Object> call() throws Exception {
                    LOG.info("calling reloading method for DBConfigLoader..");
                    return getData();
                }
            });

            executors.execute(task);
            return task;
        }

        private Map<String, Object> processConfigs(List<DBConfigEntry> rawConfigs) {
            if (rawConfigs != null) {
                Map<String, Object> map = new HashMap<String, Object>();

                for (DBConfigEntry configEntry : rawConfigs) {
                    String keyName = configEntry.getKey();
                    try {
                        String type = configEntry.getType();
                        String valueStr = configEntry.getValue();
                        Object valueObj = null;
                        if ("int".equalsIgnoreCase(type)) {
                            valueObj = Integer.parseInt(valueStr);
                        } else if ("double".equalsIgnoreCase(type)) {
                            valueObj = Double.parseDouble(valueStr);
                        }
                        else if ("string".equalsIgnoreCase(type)) {
                            valueObj = valueStr;
                        }
                        else if ("boolean".equalsIgnoreCase(type)) {
                            valueObj = Boolean.parseBoolean(valueStr);
                        }
                        else if("list".equalsIgnoreCase(type)){
                            valueObj = objectMapper.readValue(valueStr, List.class);
                        }
                        else if ("assoc".equalsIgnoreCase(type)) {
                            valueObj = objectMapper.readValue(valueStr, Map.class);
                        }
                        else {
                            LOG.error("Unrecognized type " + type);
                        }

                        if (valueObj != null) {
                            map.put(keyName, valueObj);
                        }
                    }
                    catch (Exception e) {
                        LOG.error("For " + keyName +  e.toString());
                    }
                }

                return map;
            }
            return Collections.emptyMap();
        }
    }
}
