package dataturks.fileFormats;

import dataturks.DTypes;
import dataturks.DataUploadHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static bonsai.Utils.UploadFileUtil.BUFFER_SIZE;

public class ZipHandler {
    private static final Logger LOG = LoggerFactory.getLogger(ZipHandler.class);

    private final static String DOCX_ZIP_COMPONENT_FILENAME = "[Content_Types].xml";

    public static boolean isDocX(String zipFilepath) {
        try {
            ZipInputStream zipIn = new ZipInputStream(new FileInputStream(zipFilepath));
            ZipEntry entry = zipIn.getNextEntry();
            // iterates over entries in the zip file
            while (entry != null) {
                if (DOCX_ZIP_COMPONENT_FILENAME.equalsIgnoreCase(entry.getName())) {
                    return true;
                }
                entry = zipIn.getNextEntry();
            }
        }
        catch (Exception e){
            LOG.error("isDocX for file " + zipFilepath + " Error = " + e.toString());
        }
        return false;
    }

    public static List<String> getAllFilesFromArchive(String zipFilePath, String destDirectory) {
        List<String> files = null;
        //first try with UTF-8.
        try {
            files = getAllFilesFromArchive(zipFilePath,  destDirectory, StandardCharsets.UTF_8);
        }
        catch (Exception e) {
            //try with windows format.
            LOG.error("Trying to extract " + zipFilePath + " with windows format...");
            try {
                files = getAllFilesFromArchive(zipFilePath, destDirectory, Charset.forName("windows-1252"));
            }
            catch (Exception e1) {
                LOG.error("Trying to extract " + zipFilePath + " with CP437 format...");
                files = getAllFilesFromArchive(zipFilePath, destDirectory, Charset.forName("Cp437"));
            }
        }
        return files;
    }

    //unzip the file into destinationDirPath
    //walk recursively and get all files paths.
    public static List<String> getAllFilesFromArchive(String zipFilePath, String destDirectory, Charset charset) {
        List<String> allFiles = new ArrayList<>();
        File destDir = new File(destDirectory);
        if (!destDir.exists()) {
            destDir.mkdir();
        }
        try {
            ZipInputStream zipIn = new ZipInputStream(new FileInputStream(zipFilePath), charset);
            ZipEntry entry = zipIn.getNextEntry();
            // iterates over entries in the zip file
            while (entry != null) {
                try {
                    String fileName = entry.getName().replaceAll("/", "_"); //some zips can contain directories.
                    String filePath = destDirectory + File.separator + fileName;
                    if (!entry.isDirectory()) {
                        // if the entry is a file, extracts it
                        extractFile(zipIn, filePath);
                        allFiles.add(filePath);
                    } else {
                        // if the entry is a directory, make the directory
                        File dir = new File(filePath);
                        dir.mkdir();
                    }
                    zipIn.closeEntry();
                }
                catch (Exception e) {
                    LOG.error("Error extracting zip item from file " + zipFilePath + " Error = " + e.toString());
                }
                entry = zipIn.getNextEntry();
            }
            zipIn.close();
        }
        catch (Exception e) {
            e.printStackTrace();
            LOG.error("Unable to extract the zip file " + zipFilePath +  " Error = " + e.toString());
            throw new WebApplicationException("Unable to extract the zip file ", Response.Status.BAD_REQUEST);
        }
        return allFiles;
    }

    /**
     * Extracts a zip entry (file entry)
     * @param zipIn
     * @param filePath
     * @throws IOException
     */
    private static void extractFile(ZipInputStream zipIn, String filePath) throws IOException {
        BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(filePath));
        byte[] bytesIn = new byte[BUFFER_SIZE];
        int read = 0;
        while ((read = zipIn.read(bytesIn)) != -1) {
            bos.write(bytesIn, 0, read);
        }
        bos.close();
    }

    public static void main(String[] args) {
        String filePath = "/Users/mohan/Download/f9ad45c5-b27f-498b-94d7-07626427bd57___ã\u0082·ã\u0083\u00ADã\u0083\u008A.zip";
        String dir = "/Users/mohan/personal/dataturks/dataturks/datasets/temp_extract_from_hope1/";
        List<String>  files = getAllFilesFromArchive(filePath, dir);
        LOG.info(files.size() + " ");
    }
}
