package dataturks.jobs;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import bonsai.dropwizard.dao.d.DProjectUsers;
import bonsai.dropwizard.dao.d.DProjectUsersDAO;
import bonsai.dropwizard.dao.d.DUsers;
import bonsai.email.ScheduledEmails;
import dataturks.DConstants;
import dataturks.DTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class DefaultProjectsForUsers {
    private static final Logger LOG = LoggerFactory.getLogger(DefaultProjectsForUsers.class);

    //if the user has created enough projects, then remove the default projects assigned to them.
    public static void updateDefaultProjectsForUsers() {
        List<DUsers> users =  AppConfig.getInstance().getdUsersDAO().findAllInternal();
        if (users == null || users.isEmpty()) return;


        // all default projects.
        List<String> defaultProjects = DBBasedConfigs.getConfig("dtNewUserDefaultProjects", List.class, Collections.emptyList());
        //make a map.
        Set<String> defaultProjectsSet = new HashSet<>(defaultProjects);
        //lets not waste time on old users.
        Date now = new Date();
        Date recentEnoughUser = new Date(now.getTime() - 20* DConstants.ONE_DAY_MILISEC);

        DProjectUsersDAO dProjectUsersDAO = AppConfig.getInstance().getdProjectUsersDAO();

        for (DUsers user : users) {
            if (user.getCreated_timestamp().before(recentEnoughUser)) continue;

            //find all projects created by this user.
            List<DProjectUsers> userProjects = dProjectUsersDAO.findAllByUserIdInternal(user.getId());

            //haven't created many projects yet.
            if (userProjects.isEmpty() || userProjects.size() <= defaultProjectsSet.size() + 2) continue;

            for (DProjectUsers userProject : userProjects) {
                if (defaultProjectsSet.contains(userProject.getProjectId())) {
                    if (userProject.getRole() != DTypes.Project_User_Role.OWNER) {
                        LOG.warn("Deleting user " + user.getEmail() + "(" + userProject.getUserId() + ") from project " + userProject.getProjectId());
                        dProjectUsersDAO.deleteInternal(userProject);
                    }
                }
            }
        }
    }
}
