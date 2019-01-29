package bonsai.dropwizard.dao.d;

import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.List;

public class DOrgUsersDAO extends AbstractDAO<DOrgUsers> implements IDDao<DOrgUsers>{

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public DOrgUsersDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<DOrgUsers> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.d.DOrgUsers.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<DOrgUsers> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DOrgUsers> list= findAll();
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

    public String create(DOrgUsers entry) {
        return persist(entry).getId() + "";
    }

    public String createInternal(DOrgUsers entry) {
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


    private DOrgUsers findById(long id) {

        List<DOrgUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DOrgUsers.findById")
                        .setParameter("id", id)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    @Deprecated
    public DOrgUsers findByIdInternal(String id) {
        return findByIdInternal(Long.parseLong(id));
    }

    public DOrgUsers findByIdInternal(long id) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DOrgUsers DOrgUsers = findById(id);
                transaction.commit();
                return DOrgUsers;
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

    private DOrgUsers findByUserId(String userId) {

        List<DOrgUsers> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DOrgUsers.findByUserId")
                        .setParameter("userId", userId)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public DOrgUsers findByUserIdInternal(String  userId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DOrgUsers DOrgUsers = findByUserId(userId);
                transaction.commit();
                return DOrgUsers;
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

    public boolean deleteInternal(DOrgUsers DOrgUsers) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.delete(DOrgUsers);
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

    public boolean saveOrUpdateInternal(DOrgUsers DOrgUsers) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(DOrgUsers);
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



