package bonsai.dropwizard.dao.d;


import dataturks.DConstants;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "d_project_invites")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjectInvites.findAll",
                query = "select e from DProjectInvites e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjectInvites.findById",
                query = "select e from DProjectInvites e "
                        + "where e.id = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DProjectInvites.findByEmail",
                query = "select e from DProjectInvites e "
                        + "where email = :email")

})
public class DProjectInvites implements IDdbPojo{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String inviterId;
    private String projectId;
    private String email;
    private String role;

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DProjectInvites(){}

    public DProjectInvites(String inviterId, String projectId, String email, String role){
        this.inviterId = inviterId;
        this.projectId = projectId;
        this.email = email;
        this.role = role;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getInviterId() {
        return inviterId;
    }

    public void setInviterId(String inviterId) {
        this.inviterId = inviterId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
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
