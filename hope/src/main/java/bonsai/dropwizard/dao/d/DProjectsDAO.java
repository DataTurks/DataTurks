package bonsai.dropwizard.dao.d;

import dataturks.DTypes;
import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.List;

public class DProjectsDAO extends AbstractDAO<DProjects> implements IDDao<DProjects>{

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public DProjectsDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    private List<DProjects> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.d.DProjects.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<DProjects> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DProjects> list= findAll();
                transaction.commit();
                return list;
            }
            catch (Exception e) {
                transaction.rollback();
                throw new RuntimeException(e);
            }
        }
        finally {
            session.close();
            ManagedSessionContext.unbind(sessionFactory);
        }
    }

    public String create(DProjects entry) {
        return persist(entry).getId() + "";
    }

    public String createInternal(DProjects entry) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                String  id = create(entry);
                transaction.commit();
                return id;
            }
            catch (Exception e) {
                transaction.rollback();
                throw new RuntimeException(e);
            }
        }
        finally {
            session.close();
            ManagedSessionContext.unbind(sessionFactory);
        }
    }


    private DProjects findById(String id) {

        List<DProjects> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DProjects.findById")
                        .setParameter("id", id)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public DProjects findByIdInternal(String id) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DProjects DProjects = findById(id);
                transaction.commit();
                return DProjects;
            }
            catch (Exception e) {
                transaction.rollback();
                throw new RuntimeException(e);
            }
        }
        finally {
            session.close();
            ManagedSessionContext.unbind(sessionFactory);
        }

    }

    private DProjects findByOrgIdAndName(String orgId, String name) {

        List<DProjects> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DProjects.findByOrgIdAndName")
                        .setParameter("orgId", orgId).setParameter("name", name)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public DProjects findByOrgIdAndNameInternal(String orgId, String name) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DProjects DProjects = findByOrgIdAndName(orgId, name);
                transaction.commit();
                return DProjects;
            }
            catch (Exception e) {
                transaction.rollback();
                throw new RuntimeException(e);
            }
        }
        finally {
            session.close();
            ManagedSessionContext.unbind(sessionFactory);
        }

    }



    private List<DProjects> findByOrgId(String orgId) {

        List<DProjects> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DProjects.findByOrgId")
                        .setParameter("orgId", orgId)
        );

        return list;
    }

    public List<DProjects> findByOrgIdInternal(String orgId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DProjects> DProjects = findByOrgId(orgId);
                transaction.commit();
                return DProjects;
            }
            catch (Exception e) {
                transaction.rollback();
                throw new RuntimeException(e);
            }
        }
        finally {
            session.close();
            ManagedSessionContext.unbind(sessionFactory);
        }

    }

    private List<DProjects> findByOrgIdIncludingDeleted(String orgId) {

        List<DProjects> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DProjects.findByOrgIdWithDelete")
                        .setParameter("orgId", orgId)
        );

        return list;
    }

    public List<DProjects> findByOrgIdInternalIncludingDeleted(String orgId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DProjects> DProjects = findByOrgIdIncludingDeleted(orgId);
                transaction.commit();
                return DProjects;
            }
            catch (Exception e) {
                transaction.rollback();
                throw new RuntimeException(e);
            }
        }
        finally {
            session.close();
            ManagedSessionContext.unbind(sessionFactory);
        }

    }

    public boolean setAsDeletedInternal(DProjects dProject) {
        dProject.setStatus(DTypes.Project_Status.DELETED.name());
        saveOrUpdateInternal(dProject);
        return true;
    }

    public boolean deleteInternal(DProjects DProjects) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.delete(DProjects);
                transaction.commit();
                return true;
            }
            catch (Exception e) {
                transaction.rollback();
                throw new RuntimeException(e);
            }
        }
        finally {
            session.close();
            ManagedSessionContext.unbind(sessionFactory);
        }
    }

    public boolean saveOrUpdateInternal(DProjects DProjects) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(DProjects);
                transaction.commit();
                return true;
            }
            catch (Exception e) {
                transaction.rollback();
                throw new RuntimeException(e);
            }
        }
        finally {
            session.close();
            ManagedSessionContext.unbind(sessionFactory);
        }
    }

}


