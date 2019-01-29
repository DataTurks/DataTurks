package bonsai.dropwizard.dao.d;

import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.List;

public class DProjectUsersDAO extends AbstractDAO<DProjectUsers> implements IDDao<DProjectUsers>{

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public DProjectUsersDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<DProjectUsers> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.d.DProjectUsers.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<DProjectUsers> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DProjectUsers> list= findAll();
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

    public String create(DProjectUsers entry) {
        return persist(entry).getId() + "";
    }

    public String createInternal(DProjectUsers entry) {
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


    private DProjectUsers findById(long id) {

        List<DProjectUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DProjectUsers.findById")
                        .setParameter("id", id)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    @Deprecated
    public DProjectUsers findByIdInternal(String id) {
        return findByIdInternal(Long.parseLong(id));
    }

    public DProjectUsers findByIdInternal(long id) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DProjectUsers DProjectUsers = findById(id);
                transaction.commit();
                return DProjectUsers;
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

    private List<DProjectUsers> findAllByUserId(String  userId) {

        List<DProjectUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DProjectUsers.findByUserId")
                        .setParameter("userId", userId)
        );

        return list;
    }

    public List<DProjectUsers> findAllByUserIdInternal(String  userId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DProjectUsers> projects = findAllByUserId(userId);
                transaction.commit();
                return projects;
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

    private List<DProjectUsers> findAllByProjectId(String  projectId) {

        List<DProjectUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DProjectUsers.findByProjectId")
                        .setParameter("projectId", projectId)
        );

        return list;
    }

    public List<DProjectUsers> findAllByProjectIdInternal(String  projectId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DProjectUsers> projects = findAllByProjectId(projectId);
                transaction.commit();
                return projects;
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

    private DProjectUsers findByUserAndProjectId(String  userId, String projectId) {

        List<DProjectUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DProjectUsers.findByUserAndProjectId")
                        .setParameter("userId", userId).setParameter("projectId", projectId)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public DProjectUsers findByUserAndProjectIdInternal(String  userId, String projectId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DProjectUsers project = findByUserAndProjectId(userId, projectId);
                transaction.commit();
                return project;
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

    public boolean deleteInternal(DProjectUsers DProjectUsers) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.delete(DProjectUsers);
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

    public boolean saveOrUpdateInternal(DProjectUsers DProjectUsers) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(DProjectUsers);
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


