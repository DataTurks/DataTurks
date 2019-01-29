package bonsai.dropwizard.dao;

import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.List;

/**
 * Created by mohan.gupta on 11/04/17.
 */
public class DBConfigEntryDAO extends AbstractDAO<DBConfigEntry> {

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public DBConfigEntryDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }
    /**
     * Method returns all employees stored in the database.
     *
     * @return list of all employees stored in the database
     */
    public List<DBConfigEntry> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.DBConfigEntry.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<DBConfigEntry> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DBConfigEntry> list= findAll();
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

    public List<DBConfigEntry> findByKey(String key) {
        return list(namedQuery("bonsai.dropwizard.dao.DBConfigEntry.findByKey").setParameter("key", key));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public DBConfigEntry findByKeyInternal(String key) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DBConfigEntry> list= findByKey(key);
                transaction.commit();
                if (!list.isEmpty()) {
                    return list.iterator().next();
                }
                return null;
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

    public long create(DBConfigEntry entry) {
        return persist(entry).getId();
    }

    public long createInternal(DBConfigEntry entry) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                long id = create(entry);
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

    public boolean saveOrUpdateInternal(DBConfigEntry entry) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(entry);
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
