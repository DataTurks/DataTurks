package bonsai.dropwizard.dao.d;

import dataturks.DConstants;
import dataturks.DTypes;
import io.dropwizard.hibernate.AbstractDAO;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.context.internal.ManagedSessionContext;

import java.util.List;

public class DHitsDAO extends AbstractDAO<DHits> implements IDDao<DHits>{

    /**
     * Constructor.
     *
     * @param sessionFactory Hibernate session factory.
     */
    SessionFactory sessionFactory ;
    public DHitsDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<DHits> findAll() {
        return list(namedQuery("bonsai.dropwizard.dao.d.DHits.findAll"));
    }

    //Called from within the app and not via a hibernate resources hence does not have session binding.
    public List<DHits> findAllInternal() {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DHits> list= findAll();
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

    public String create(DHits entry) {
        return persist(entry).getId() + "";
    }

    public String createInternal(DHits entry) {
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


    public DHits findById(long id) {

        List<DHits> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DHits.findById")
                        .setParameter("id", id)
        );

        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    @Deprecated
    public DHits findByIdInternal(String id) {
        return findByIdInternal(Long.parseLong(id));
    }

    public DHits findByIdInternal(long id) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                DHits DHits = findById(id);
                transaction.commit();
                return DHits;
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

    public boolean deleteInternal(DHits DHits) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.delete(DHits);
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

    public boolean saveOrUpdateInternal(DHits DHits) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                session.saveOrUpdate(DHits);
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

    private List<DHits> findAllByProjectId(String projectId) {

        List<DHits> list =  list(
                namedQuery("bonsai.dropwizard.dao.d.DHits.findByProjectId")
                        .setParameter("projectId", projectId)
        );

        return list;
    }

    public List<DHits> findAllByProjectIdInternal(String projectId) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            Transaction transaction = session.beginTransaction();
            try {
                List<DHits> results = findAllByProjectId(projectId);
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

    private long getCountForProjectForStatus(String projectId, String status) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                Query query = null;
                if (status == null) {
                     query = session.createQuery("select count(*) from DHits e where e.projectId=:projectId");
                }
                else {
                     query = session.createQuery("select count(*) from DHits e where e.projectId=:projectId AND e.status=:status");
                     query.setParameter("status", status);
                }

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

    private long getCountForProjectForEvaluation(String projectId, DTypes.HIT_Evaluation_Type evaluation) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                Query query = null;
                query = session.createQuery("select count(*) from DHits e where e.projectId=:projectId AND e.evaluation=:evaluation" +
                        " AND (e.status=:status1 OR e.status=:status2)");
                query.setParameter("evaluation", evaluation);
                query.setParameter("projectId", projectId);
                query.setParameter("status1", DConstants.HIT_STATUS_DONE);
                query.setParameter("status2", DConstants.HIT_STATUS_PRE_TAGGED);
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

    public long getCountForProject(String projectId) {
        return getCountForProjectForStatus(projectId, null);
    }

    public long getCountForProjectDone(String projectId) {
        return getCountForProjectForStatus(projectId, DConstants.HIT_STATUS_DONE);
    }

    public long getCountForProjectSkipped(String projectId) {
        return getCountForProjectForStatus(projectId, DConstants.HIT_STATUS_SKIPPED);
    }

    public long getCountForProjectDeleted(String projectId) {
        return getCountForProjectForStatus(projectId, DConstants.HIT_STATUS_DELETED);
    }


    public long getCountForProjectEvaluationCorrect(String projectId) {
        return getCountForProjectForEvaluation(projectId, DTypes.HIT_Evaluation_Type.CORRECT);
    }

    public long getCountForProjectEvaluationInCorrect(String projectId) {
        return getCountForProjectForEvaluation(projectId, DTypes.HIT_Evaluation_Type.INCORRECT);
    }

    // get count rows for tagging from the project selected randomly.
    // using randomly so that two users are not returned the same hit to be tagged.
    public List<DHits> getUndoneRandomlyInternal(String projectId, String status, long count) {
        String query = "FROM DHits where projectId = :projectId AND status = :status";
        return getInternal(query, projectId, status, null,0, count, DTypes.HIT_ORDER_Type.RANDOM);
    }

    public List<DHits> getUndoneInternal(String projectId, String status, long count, DTypes.HIT_ORDER_Type orderBy) {
        return getInternal(projectId, 0, count, status, orderBy);
    }

    //with evaluation filtering.
    public List<DHits> getInternal(String projectId, long start, long count, String status, String evaluation, DTypes.HIT_ORDER_Type orderBy) {
        String query = "FROM DHits where projectId = :projectId AND evaluation = :evaluation";
        if (status != null) {
            query = "FROM DHits where projectId = :projectId AND status = :status AND evaluation = :evaluation";
        }
        return getInternal(query, projectId, status, evaluation,  start, count, orderBy);
    }

    public List<DHits> getInternal(String projectId, long start, long count, String status) {
        return getInternal(projectId, start, count, status,  DTypes.HIT_ORDER_Type.NONE);
    }

    public List<DHits> getInternal(String projectId, long start, long count, String status, DTypes.HIT_ORDER_Type orderBy) {
        String query = "FROM DHits where projectId = :projectId";
        if (status != null) {
            query = "FROM DHits where projectId = :projectId AND status = :status";
        }
        return getInternal(query, projectId, status, null, start, count, orderBy);
    }

    private List<DHits> getInternal(String HQLQuery, String projectId, String status, String evaluation, long start, long count, DTypes.HIT_ORDER_Type orderBy) {
        Session session = sessionFactory.openSession();
        try {
            ManagedSessionContext.bind(session);
            org.hibernate.Transaction transaction = session.beginTransaction();
            try {
                String orderByString = " ORDER BY ";
                if (orderBy == DTypes.HIT_ORDER_Type.RANDOM) {
                    orderByString += "RAND()";
                }
                if (orderBy == DTypes.HIT_ORDER_Type.NEW_FIRST) {
                    orderByString += "updated_timestamp DESC";
                }
                if (orderBy == DTypes.HIT_ORDER_Type.OLD_FIRST) {
                    orderByString += "updated_timestamp ASC";
                }
                if (orderBy == DTypes.HIT_ORDER_Type.NONE) {
                    orderByString = "";
                }

                HQLQuery += orderByString;

                Query query = session.createQuery(HQLQuery);
                query.setParameter("projectId", projectId);
                if (status != null) {
                    query.setParameter("status", status);
                }
                if (evaluation != null) {
                    query.setParameter("evaluation", DTypes.HIT_Evaluation_Type.valueOf(evaluation));
                }
                query.setFirstResult((int)start);
                query.setMaxResults((int)count);
                List<DHits> list = query.list();
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
            String HQLQuery = "DELETE DHits where projectId = :projectId";
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


