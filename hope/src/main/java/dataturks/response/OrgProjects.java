package dataturks.response;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class OrgProjects {
    private String orgId;
    private String orgName;

    private List<ProjectDetails> projects = new ArrayList<>();

    public OrgProjects(){

    }
    public OrgProjects(String orgName) {
        this();
        this.orgName = orgName;
    }


    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public List<ProjectDetails> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectDetails> projects) {
        this.projects = projects;
    }

    public void addProject(ProjectDetails project) {
        projects.add(project);
    }



}
