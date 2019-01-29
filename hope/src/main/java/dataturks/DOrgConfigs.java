package dataturks;

import bonsai.Constants;
import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

//mostly the limit values for a given org.
public class DOrgConfigs {
    private static final Logger LOG = LoggerFactory.getLogger(DOrgConfigs.class);

    public long numHitsPerProject;
    public long maxUploadSizeInBytes;
    public long maxHitDataLength;
    public long numLabelsAllowed;
    public boolean projectDeleteAllowed = true;

    public static DOrgConfigs getDefault() {
        DOrgConfigs configs = new DOrgConfigs();
        configs.setMaxHitDataLength(DBBasedConfigs.getConfig("maxStringLengthForTextTasks", Integer.class, Constants.MAX_STRING_LENGTH_FOR_TEXT_TASK));
        configs.setMaxUploadSizeInBytes((long)DBBasedConfigs.getConfig("fileUploadMaxSizeBytes", Integer.class, Constants.MAX_FILE_UPLOAD_SIZE));
        configs.setNumHitsPerProject((long)DBBasedConfigs.getConfig("dtMaxHitsPerProject", Integer.class, Constants.MAX_NUM_HITS_PER_PROJECT));
        configs.setNumLabelsAllowed((long)DBBasedConfigs.getConfig("dtNumLabelsAllowed", Integer.class, Constants.NUM_LABELS_ALLOWED));
        return configs;
    }
    public static DOrgConfigs getConfig(String configMapString) {
        DOrgConfigs configs = getDefault();
        try {
            Map<String, String> valueObj = AppConfig.getInstance().getObjectMapper().readValue(configMapString, Map.class);
            if (valueObj != null) {
                if (valueObj.containsKey("maxStringLengthForTextTasks")) {
                    configs.setMaxHitDataLength(Long.parseLong(valueObj.get("maxStringLengthForTextTasks")));
                }
                if (valueObj.containsKey("fileUploadMaxSizeBytes")) {
                    configs.setMaxUploadSizeInBytes(Long.parseLong(valueObj.get("fileUploadMaxSizeBytes")));
                }
                if (valueObj.containsKey("maxHitsPerProject")) {
                    configs.setNumHitsPerProject(Long.parseLong(valueObj.get("maxHitsPerProject")));
                }
                if (valueObj.containsKey("numLabelsAllowed")) {
                    configs.setNumLabelsAllowed(Long.parseLong(valueObj.get("numLabelsAllowed")));
                }
                if (valueObj.containsKey("projectDeleteAllowed")) {
                    configs.setProjectDeleteAllowed(Boolean.parseBoolean(valueObj.get("projectDeleteAllowed")));
                }
            }
        }
        catch (Exception e) {
            LOG.error("Error parsing config " + configMapString + " falling back to default config");
        }
        return configs;
    }

    public long getNumHitsPerProject() {
        return numHitsPerProject;
    }

    public void setNumHitsPerProject(long numHitsPerProject) {
        this.numHitsPerProject = numHitsPerProject;
    }

    public long getMaxUploadSizeInBytes() {
        return maxUploadSizeInBytes;
    }

    public void setMaxUploadSizeInBytes(long maxUploadSizeInBytes) {
        this.maxUploadSizeInBytes = maxUploadSizeInBytes;
    }

    public long getMaxHitDataLength() {
        return maxHitDataLength;
    }

    public void setMaxHitDataLength(long maxHitDataLength) {
        this.maxHitDataLength = maxHitDataLength;
    }

    public long getNumLabelsAllowed() {
        return numLabelsAllowed;
    }

    public void setNumLabelsAllowed(long numLabelsAllowed) {
        this.numLabelsAllowed = numLabelsAllowed;
    }

    public boolean isProjectDeleteAllowed() {
        return projectDeleteAllowed;
    }

    public void setProjectDeleteAllowed(boolean projectDeleteAllowed) {
        this.projectDeleteAllowed = projectDeleteAllowed;
    }
}
