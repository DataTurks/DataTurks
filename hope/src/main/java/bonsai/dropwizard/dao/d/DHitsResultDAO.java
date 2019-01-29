package bonsai.dropwizard.dao.d;

import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.*;

public class DHitsResultDAO extends AbstractDAO<DHitsResult> implements IDDao<DHitsResult>{

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public DHitsResultDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<DHitsResult> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.d.DHitsResult.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<DHitsResult> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DHitsResult> list= findAll();
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

    public String create(DHitsResult entry) {
        return persist(entry).getId() + "";
    }

    public String createInternal(DHitsResult entry) {
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


    private DHitsResult findById(long id) {

        List<DHitsResult> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DHitsResult.findById")
                        .setParameter("id", id)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    @Deprecated
    public DHitsResult findByIdInternal(String id) {
        return findByIdInternal(Long.parseLong(id));
    }

    public DHitsResult findByIdInternal(long id) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DHitsResult DHitsResult = findById(id);
                transaction.commit();
                return DHitsResult;
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



    private List<DHitsResult> findByHitId(long hitId) {

        List<DHitsResult> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DHitsResult.findByHitId")
                        .setParameter("hitId", hitId)
        );

        return list;
    }

    public List<DHitsResult> findByHitIdInternal(long hitId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DHitsResult> results = findByHitId(hitId);
                transaction.commit();
                return results;
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

    private List<DHitsResult> findAllByProjectId(String projectId) {

        List<DHitsResult> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DHitsResult.findByProjectId")
                        .setParameter("projectId", projectId)
        );

        return list;
    }

    public List<DHitsResult> findAllByProjectIdInternal(String projectId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DHitsResult> results = findAllByProjectId(projectId);
                transaction.commit();
                return results;
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

    private List<DHitsResult> findAllByUserId(String userId) {

        List<DHitsResult> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DHitsResult.findByUserId")
                        .setParameter("userId", userId)
        );

        return list;
    }

    public List<DHitsResult> findAllByUserIdInternal(String userId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DHitsResult> results = findAllByUserId(userId);
                transaction.commit();
                return results;
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

    private long getCountForProject(String projectId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                Query query = session.createQuery("select count(*) from DHitsResult e where e.projectId=:projectId");
                query.setParameter("projectId", projectId);
                Long count = (Long)query.uniqueResult();
                transaction.commit();
                return count != null? count : 0;
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

    public boolean deleteInternal(DHitsResult DHitsResult) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.delete(DHitsResult);
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

    public boolean saveOrUpdateInternal(DHitsResult DHitsResult) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(DHitsResult);
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


    public Map<String, Long> getProjectResultCountsInternal() {
        Session session = sessionFactory.openSession();
        Map<String, Long> projectCounts = new HashMap<>();

        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                Query query = session.createQuery("select projectId, count(*) from DHitsResult group by projectId ORDER BY COUNT(*) DESC");
                List results = query.setMaxResults(1000).list();
                if (results != null && !results.isEmpty()) {
                    for (Object resultRaw : results) {
                        Object[] result = (Object[]) resultRaw;
                        projectCounts.put((String)result[0], (Long) result[1]);
                    }
                }
                transaction.commit();
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

        return projectCounts;
    }


    public List<String> getProjectsWithRecentHitResultsInternal(long doneSinceInSec) {
        Session session = sessionFactory.openSession();
        //calculate since date.
        Date since = new Date(System.currentTimeMillis() - doneSinceInSec *1000);
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(since);
        List<String> projectIds = null;
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                Query query = session.createQuery("select projectId from DHitsResult WHERE updated_timestamp >= :since group by projectId");
                query.setCalendar("since", calendar);

                projectIds = query.list();

                transaction.commit();
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

        return projectIds;
    }


    public List<DHitsResult> getInternal(String projectId, long start, long count, String userId, String label) {

        String query = "FROM DHitsResult where projectId = :projectId ORDER BY updated_timestamp";

        if (userId != null) {
            query = "FROM DHitsResult where projectId = :projectId AND userId = :userId ORDER BY updated_timestamp";
        }
        if (label != null) {
            query = "FROM DHitsResult where projectId = :projectId AND result like :label ORDER BY updated_timestamp";
        }

        if (userId != null && label != null) {
            query = "FROM DHitsResult where projectId = :projectId AND userId = :userId AND result like :label ORDER BY updated_timestamp";
        }

        return getInternal(query, projectId, userId, label, start, count);
    }


    private List<DHitsResult> getInternal(String HQLQuery, String projectId, String userId, String label, long start, long count) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                Query query = session.createQuery(HQLQuery);
                query.setParameter("projectId", projectId);
                if (userId != null) {
                    query.setParameter("userId", userId);
                }
                if (label != null) {
                    query.setString("label", "%" + label + "%");
                }
                query.setFirstResult((int)start);
                query.setMaxResults((int)count);
                List<DHitsResult> list = query.list();
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

    public void deleteByProjectId(String projectId) {
        Session session = sessionFactory.openSession();
        try {
            String HQLQuery = "DELETE DHitsResult where projectId = :projectId";
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                Query query = session.createQuery(HQLQuery);
                query.setParameter("projectId", projectId);
                query.executeUpdate();
                transaction.commit();
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



