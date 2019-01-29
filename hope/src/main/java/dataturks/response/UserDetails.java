package dataturks.response;

import bonsai.dropwizard.dao.d.DUsers;

public class UserDetails {
    public String uid;
    public String firstName = "Jane";
    public String secondName;
    public String profilePic;
    public String email;

    public UserDetails(){

    }

    public UserDetails(DUsers user) {
        if (user != null) {
            this.uid = user.getId();
            setFirstName(user.getFirstName());
            setSecondName(user.getSecondName());
            setProfilePic(user.getProfilePic());
            setEmail(user.getEmail());

        }
    }

    public UserDetails(String uid, String firstName, String secondName) {
        this();
        this.uid = uid;
        this.firstName = firstName;
        this.secondName = secondName;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(String profilePic) {
        this.profilePic = profilePic;
    }
}
