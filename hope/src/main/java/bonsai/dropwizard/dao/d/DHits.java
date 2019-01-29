package bonsai.dropwizard.dao.d;

import dataturks.DConstants;
import dataturks.DTypes;

import javax.persistence.*;
import java.util.Date;


@Entity
@Table(name = "d_hits")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHits.findAll",
                query = "select e from DHits e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHits.findById",
                query = "select e from DHits e "
                        + "where e.id = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHits.findByProjectIdRandomly",
                query = "select e from DHits e "
                        + "where projectId = :projectId AND status = null ORDER BY RAND() "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DHits.findByProjectId",
                query = "select e from DHits e "
                        + "where projectId = :projectId")

})
public class DHits implements IDdbPojo{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String projectId;

    private String data;
    private String extras;

    private String status = DConstants.HIT_STATUS_NOT_DONE;
    private boolean isGoldenHIT;

    private Boolean isURL;

    @Enumerated(EnumType.STRING)
    private DTypes.HIT_Evaluation_Type evaluation = DTypes.HIT_Evaluation_Type.NONE;

    private long goldenHITResultId;

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DHits() {

    }

    public DHits(String projectId) {
        this();
        this.projectId = projectId;
    }

    public DHits(String projectId, String data) {
        this(projectId);
        if (data != null) data = data.trim();
        this.data = data;
    }

    public DHits(String projectId, String data, String extras) {
        this(projectId, data);
        this.extras = extras;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getData() {
        //since the ones storef before were not added in the db with triming, they might still have some non-trimmed rows.
        // hence trimming here as well.
        if (data != null)
            return data.trim();

        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getExtras() {
        return extras;
    }

    public void setExtras(String extras) {
        this.extras = extras;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isGoldenHIT() {
        return isGoldenHIT;
    }

    public void setGoldenHIT(boolean goldenHIT) {
        isGoldenHIT = goldenHIT;
    }

    public boolean isURL() {
        if (isURL == null) return false;
        return isURL;
    }

    public void setURL(boolean URL) {
        isURL = URL;
    }

    public DTypes.HIT_Evaluation_Type getEvaluationType() {
        return evaluation;
    }

    public void setEvaluationType(DTypes.HIT_Evaluation_Type evaluationType) {
        this.evaluation = evaluationType;
    }

    public long getGoldenHITResultId() {
        return goldenHITResultId;
    }

    public void setGoldenHITResultId(long goldenHITResultId) {
        this.goldenHITResultId = goldenHITResultId;
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
