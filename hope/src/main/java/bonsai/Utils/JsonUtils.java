package bonsai.Utils;

import bonsai.config.AppConfig;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Created by gajendra.dadheech on 6/9/17.
 */
public class JsonUtils {
    private static final Logger LOG = LoggerFactory.getLogger(JsonUtils.class);
    public static ObjectMapper objectMapper = new ObjectMapper();

    public static  String convertToJson(Object object) throws JsonProcessingException {
        return objectMapper.writeValueAsString(object);
    }

    public static String serialize(Object obj) {
        try {
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            String str = mapper.writeValueAsString(obj);
            return str;
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }
        return null;
    }

    public static Map<String, Object> stringToJson(String str) {
        try {
            ObjectMapper mapper = AppConfig.getInstance().getObjectMapper();
            Map<String, Object> jsonMap = mapper.readValue(str,
                    new TypeReference<Map<String,Object>>(){});
            return jsonMap;
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }
        return null;
    }

}

