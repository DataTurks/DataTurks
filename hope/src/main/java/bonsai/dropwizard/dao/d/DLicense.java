package bonsai.dropwizard.dao.d;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "d_onprem_license")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DLicense.findAll",
                query = "select e from DLicense e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DLicense.findById",
                query = "select e from DLicense e "
                        + "where e.id = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DLicense.findByKey",
                query = "select e from DLicense e "
                        + "where e.keyText = :keyText ")

})
public class DLicense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String keyText;
    private String licenseText;
    private String licenseConfig;
    private String clientName;


    private String website;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String city;
    private String country;


    private String notes;
    private java.util.Date activated_on_timestamp;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DLicense() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getKey() {
        return keyText;
    }

    public void setKey(String key) {
        this.keyText = key;
    }

    public String getLicenseText() {
        return licenseText;
    }

    public void setLicenseText(String licenseText) {
        this.licenseText = licenseText;
    }

    public String getLicenseConfig() {
        return licenseConfig;
    }

    public void setLicenseConfig(String licenseConfig) {
        this.licenseConfig = licenseConfig;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Date getActivated_on_timestamp() {
        return activated_on_timestamp;
    }

    public void setActivated_on_timestamp(Date activated_on_timestamp) {
        this.activated_on_timestamp = activated_on_timestamp;
    }

    public Date getCreated_timestamp() {
        return created_timestamp;
    }

    public void setCreated_timestamp(Date created_timestamp) {
        this.created_timestamp = created_timestamp;
    }

    public Date getUpdated_timestamp() {
        return updated_timestamp;
    }

    public void setUpdated_timestamp(Date updated_timestamp) {
        this.updated_timestamp = updated_timestamp;
    }
}
