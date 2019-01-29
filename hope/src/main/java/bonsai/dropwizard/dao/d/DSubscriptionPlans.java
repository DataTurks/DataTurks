package bonsai.dropwizard.dao.d;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;


@Entity
@Table(name = "d_subscription_plans")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DSubscriptionPlans.findAll",
                query = "select e from DSubscriptionPlans e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DSubscriptionPlans.findById",
                query = "select e from DSubscriptionPlans e "
                        + "where e.id = :id ")

})
public class DSubscriptionPlans implements IDdbPojo{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    private String displayName;
    private boolean paid;
    private double amountPerMonth;
    private long discountPercent;
    private long numProjects;
    private long numHITsPerProject;
    private long totalStorageInGBs;
    private long numUsers;

    private String config;

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

    public DSubscriptionPlans(){}

    public DSubscriptionPlans(String name){
        this();
        this.name = name;
    }


    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean isPaid() {
        return paid;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    public double getAmountPerMonth() {
        return amountPerMonth;
    }

    public void setAmountPerMonth(double amountPerMonth) {
        this.amountPerMonth = amountPerMonth;
    }

    public long getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(long discountPercent) {
        this.discountPercent = discountPercent;
    }

    public long getNumProjects() {
        return numProjects;
    }

    public void setNumProjects(long numProjects) {
        this.numProjects = numProjects;
    }

    public long getNumHITsPerProject() {
        return numHITsPerProject;
    }

    public void setNumHITsPerProject(long numHITsPerProject) {
        this.numHITsPerProject = numHITsPerProject;
    }

    public long getTotalStorageInGBs() {
        return totalStorageInGBs;
    }

    public void setTotalStorageInGBs(long totalStorageInGBs) {
        this.totalStorageInGBs = totalStorageInGBs;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public long getNumUsers() {
        return numUsers;
    }

    public void setNumUsers(long numUsers) {
        this.numUsers = numUsers;
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
