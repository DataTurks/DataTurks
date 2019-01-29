package bonsai.sa;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by mohan on 15/10/17.
 */
public class Events {

    private Map<String, Integer> errorEvents;
    private Map<String, Integer> events;

    public Events() {
        errorEvents = new HashMap<>();
        events = new HashMap<>();
    }
    public Map<String, Integer> getEvents() {
        return events;
    }

    public Map<String, Integer> getErrorEvents() {
        return errorEvents;
    }

    public void add(String name, int value) {
        if (!events.containsKey(name)) {
            events.put(name, 0);
        }
        events.put(name, events.get(name) + value);
    }

    public void addError(String name, int value) {
        if (!errorEvents.containsKey(name)) {
            errorEvents.put(name, 0);
        }
        errorEvents.put(name, errorEvents.get(name) + value);
    }
}

