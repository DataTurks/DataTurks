package bonsai.dropwizard.dao.d;


import dataturks.DTypes;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "d_org_users")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DOrgUsers.findAll",
                query = "select e from DOrgUsers e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DOrgUsers.findById",
                query = "select e from DOrgUsers e "
                        + "where e.id = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DOrgUsers.findByUserId",
                query = "select e from DOrgUsers e "
                        + "where e.userId = :userId ")

})
public class DOrgUsers implements IDdbPojo{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String orgId;

    private String userId;

    @Enumerated(EnumType.STRING)
    private DTypes.User_Roles role;

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DOrgUsers(){

    }

    public DOrgUsers(String orgId, String userId){
        this();
        this.orgId = orgId;
        this.userId = userId;
    }


    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public DTypes.User_Roles getRole() {
        return role;
    }

    public void setRole(DTypes.User_Roles role) {
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
