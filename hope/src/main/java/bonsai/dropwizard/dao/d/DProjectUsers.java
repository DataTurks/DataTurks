package bonsai.dropwizard.dao.d;


import dataturks.DTypes;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "d_project_users")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjectUsers.findAll",
                query = "select e from DProjectUsers e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjectUsers.findById",
                query = "select e from DProjectUsers e "
                        + "where e.id = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjectUsers.findByUserId",
                query = "select e from DProjectUsers e "
                        + "where e.userId = :userId "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjectUsers.findByUserAndProjectId",
                query = "select e from DProjectUsers e "
                        + "where e.userId = :userId AND e.projectId = :projectId"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjectUsers.findByProjectId",
                query = "select e from DProjectUsers e "
                        + "where e.projectId = :projectId")

})
public class DProjectUsers implements IDdbPojo{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String projectId;
    private String userId;

    @Enumerated(EnumType.STRING)
    private DTypes.Project_User_Role role;

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DProjectUsers() {}

    public DProjectUsers(String projectId, String userId){
        this();
        this.projectId = projectId;
        this.userId = userId;
    }

    public DProjectUsers(String projectId, String userId, DTypes.Project_User_Role role){
        this();
        this.projectId = projectId;
        this.userId = userId;
        this.role = role;
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public DTypes.Project_User_Role getRole() {
        return role;
    }

    public void setRole(DTypes.Project_User_Role role) {
        this.role = role;
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
