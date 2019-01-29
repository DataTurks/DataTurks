package bonsai.dropwizard.dao.d;

import javax.persistence.*;
import java.util.Date;


@Entity
@Table(name = "d_subscriptions")
@NamedQueries({
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DSubscriptions.findAll",
                query = "select e from DSubscriptions e"),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DSubscriptions.findById",
                query = "select e from DSubscriptions e "
                        + "where e.id = :id "),
        @NamedQuery(name = "bonsai.dropwizard.dao.d.DSubscriptions.findByOrgId",
                query = "select e from DSubscriptions e "
                        + "where e.orgId = :orgId ")

})
public class DSubscriptions implements IDdbPojo{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String orgId;

    private long planId;
    private long paymentMethodId;

    public DSubscriptions(){}

    public DSubscriptions(String orgId){
        this();
        this.orgId = orgId;
    }

    private String config;
    // number of labels done in the org projects.
    private long labelsDone;
    // validity of the subscription.
    private java.util.Date validTill;

    private String notes;
    private java.util.Date created_timestamp;
    private java.util.Date updated_timestamp;

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

    public long getPlanId() {
        return planId;
    }

    public void setPlanId(long planId) {
        this.planId = planId;
    }

    public long getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(long paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public long getLabelsDone() {
        return labelsDone;
    }

    public void setLabelsDone(long labelsDone) {
        this.labelsDone = labelsDone;
    }

    public Date getValidTill() {
        return validTill;
    }

    public void setValidTill(Date validTill) {
        this.validTill = validTill;
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
