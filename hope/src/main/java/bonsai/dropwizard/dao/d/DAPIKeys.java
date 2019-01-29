package bonsai.dropwizard.dao.d;

import dataturks.DTypes;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "d_api_keys")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DAPIKeys.findAll",
                query = "select e from DAPIKeys e where status != 'DELETED'"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DAPIKeys.findById",
                query = "select e from DAPIKeys e "
                        + "where e.id = :id AND  status != 'DELETED'"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DAPIKeys.findByKey",
                query = "select e from DAPIKeys e "
                        + "where e.keyValue = :keyValue AND status != 'DELETED'"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DAPIKeys.findByUID",
                query = "select e from DAPIKeys e "
                        + "where e.uid = :uid AND status != 'DELETED'")

})
public class DAPIKeys implements IDdbPojo{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String uid;

    private String keyValue;
    private String secret;
    private String status = DTypes.APIKey_Status.NONE.toString();;

    public DAPIKeys(){}

    public DAPIKeys(String uid){
        this();
        this.uid = uid;
    }

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getKey() {
        return keyValue;
    }

    public void setKey(String key) {
        this.keyValue = key;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
