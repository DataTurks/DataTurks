package dataturks.response;

import java.util.Date;

public class LicenseInfo {

    private boolean present = true; //is license present in the db
    private String msg;
    private Date expiry;
    private long labelsAllowed;

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Date getExpiry() {
        return expiry;
    }

    public void setExpiry(Date expiry) {
        this.expiry = expiry;
    }

    public long getLabelsAllowed() {
        return labelsAllowed;
    }

    public void setLabelsAllowed(long labelsAllowed) {
        this.labelsAllowed = labelsAllowed;
    }
}
