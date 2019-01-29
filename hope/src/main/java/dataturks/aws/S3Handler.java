package dataturks.aws;

import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DProjects;
import bonsai.email.ScheduledEmails;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.ClientConfiguration;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.PutObjectRequest;
import dataturks.DConstants;

import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.Bucket;
import dataturks.DataUploadHandler;
import dataturks.Validations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import java.io.File;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

public class S3Handler {

    private AmazonS3 s3;
    private static final Logger LOG = LoggerFactory.getLogger(S3Handler.class);
    private static S3Handler instance = new S3Handler();
    private static ExecutorService executorService;

    private S3Handler(){
        int s3ConnectionTimeout = DBBasedConfigs.getConfig("dtS3TimeoutMs", Integer.class, 5000);
        ClientConfiguration configuration = (new ClientConfiguration()).withConnectionTimeout(s3ConnectionTimeout).withSocketTimeout(s3ConnectionTimeout);
        s3 = AmazonS3ClientBuilder.standard().withRegion(Regions.US_EAST_1).withClientConfiguration(configuration).build();

        executorService = Executors.newFixedThreadPool(DBBasedConfigs.getConfig("dtS3PushThreads", Integer.class, 10));

    }

    public static S3Handler getInstance() {
        return instance;
    }

    private boolean createBucketIfNoExists(String bucket_name) {
        if (!s3.doesBucketExistV2(bucket_name)) {
            s3.createBucket(bucket_name);
        }
        return true;
    }

    private String upload(String key, String filepath, String bucketName) {
        try {
            s3.putObject(new PutObjectRequest(bucketName, key, new File(filepath)).withCannedAcl(CannedAccessControlList.PublicRead));
            URL url = s3.getUrl(bucketName, key);
            //using https with '.' in the bucket name causes certificate error while accesing the url, hence move to http
            if (url != null) {
                return String.valueOf(url).replaceFirst("^https", "http");
            }
        } catch (Exception e) {
            LOG.error("Error uploading file to s3 bucket named " + bucketName + " filepath = : "  + filepath + " Error = " + e.toString());
        }
        return null;
    }

    private static String getBucketName(DProjects project) {
        String bucketPrefix = DBBasedConfigs.getConfig("dtUploadsS3Prefix", String.class, DConstants.UPLOADS_S3_PREFIX);

        if (Validations.isFreePlanProject(project)) {
            String freePlanBucketName = DBBasedConfigs.getConfig("dtUploadsS3FreePlanBucketName", String.class, DConstants.UPLOADS_S3_FREE_PLAN_BUCKET);
            return bucketPrefix + "." + freePlanBucketName;
        }

        return bucketPrefix + "." + project.getOrgId();
    }

    private static void getCreateBucketOrThrowException(String bucketName) {
        try {
            getInstance().createBucketIfNoExists(bucketName);
        }
        catch (Exception e) {
            LOG.error("Error creating s3 bucket named " + bucketName + " Error = : " + e.toString());
            throw new WebApplicationException("An internal error occurred while performing the operation. Please contact support.", Response.Status.BAD_GATEWAY);
        }
    }

    private static String uploadFileGetURL(String filepath, String bucketName, String folderName) {
        //create a random key for the filepath.
        // ideally we would want the key to be like "UUID___filename.jpg", this will make sure the
        // key is unique and the file extension/name is preserved.
        String uuid = UUID.randomUUID().toString();

        //the file name can already be formed as a UUID___filename.jpg while uploading to local fs.
        //if so, dpn't use that UUID, don't want to make the filename too long.
        Path p = Paths.get(filepath);
        String filename = p.getFileName().toString();
        String[] nameParts = filename.split("___");
        if (nameParts.length > 1) {
            filename = nameParts[1];
        }

        String key = folderName + "/" + uuid + "___" + filename;
        return getInstance().upload(key, filepath, bucketName);

    }

    public static String getFileNameFromURL(String url) {
        String[] parts = url.split("___");
        return parts[parts.length - 1];
    }

    public static List<String> uploadAndGetURLs(List<String> files, DProjects project) {
        return uploadAndGetURLsParallel(files, project);
//        List<String> urls = new ArrayList<>();
//        String bucketName = getBucketName(project);
//        //if we couldn't create a bucket.
//        getCreateBucketOrThrowException(bucketName);
//
//        String folderName = project.getId();
//
//        for (String file : files) {
//            String url = uploadFileGetURL(file, bucketName, folderName);
//            if (url != null) {
//                urls.add(url);
//            }
//        }
//        return urls;
    }

    public static List<String> uploadAndGetURLsParallel(List<String> files, DProjects project) {
        List<String> urls = new ArrayList<>();
        String bucketName = getBucketName(project);
        //if we couldn't create a bucket.
        getCreateBucketOrThrowException(bucketName);

        String folderName = project.getId();

        List<Future<String>> futures = new ArrayList<>();

        for (String file : files) {
            final Future<String> future = executorService.submit(new Callable<String>() {
                @Override
                public String call() throws Exception {
                    return uploadFileGetURL(file, bucketName, folderName);
                }
            });
            futures.add(future);
        }

        for (Future<String> f : futures) {
            try {
                String url = f.get();
                if (url != null) {
                    urls.add(url);
                }
            }
            catch (InterruptedException | ExecutionException ex) {
                LOG.error("S3Paallel push error " + ex.toString());
            }
        }
        return urls;
    }


    public static String uploadAndGetURL(String filepath, DProjects project) {
        String bucketName = getBucketName(project);
        //if we couldn't create a bucket.
        getCreateBucketOrThrowException(bucketName);
        String folderName = project.getId();
        String url = uploadFileGetURL(filepath, bucketName, folderName);
        return url;
    }
}
