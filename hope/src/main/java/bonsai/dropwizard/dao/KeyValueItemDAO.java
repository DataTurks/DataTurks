package bonsai.dropwizard.dao;

import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.*;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.List;

/**
 * Created by mohan on 9/8/17.
 */
public class KeyValueItemDAO extends AbstractDAO<KeyValueItem> {

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public KeyValueItemDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }
    /**
     * Method returns all employees stored in the database.
     *
     * @return list of all employees stored in the database
     */
    public List<KeyValueItem> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.KeyValueItem.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<KeyValueItem> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                List<KeyValueItem> list= findAll();
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

    public List<KeyValueItem> findByKey(String key) {

        List<KeyValueItem> list =  list(
                namedQuery("bonsai.dropwizard.dao.KeyValueItem.findAllByKey")
                        .setParameter("key", key)
        );

        return list;
    }

    public List<KeyValueItem> findByType(String type) {

        List<KeyValueItem> list =  list(
                namedQuery("bonsai.dropwizard.dao.KeyValueItem.findAllByType")
                        .setParameter("type", type)
        );

        return list;
    }


    public List<KeyValueItem> findByKeyInternal(String key) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                List<KeyValueItem> list = findByKey(key);
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

    public List<KeyValueItem> findByTypeInternal(String type) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                List<KeyValueItem> list = findByType(type);
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

    public long create(KeyValueItem item) {
        return persist(item).getId();
    }


    public long createInternal(KeyValueItem item) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                long id = create(item);
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

    public boolean deleteInternal(KeyValueItem item) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                session.delete(item);
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

    public boolean saveOrUpdateInternal(KeyValueItem item) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(item);
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
