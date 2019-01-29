package dataturks.response;

import dataturks.DTypes;

public class ContributorDetails {
    private UserDetails userDetails;
    private long hitsDone;
    private long avrTimeTakenInSec;

    private DTypes.Project_User_Role role;

    public ContributorDetails() {

    }

    public ContributorDetails(UserDetails userDetails) {
        this.userDetails = userDetails;
    }

    public UserDetails getUserDetails() {
        return userDetails;
    }

    public void setUserDetails(UserDetails userDetails) {
        this.userDetails = userDetails;
    }

    public long getHitsDone() {
        return hitsDone;
    }

    public void setHitsDone(long hitsDone) {
        this.hitsDone = hitsDone;
    }

    public long getAvrTimeTakenInSec() {
        return avrTimeTakenInSec;
    }

    public void setAvrTimeTakenInSec(long avrTimeTakenInSec) {
        this.avrTimeTakenInSec = avrTimeTakenInSec;
    }

    public DTypes.Project_User_Role getRole() {
        return role;
    }

    public void setRole(DTypes.Project_User_Role role) {
        this.role = role;
    }
}
