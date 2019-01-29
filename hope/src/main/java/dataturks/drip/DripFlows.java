package dataturks.drip;

import bonsai.dropwizard.dao.d.DProjectInvites;
import bonsai.dropwizard.dao.d.DProjects;
import bonsai.dropwizard.dao.d.DUsers;
import bonsai.email.ScheduledEmails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

public class DripFlows {

    private static final Logger LOG = LoggerFactory.getLogger(DripFlows.class);


    //FIX last updated time.
    public static void addToProjectInviteFlow(List<DProjectInvites> newInvites) {
        if (newInvites == null || newInvites.isEmpty()) return;
        for (DProjectInvites invite : newInvites) {
            LOG.error("addToProjectInviteFlow: " + invite.getEmail() + " project: " + invite.getProjectId() +" By: " + invite.getInviterId());
        }

        return;
    }

    public static int addToSignInFlow(List<DUsers> users ) {
        LOG.error("Inside addToSignInFlow");
        if (users == null || users.isEmpty()) return 1;

        for (DUsers user : users) {
            try {
                LOG.error("addToSignInFlow: " + user.getEmail());
                KlentyAPI.addToSignInFlow(user);
            }
            catch (Exception e) {

            LOG.error("addToSignInFlow for user " + user.getEmail() + " Error = " + e.toString());
            e.printStackTrace();

            }

        }

        return 0;
    }

    public static void addToManyHitsDownFlow(List<DUsers> users ) {
        if (users == null || users.isEmpty()) return;
        for (DUsers user : users) {
            LOG.error("addToManyHitsDownFlow: " + user.getEmail());
        }

        return;
    }

    public static void addToProjectIncompleteFlow(Map<DUsers, DProjects> userProjectMap) {
        if (userProjectMap == null || userProjectMap.isEmpty()) return;
        for (DUsers user : userProjectMap.keySet()) {
            LOG.error("addToProjectIncompleteFlow: " + user.getEmail());
        }

        return;
    }


    public static void removeFromSignInFlow(List<DUsers> users ) {
        if (users == null || users.isEmpty()) return;
        for (DUsers user : users) {
            try {
                LOG.error("removeFromSignInFlow: " + user.getEmail());
                KlentyAPI.removeFromSignInFlow(user);
            }
            catch (Exception e) {
                LOG.error("removeFromSignInFlow for user " + user.getEmail() + " Error = " + e.toString());
                e.printStackTrace();
            }
        }

        return;
    }

    public static void removeFromProjectInviteFlow(List<DUsers> users ) {
        if (users == null || users.isEmpty()) return;
        for (DUsers user : users) {
            LOG.error("removeFromProjectInviteFlow: " + user.getEmail());
        }

        return;
    }

    public static void removeFromProjectIncompleteFlow(List<DUsers> users ) {
        if (users == null || users.isEmpty()) return;
        for (DUsers user : users) {
            LOG.error("removeFromProjectIncompleteFlow: " + user.getEmail());
        }

        return;
    }
}
