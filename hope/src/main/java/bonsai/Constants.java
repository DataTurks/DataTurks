package bonsai;

/**
 * Created by mohan.gupta on 11/04/17.
 */
public class Constants {

    public static final String UNKNOWN_CATEGORY = "Others";
    public static final String UNKNOWN_MERCHANT_POPULAR_NAME = "Others";

    public static final String DEFAULT_LATITUTE = "12.9716";
    public static final String DEFAULT_LONGITUDE = "77.5946";

    public static final String DEFAULT_MERCHANT_NAME = "Others";

    //distance based.
    public static final int INFINITE_DISTANCE_MTRS = 999999;

    //Data turks annotations
    //all files uploaded on the system.
    public static final String DEFAULT_FILE_UPLOAD_DIR = "/tmp";
    public static final int MAX_FILE_UPLOAD_SIZE = 1024*1024*10; //10 MB.
    public static final int MAX_STRING_LENGTH_FOR_TEXT_TASK = 1000;
    public static final int MAX_NUM_HITS_PER_PROJECT = 10000;
    public static final int NUM_LABELS_ALLOWED = 20000;


    public static final String DEFAULT_FILE_DOWNLOAD_DIR = "/Users/mohan/personal/dataturks/uploads";

    public static final String DEFAULT_FILE_STORAGE_DIR = "/home/dataturks/bazaar/uploads";



    //Order String Constants
    public static final String MID_STRING = "MID";
    public static final String OID_STRING = "ORDER_ID";
    public static final String CID_STRING = "CUST_ID";
    public static final String IID_STRING = "INDUSTRY_TYPE_ID";
    public static final String CHID_STRING = "CHANNEL_ID";
    public static final String AMOUNT_STRING = "TXN_AMOUNT";
    public static final String WEBSITE_STRING = "WEBSITE";
    public static final String EMAIL_STRING = "EMAIL";
    public static final String PHONE_STRING = "MOBILE_NO";
    public static final String CALLBACK_STRING = "CALLBACK_URL";
    public static final String CHECKSUMHASH_STRING = "CHECKSUMHASH";


    // Paytm constants
//    public final static String MID = "Bonsai24368298499383";
//    public final static String MERCHANT_KEY = "NI63XkDklOw3K_FS";
//    public final static String INDUSTRY_TYPE_ID = "Retail";
//    public final static String CHANNEL_ID = "WAP";
//    public final static String WEBSITE = "APP_STAGING";
//    public final static String PAYTM_URL = "https://pguat.paytm.com/oltp-web/processTransaction";
//    public final static String PAYTM_CALLBACK_URL = "https://pguat.paytm.com/paytmchecksum/paytmCallback.jsp";
    public static final String PAYTM_TXN_STATUS_PROD_URL = "https://secure.payments.in/oltp/HANDLER_INTERNAL/getTxnStatus?";
    public static final String PAYTM = "payments";
    public static final String INSTAWEBHOOK = "https://bonsaiapp.in:8443/causes/instaWebhook";
    public static final String ROOT_PASSWD = "flipkart@123";
    public static final String GOOGLE_URL_SHORTENER_API_KEY = "AIzaSyCjaub1M_uANrm321uiptPoQ6H1VahHB9Y";
    public static String PAYTM_TXN_STATUS_STAGE_URL = "https://pguat.payments.com/oltp/HANDLER_INTERNAL/getTxnStatus?";

    public final static String MID = "TriTec64730333762916";
    public final static String MERCHANT_KEY = "Jq#!F3z9J%M%N2Vf";
    public final static String INDUSTRY_TYPE_ID = "Retail109";
    public final static String CHANNEL_ID = "WAP";
    public final static String WEBSITE = "TriTecWAP";
    public final static String PAYTM_URL = "https://secure.payments.in/oltp-web/processTransaction";
    public final static String PAYTM_CALLBACK_URL = "https://securegw.paytm.in/theia/paytmCallback?ORDER_ID=";


