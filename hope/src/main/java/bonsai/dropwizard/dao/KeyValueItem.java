package bonsai.dropwizard.dao;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by mohan on 9/8/17.
 */
@Entity
@Table(name = "keyValues")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.KeyValueItem.findAll",
                query = "select e from KeyValueItem e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.KeyValueItem.findAllByKey",
                query = "select e from KeyValueItem e "
                        + "where e.key = :key "),
        @NamedQuery(name = "bonsai.dropwizard.dao.KeyValueItem.findAllByType",
                query = "select e from KeyValueItem e "
                        + "where e.type = :type ")
})
public class KeyValueItem {
    /**
     * Entity's unique identifier.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "keyName")
    private String key;

    @Column(name = "typeName")
    private String type;

    @Column(name = "fieldValue")
    private String value;

    @Column(name = "notes")
    private String notes;

    /**
     * updated date
     */
    @Column(name = "updated_timestamp", insertable=false)
    private Date lastModified;

    public KeyValueItem() {

    }

    public KeyValueItem(String key, String type, String valueStr) {
        //setLastModified((new Date()).getTime() + "");
        this.key = key;
        this.type = type;
        this.value = valueStr;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String valuestr) {
        this.value = valuestr;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Date getLastModified() {
        return lastModified;
    }

    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }
}
