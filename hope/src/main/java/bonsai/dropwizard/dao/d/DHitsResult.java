package bonsai.dropwizard.dao.d;


import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "d_hits_result")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHitsResult.findAll",
                query = "select e from DHitsResult e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHitsResult.findById",
                query = "select e from DHitsResult e "
                        + "where e.id = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHitsResult.findByHitId",
                query = "select e from DHitsResult e "
                        + "where e.hitId = :hitId "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHitsResult.findByProjectId",
                query = "select e from DHitsResult e "
                        + "where e.projectId = :projectId "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHitsResult.findByUserId",
                query = "select e from DHitsResult e "
                        + "where e.userId = :userId ")

})
public class DHitsResult implements IDdbPojo{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long hitId;
    private String userId;
    //ideally hitId belongs to a projectId and so projectId is not needed here but this helps in efficiency of quering during reporting.
    private String projectId;
    private String result;
    private int timeTakenToLabelInSec;
    private String notes;
    @Column(updatable=false, insertable=false)
    private java.util.Date created_timestamp;
    @Column(updatable=false, insertable=false)
    private java.util.Date updated_timestamp;

    public DHitsResult(){

    }

    public DHitsResult(long hitId, String projectId, String userId){
        this();
        this.userId = userId;
        this.projectId = projectId;
        this.hitId = hitId;
    }


    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getHitId() {
        return hitId;
    }

    public void setHitId(long hitId) {
        this.hitId = hitId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public int getTimeTakenToLabelInSec() {
        return timeTakenToLabelInSec;
    }

    public void setTimeTakenToLabelInSec(int timeTakenToLabelInSec) {
        this.timeTakenToLabelInSec = timeTakenToLabelInSec;
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

    @PrePersist
    protected void onCreate() {
        created_timestamp = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updated_timestamp = new Date();
    }
}
