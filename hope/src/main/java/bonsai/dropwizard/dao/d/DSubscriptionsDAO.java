package bonsai.dropwizard.dao.d;

import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.List;

public class DSubscriptionsDAO extends AbstractDAO<DSubscriptions> implements IDDao<DSubscriptions>{

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public DSubscriptionsDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<DSubscriptions> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.d.DSubscriptions.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<DSubscriptions> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DSubscriptions> list= findAll();
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

    public long create(DSubscriptions entry) {
        return persist(entry).getId();
    }

    public Long createInternal(DSubscriptions entry) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                long  id = create(entry);
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


    private DSubscriptions findById(long id) {

        List<DSubscriptions> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DSubscriptions.findById")
                        .setParameter("id", id)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    @Deprecated
    public DSubscriptions findByIdInternal(String id) {
        return findByIdInternal(Long.parseLong(id));
    }

    public DSubscriptions findByIdInternal(long id) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DSubscriptions DSubscriptions = findById(id);
                transaction.commit();
                return DSubscriptions;
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

    private DSubscriptions findByOrgId(String orgId) {

        List<DSubscriptions> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DSubscriptions.findByOrgId")
                        .setParameter("orgId", orgId)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public DSubscriptions findByOrgIdInternal(String orgId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DSubscriptions DSubscriptions = findByOrgId(orgId);
                transaction.commit();
                return DSubscriptions;
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

    public boolean deleteInternal(DSubscriptions DSubscriptions) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.delete(DSubscriptions);
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

    public boolean saveOrUpdateInternal(DSubscriptions DSubscriptions) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(DSubscriptions);
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


