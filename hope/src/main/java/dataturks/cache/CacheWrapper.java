package dataturks.cache;

import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DUsers;
import dataturks.DReqObj;
import dataturks.jobs.TopProjects;
import dataturks.response.OrgProjects;
import dataturks.response.ProjectStats;
import dataturks.response.UserHome;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//handles key generation/object casting  etc.
public class CacheWrapper {
    private static Logger LOG = LoggerFactory.getLogger(CacheWrapper.class);

    //reset the caches when a project is created/deleted.
    public static void updateProjectCreateDelete(DReqObj reqObj, String orgId) {
        removeUserHome(reqObj);
        removeOrgProjects(reqObj, orgId);
    }

    public static void addUserHome(DReqObj reqObj, UserHome userHome) {
        if (isCachingEnabled()) {
            String key = getUserHomeKey(reqObj);
            CachedItems.put(key, userHome);
        }
    }

    public static void removeUserHome(DReqObj reqObj) {
        if (isCachingEnabled()) {
            String key = getUserHomeKey(reqObj);
            CachedItems.remove(key);
        }
    }

    public static UserHome getUserHome(DReqObj reqObj) {
        if (isCachingEnabled()) {
            String key = getUserHomeKey(reqObj);
            Object obj = CachedItems.get(key);
            if (obj != null && obj instanceof UserHome) {
                return (UserHome) obj;
            }
        }
        return null;
    }
    //form a cache key for the getUserHome objects
    public static String getUserHomeKey(DReqObj reqObj) {
        if (reqObj != null) return "UserHome__" + reqObj.getUid();
        else {
            LOG.error("getUserHomeKey generation reqObj is null..strange");
        }
        return null;
    }


    ///////////////////////// Org Projects ////////////////////////////////////////////////////

    // Cache the response of getOrgProjects for a given user.
    // Here the cache key is the org the request is made for and the user in whose context the request is made.
    // a user may not have access to all the projects of a org.

    //form a cache key for the getOrgProjects objects
    public static String getOrgProjectsKey(DReqObj reqObj, String orgId) {
        if (reqObj != null && orgId != null) return "orgProjects_" + reqObj.getUid() + "_org_" +  orgId;
        else {
            LOG.error("getOrgProjectsKey generation reqObj is null..strange");
        }
        return null;
    }


    public static void addOrgProjects(DReqObj reqObj, String orgId, OrgProjects obj) {
        if (isCachingEnabled()) {
            String key = getOrgProjectsKey(reqObj, orgId);
            CachedItems.put(key, obj);
        }
    }

    public static void removeOrgProjects(DReqObj reqObj, String orgId) {
        if (isCachingEnabled()) {
            String key = getOrgProjectsKey(reqObj, orgId);
            CachedItems.remove(key);
        }
    }

    public static OrgProjects getOrgProjects(DReqObj reqObj, String orgId) {
        if (isCachingEnabled()) {
            String key = getOrgProjectsKey(reqObj, orgId);
            Object obj = CachedItems.get(key);
            if (obj != null && obj instanceof OrgProjects) {
                return (OrgProjects) obj;
            }
        }
        return null;
    }

    ///////////////////////// Project Stats ////////////////////////////////////////////////////

    // Cache the response of getProjectStats for a given user.
    // Here the cache key is the projectid the request is made for and the user in whose context the request is made.
    // a user may not have access to all the project..

    //form a cache key for the getOrgProjects objects
    public static String getProjectStatsKey(DReqObj reqObj, String projectId) {
        if (reqObj != null && projectId != null) return "projectStats_" + reqObj.getUid() + "_projectId_" +  projectId;
        else {
            LOG.error("getProjectStatsKey generation reqObj/projectId is null..strange");
        }
        return null;
    }


    public static void addProjectStats(DReqObj reqObj, String projectId, ProjectStats obj) {
        if (isCachingEnabled()) {
            String key = getProjectStatsKey(reqObj, projectId);
            CachedItems.put(key, obj);
        }
    }

    public static void removeProjectStats(DReqObj reqObj, String projectId) {
        if (isCachingEnabled()) {
            String key = getProjectStatsKey(reqObj, projectId);
            CachedItems.remove(key);
        }
    }

    public static ProjectStats getProjectStats(DReqObj reqObj, String projectId) {
        if (isCachingEnabled()) {
            String key = getProjectStatsKey(reqObj, projectId);
            Object obj = CachedItems.get(key);
            if (obj != null && obj instanceof ProjectStats) {
                return (ProjectStats) obj;
            }
        }
        return null;
    }


    ///////////////////////////////// uid to User //////////////////////////////////

    public static String getUserKey(String uid) {
        if (uid != null) return "user_" +  uid;
        else {
            LOG.error("getUserKey generation uid is null..strange");
        }
        return null;
    }

    public static DUsers getUserFromCache(String uid) {
        if (isCachingEnabled()) {
            String key = getUserKey(uid);
            Object obj = CachedItems.get(key);
            if (obj != null && obj instanceof DUsers) {
                return (DUsers) obj;
            }
        }
        return null;
    }

    public static void addUser(String uid, DUsers obj) {
        if (isCachingEnabled()) {
            String key = getUserKey(uid);
            CachedItems.put(key, obj);
        }
    }



    public static boolean isCachingEnabled() {
        return DBBasedConfigs.getConfig("dCacheEnabled", Boolean.class, false);
    }

}
