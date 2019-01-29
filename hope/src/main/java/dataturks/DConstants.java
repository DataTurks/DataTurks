package dataturks;

public class DConstants {

    public final static long FREE_PLAN_ID = 1;


    public static long ONE_DAY_MILISEC = 24*60*60*1000;

    public final static String HIT_STATUS_DONE = "done";
    public final static String HIT_STATUS_NOT_DONE = "notDone";
    public final static String HIT_STATUS_SKIPPED = "skipped";
    public final static String HIT_STATUS_DELETED = "deleted";
    public final static String HIT_STATUS_PRE_TAGGED = "preTagged";
    public final static String HIT_STATUS_REQUEUED = "reQueued";
    public final static String HIT_STATUS_ALL = null; //no filter

    public final static int MAX_HITS_TO_RETURN = 10;

    public final static String NON_LOGGED_IN_USER_ID = "123";

    //used to upload/download hits-->result pairs.
    public final static String TEXT_INPUT_RESULT_SEPARATOR = "\t";
    public final static String LABEL_SEPARATOR = "____";

    public final static String TRENDING_ORG_ID = "";

    public final static String UPLOADS_S3_PREFIX = "com.dataturks.a96-i23";
    public final static String UPLOADS_S3_FREE_PLAN_BUCKET = "open";

    public final static String PROJECT_STATUS_AUTO_UPDATED = "autoUpdated";

    ////////////// Request Param names.
    public final static String UPLOAD_FORMAT_PARAM_NAME  = "uploadFormat";
    public final static String UPLOAD_DATA_STATUS_PARAM_NAME  = "dataItemStatus";




}
