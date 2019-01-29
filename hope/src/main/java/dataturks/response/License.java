package dataturks.response;

public class License {
    public boolean keyAvailable; //not already used.
    public  boolean doesKeyExist;

    public String licenseText;

    public License() {
    }

    public License(String licenseText) {
        this.licenseText = licenseText;
    }

    public String getLicenseText() {
        return licenseText;
    }

    public void setLicenseText(String licenseText) {
        this.licenseText = licenseText;
    }

    public boolean isKeyAvailable() {
        return keyAvailable;
    }

    public void setKeyAvailable(boolean keyAvailable) {
        keyAvailable = keyAvailable;
    }

    public boolean isDoesKeyExist() {
        return doesKeyExist;
    }

    public void setDoesKeyExist(boolean doesKeyExist) {
        this.doesKeyExist = doesKeyExist;
    }
}
