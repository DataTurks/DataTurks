package dataturks;

import bonsai.Constants;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DProjects;
import dataturks.aws.S3Handler;

import javax.ws.rs.WebApplicationException;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;


public class DataStorageHandler {

    public static List<String> uploadAndGetURLs(List<String> files, DProjects project) {
        if (DUtils.isOnPremMode()) {
            return uploadAndGetURLsLocal(files, project);
        }
        return S3Handler.uploadAndGetURLs(files, project);
    }

    public static String uploadAndGetURL(String filepath, DProjects project) {
        if (DUtils.isOnPremMode()) {
            return uploadAndGetURLLocal(filepath, project);
        }

        return S3Handler.uploadAndGetURL(filepath, project);
    }

    private static List<String> uploadAndGetURLsLocal(List<String> files, DProjects project) {
        List<String> urls = new ArrayList<>();
        for (String file : files) {
            String url = uploadAndGetURLLocal(file, project);
            if (url != null) {
                urls.add(url);
            }
        }
        return urls;
    }

    public static String uploadAndGetURLLocal(String filePath, DProjects project) {
        try {
            //form new path.
            String folderName = project.getId();
            String storagePath = DBBasedConfigs.getConfig("dUploadStoragePath", String.class, Constants.DEFAULT_FILE_STORAGE_DIR);
            Path folderPath = Paths.get(storagePath, folderName);
            Path newFilePath = folderPath.resolve(DUtils.createUniqueFileName(filePath));
            File directory = new File(folderPath.toString());
            if (!directory.exists()) {
                directory.mkdirs();
            }

            Path oldFilePath = Paths.get(filePath);
            Files.copy(oldFilePath, newFilePath, StandardCopyOption.REPLACE_EXISTING);

            //url like "/uploads/sdkjfhfh7768gjgjjh/98856jjhhn___playing.jpg"
            return "/" + folderPath.getParent().getFileName() + "/" + folderPath.getFileName() + "/" + newFilePath.getFileName();
        }
        catch (Exception e) {
            throw new WebApplicationException("Error storing file locally, either the disk is full or some other error occured.");
        }
    }
}
