package bonsai.DB;

import bonsai.interfaces.Reloadable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by mohan.gupta on 18/04/17.
 */
public class Refresher {

    private static final Logger LOG = LoggerFactory.getLogger(Refresher.class);
    private static Refresher instance = new Refresher();
    private Set<Reloadable> reloadableSet;
    private Refresher(){
        reloadableSet = new HashSet<Reloadable>();
    }

    public static Refresher getInstance() {
        return instance;
    }

    private static Set<Reloadable> getSet() {
        return getInstance().reloadableSet;
    }

    public static void register(Reloadable reloadable) {
        if (!getSet().contains(reloadable)) {
            getSet().add(reloadable);
        }

    }

    public static void unregister(Reloadable reloadable) {
        if (getSet().contains(reloadable)) {
            getSet().remove(reloadable);
        }
    }

    public static void refresh() {
        getInstance().refreshInternal();
    }

    private void refreshInternal() {
        for (Reloadable r : reloadableSet) {
            try {
                r.reload();
            }
            catch (Exception e) {
                LOG.error("While reloading " + r.getClass() + " " + e.toString());
            }
        }
    }
}
