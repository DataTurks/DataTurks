package bonsai.dropwizard.dao.d;

public interface IDDao<T> {
    Object createInternal(T entry);
    //T findByIdInternal(long id);
    T findByIdInternal(String id);
    boolean deleteInternal(T entry);
    boolean saveOrUpdateInternal(T entry);
}
