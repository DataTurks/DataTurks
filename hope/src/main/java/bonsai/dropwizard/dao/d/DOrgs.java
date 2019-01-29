package bonsai.dropwizard.dao.d;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;


@Entity
@Table(name = "d_orgs")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DOrgs.findAll",
                query = "select e from DOrgs e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DOrgs.findById",
                query = "select e from DOrgs e "
                        + "where e.id = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DOrgs.findByName",
                query = "select e from DOrgs e "
                        + "where e.name = :name ")

})
public class DOrgs implements IDdbPojo{

    @Id
    @GeneratedValue(generator="system-uuid")
    @GenericGenerator(name="system-uuid", strategy = "uuid")
    private String id;
    private String name;
    private long subscriptionId;


    private String website;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String city;
    private String country;
    private String logoPic;

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DOrgs(){

    }

    public DOrgs(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(long subscriptionId) {
        this.subscriptionId = subscriptionId;
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

    public String getLogoPic() {
        return logoPic;
    }

    public void setLogoPic(String logoPic) {
        this.logoPic = logoPic;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