    //instamojo constants
    public static final String INSTAMOJO_TEST_API_ENDPOINT = "https://test.instamojo.com/api/1.1/";
    /**
     * The constant INSTAMOJO_TEST_AUTH_ENDPOINT.
     */
    public static final String INSTAMOJO_TEST_AUTH_ENDPOINT = "https://test.instamojo.com/oauth2/token/";
    /**
     * The constant TEST_CLIENT_ID.
     */
    public static final String TEST_CLIENT_ID = "Vq0zV7oiSq2s5duSqKAUaq4n27Wyi7fhEVAtyiX5";
    /**
     * The constant TEST_CLIENT_SECRET.
     */
    public static final String TEST_CLIENT_SECRET = "0M9XOHXovYAwb9Ml4u8ph8Jz3vSwKinXVKKohaQ2bvgEK2b73oUVqkmKEhi5AJO30N4YyD25Q0yHOQL7XKDVFEBlgkZhoT2LgEej3q5w3tXMC2In4LyLiQKvKAYiG1S6";

    public static final String   TEST_INSTA_API_KEY =  "e44d7a729795ece28a332eb77d57d177";
    public static final String TEST_INSTA_AUTH_TOKEN =  "a3d4346c8ea0559edbe26400f8780772";

    public static final String  PROD_INSTA_API_KEY =  "9cafd07305e119fea6ec8fa3d0a4df1a";
    public static final String  PROD_INSTA_AUTH_TOKEN =  "f83a3cf51aa21408496e90926a3abad7";

    public static final String  PROD_AWESOME_INSTA_API_KEY =  "de6b6d75460fa4809764cfeab9d9c8dd";
    public static final String  PROD_AWESOME_INSTA_AUTH_TOKEN =  "3649c22a83d6850663e0c4d95ca8ca80";


    public final static String PROD_CLIENT_ID = "rP757gWRUy0K5dLRp80t6VjMz1DzXOOlCAZ9w0mZ";
    public final static String PROD_CLIENT_SECRET = "f2LkKjH6SDy319lv1cO5cIUGmraKu5uK97HPxDOjDvlzMAgBAoqJx20jPcmrUAhiO5W2AXo0mfpCVw8RY0fWFXQJr2xlm5hSqY1KDFvct5yl9QV3ac3hj0AB4qgtOpgW";
    public static final String INSTAMOJO_PROD_API_ENDPOINT = "https://www.instamojo.com/api/1.1/";
    /**
     * The constant INSTAMOJO_TEST_AUTH_ENDPOINT.
     */
    public static final String INSTAMOJO_PROD_AUTH_ENDPOINT = "https://api.instamojo.com/oauth2/token/";

    //********************* STRING constants ************************/
    // this type is just a general purpose tag filter, based on the known causes,
    // just use the causes which are tagged by this.
    public static final String HERO_TYPE_TAG_BASED = "tag";
    // this type is handled by the actual code.
    public static final String HERO_TYPE_CUSTOM = "custom";
    // handled by the code which knows how to process kind based donation.
    public static final String HERO_TYPE_KIND_DONATE = "kind";


   public static final String SA_FB_ACCESS_TOKEN = "1447318198697541|I3I_SDzJ6ioSMjE2q1gzbzvBqNc";
//    public static final String SA_FB_ACCESS_TOKEN = "1653134178089854|VCwVh7Py1UnN3kqS0jWKOLe-V08";
   public static final String SA_FB_APP_SECRET = "77911b1be92906a34025cbbb2da310f2";
    //public static final String SA_FB_APP_SECRET = "d102d0610a4a711fbc0430d32a6ba609";  // Test app
    public static final String SA_FB_APP_ID = "1447318198697541";
   // public static final String SA_FB_APP_ID = "1653134178089854";  // Test app

    public static final String SA_COMPLETED = "COMPLETED";

    public static final String SA_FB_PROFILE = "facebookProfile";
    public static final String SA_FB = "facebook";
    public static final String SA_FB_PAGE = "facebookPage";
    public static final String SA_TW = "twitter";

    public static final String SA_TW_API_KEY = "B7jjLOiqkRALpJVYuBZIYFJlV";
    public static final String SA_TW_API_SECRET = "oIt7nw2aZfR2Q3UuA7wisopZVka2nj5BEgVe8G8rM6cdRBejCS";



    // Bazaar constants
    public static final String MSFT_CV_API_KEY =  "d3f0dc5cce724c3a99ce7c98651d6340";
    public static final String GOOGLE_BAZAAR_API_KEY =  "AIzaSyBi2p_EhhshOu_izNy2pMR5HVuOGPSZqTA";





}
