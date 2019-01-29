package bonsai.dropwizard.dao.d;

import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.List;

public class DUsersDAO extends AbstractDAO<DUsers> implements IDDao<DUsers>{

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public DUsersDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    private List<DUsers> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.d.DUsers.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<DUsers> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DUsers> list= findAll();
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

    public String create(DUsers entry) {
        return persist(entry).getId();
    }

    public String createInternal(DUsers entry) {
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


    private DUsers findById(String id) {

        List<DUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DUsers.findById")
                        .setParameter("id", id)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    @Deprecated
    public DUsers findByIdInternal(long userId) {
        return null;
    }

    public DUsers findByIdInternal(String userId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DUsers DUsers = findById(userId);
                transaction.commit();
                return DUsers;
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

    private DUsers findByEmail(String email) {

        List<DUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DUsers.findByEmail")
                        .setParameter("email", email)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public DUsers findByEmailInternal(String email) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DUsers DUsers = findByEmail(email);
                transaction.commit();
                return DUsers;
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

    public boolean deleteInternal(DUsers DUsers) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.delete(DUsers);
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

    public boolean saveOrUpdateInternal(DUsers DUsers) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(DUsers);
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


    private DUsers findByOAuthId(String oAuthId) {

        List<DUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DUsers.findByOAuthId")
                        .setParameter("oAuthId", oAuthId)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public DUsers findByOAuthIdInternal(String oAuthId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DUsers info = findByOAuthId(oAuthId);
                transaction.commit();
                return info;
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

