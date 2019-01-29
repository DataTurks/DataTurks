package dataturks.response;

public class APIKey {
    public String key;
    public String secret;

    public APIKey(String key, String secret) {
        this.key = key;
        this.secret = secret;
    }

    public APIKey() {
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }
}
