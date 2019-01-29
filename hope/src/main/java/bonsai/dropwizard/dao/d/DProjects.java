package bonsai.dropwizard.dao.d;

import dataturks.DTypes;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;


@Entity
@Table(name = "d_projects")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjects.findAll",
                query = "select e from DProjects e where status != 'DELETED'"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjects.findById",
                query = "select e from DProjects e "
                        + "where e.id = :id AND status != 'DELETED'"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjects.findByOrgIdAndName",
                query = "select e from DProjects e "
                        + "where e.orgId = :orgId AND e.name = :name AND status != 'DELETED'"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjects.findByOrgId",
                query = "select e from DProjects e "
                        + "where e.orgId = :orgId AND status != 'DELETED'"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjects.findByOrgIdWithDelete",
                query = "select e from DProjects e "
                        + "where e.orgId = :orgId")

})
public class DProjects implements IDdbPojo{
    @Id
    @GeneratedValue(generator="system-uuid")
    @GenericGenerator(name="system-uuid", strategy = "uuid")
    private String id;

    private String name;

    private String orgId;

    @Enumerated(EnumType.STRING)
    private DTypes.Project_Access_Type accessType;


    @Enumerated(EnumType.STRING)
    private DTypes.Project_Task_Type taskType;

    private String taskRules;

    private String subtitle;

    private String description;

    private String shortDescription;

    private String status = DTypes.Project_Status.NONE.toString();

    private long labelsDone;
    private long totalStorageInMBs;
    private long minGoldenHITs;
    private long HITRepeatCount;

    private boolean validateWithGoldenHITs;

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DProjects(){}

    public DProjects(String name, String orgId){
        this();
        this.name = name;
        this.orgId = orgId;
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

    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public DTypes.Project_Access_Type getAccessType() {
        return accessType;
    }

    public void setAccessType(DTypes.Project_Access_Type accessType) {
        this.accessType = accessType;
    }

    public DTypes.Project_Task_Type getTaskType() {
        return taskType;
    }

    public void setTaskType(DTypes.Project_Task_Type taskType) {
        this.taskType = taskType;
    }

    public String getTaskRules() {
        return taskRules;
    }

    public void setTaskRules(String taskRules) {
        this.taskRules = taskRules;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getLabelsDone() {
        return labelsDone;
    }

    public void setLabelsDone(long labelsDone) {
        this.labelsDone = labelsDone;
    }

    public long getTotalStorageInMBs() {
        return totalStorageInMBs;
    }

    public void setTotalStorageInMBs(long totalStorageInMBs) {
        this.totalStorageInMBs = totalStorageInMBs;
    }

    public long getMinGoldenHITs() {
        return minGoldenHITs;
    }

    public void setMinGoldenHITs(long minGoldenHITs) {
        this.minGoldenHITs = minGoldenHITs;
    }

    public long getHITRepeatCount() {
        return HITRepeatCount;
    }

    public void setHITRepeatCount(long HITRepeatCount) {
        this.HITRepeatCount = HITRepeatCount;
    }

    public boolean isValidateWithGoldenHITs() {
        return validateWithGoldenHITs;
    }

    public void setValidateWithGoldenHITs(boolean validateWithGoldenHITs) {
        this.validateWithGoldenHITs = validateWithGoldenHITs;
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