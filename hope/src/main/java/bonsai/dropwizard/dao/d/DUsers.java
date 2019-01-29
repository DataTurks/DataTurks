package bonsai.dropwizard.dao.d;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;
import java.util.Objects;


//************ NOTE ******************//
// as the userId, we only use oAuthId as the userID, the db generated UUID is never used. Why does it even exit? God knows.
@Entity
@Table(name = "d_users")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DUsers.findAll",
                query = "select e from DUsers e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DUsers.findById",
                query = "select e from DUsers e "
                        + "where e.oAuthId = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DUsers.findByOAuthId",
                query = "select e from DUsers e "
                        + "where e.oAuthId = :oAuthId "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DUsers.findByEmail",
                query = "select e from DUsers e "
                        + "where e.email = :email ")

})
public class DUsers implements IDdbPojo{
    @Id
    @GeneratedValue(generator="system-uuid")
    @GenericGenerator(name="system-uuid", strategy = "uuid")
    private String id;
    private String oAuthId;
    private String oAuthType;


    private String firstName;
    private String secondName;
    private String city;
    private String phone;
    private String email;
    private String profileLink;
    private String profilePic;
    private String status;
    private String notificationToken;

    private String password;
    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DUsers() {

    }
    public DUsers(String oAuthId, String email) {
        this();
        this.oAuthId =oAuthId;
        this.email = email;
    }

    public String getId() {
        return oAuthId;
    }
//
//    public void setId(String id) {
//        this.id = id;
//    }

    public String getOAuthId() {
        return oAuthId;
    }

    public void setOAuthId(String oAuthId) {
        this.oAuthId = oAuthId;
    }

    public String getOAuthType() {
        return oAuthType;
    }

    public void setOAuthType(String oAuthType) {
        this.oAuthType = oAuthType;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getSecondName() {
        return secondName;
    }

    public void setSecondName(String secondName) {
        this.secondName = secondName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfileLink() {
        return profileLink;
    }

    public void setProfileLink(String profileLink) {
        this.profileLink = profileLink;
    }

    public String getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(String profilePic) {
        this.profilePic = profilePic;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotificationToken() {
        return notificationToken;
    }

    public void setNotificationToken(String notificationToken) {
        this.notificationToken = notificationToken;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DUsers users = (DUsers) o;
        return Objects.equals(oAuthId, users.oAuthId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(oAuthId);
    }
}