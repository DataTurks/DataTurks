package bonsai.sa;

import bonsai.config.DBBasedConfigs;
import bonsai.email.EmailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Created by mohan on 15/10/17.
 */
public class EventsLogger {

    private static final Logger LOG = LoggerFactory.getLogger(EventsLogger.class);

    //aggregate of since we started hope.
    private static Events sinceReStart;
    private static Date reStartDate;

    //since the last time interval.
    private static Events current;
    private static Date currentStartDate;

    //lines of text for the current durantion
    private Queue<String> eventLinesCurrent;

    private ScheduledExecutorService executorService;
    private int intervalInSec;

    private static EventsLogger instance = new EventsLogger();

    private EventsLogger(){
        sinceReStart = new Events();
        reStartDate = new Date();
        resetCounting();
    }

    public static EventsLogger getInstance() {
        return instance;
    }

    public static void  logErrorEvent(String eventName, int value) {
        try {
            getInstance().current.addError(eventName, value);
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }
    }

    public static void  logEvent(String eventName, int value) {
        try {
            getInstance().current.add(eventName, value);
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }
    }

    public static void logErrorEvent(String eventName) {
        try {
            logErrorEvent(eventName, 1);
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }
    }

    public static void  logEvent(String eventName) {
        try {
            logEvent(eventName, 1);
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }

    }

    public static void logEventLine(String line) {
        try {
            getInstance().eventLinesCurrent.add(line);
        }
        catch (Exception e) {
            LOG.error(e.toString());
        }

    }

    //send mail and restart counting for the next checkpoint.
    private void checkpoint() {
        try {
            LOG.info("checkpointing events..");
            Events eventsObj = current;
            long nowTimeStamp = (new Date()).getTime();
            long sinceLastCheckpoint = (nowTimeStamp - currentStartDate.getTime())/1000;
            long sinceStart = (nowTimeStamp - reStartDate.getTime())/1000;

            //update the sinceRestart time.
            addOrUpdate(sinceReStart, eventsObj);
            sendMail(eventsObj, sinceLastCheckpoint, sinceReStart, sinceStart, eventLinesCurrent);

            resetCounting();
        }
        catch (Exception e) {

        }
    }

    private void addOrUpdate(Events sinceReStart, Events toAdd) {
        Map<String, Integer> events = toAdd.getEvents();
        for (String key : events.keySet()) {
            sinceReStart.add(key, events.get(key));
        }

        events = toAdd.getErrorEvents();
        for (String key : events.keySet()) {
            sinceReStart.addError(key, events.get(key));
        }
    }

    private void resetCounting() {
        current = new Events();
        currentStartDate = new Date();
        eventLinesCurrent = new ConcurrentLinkedQueue<String>();

        intervalInSec = DBBasedConfigs.getConfig("dataturksEventsIntervalInSecs", Integer.class, 60*60);
        if (executorService != null) executorService.shutdownNow();

        // schedule is such that it runs one more time and then we recreate the executor anyway
        // specifiy the next run time (make sure the subsequent interval is never executed).
        executorService = Executors.newSingleThreadScheduledExecutor();
            executorService.scheduleWithFixedDelay(new Runnable() {
            @Override
            public void run() {
                checkpoint();
            }
        }, intervalInSec, intervalInSec*200, TimeUnit.SECONDS);
    }

    private static void sendMail(Events lastEvents, long sinceLastSec, Events sinceStart, long sinceStartSec, Queue<String> lines) {
        String sinceStartTimeStr = "";
        int hourSecs = 60*60;
        if (sinceStartSec > hourSecs) {
            sinceStartTimeStr = (double)sinceStartSec/hourSecs + " hrs";
        }
        else {
            sinceStartTimeStr = sinceStartSec/60 + " minutes";
        }

        String htmlLastEvents = createMaillHTML(lastEvents, (sinceLastSec/60) + " minutes", "Last interval");
        String htmlSinceStartEvents = createMaillHTML(sinceStart, sinceStartTimeStr, "Since restart");

        String data = htmlLastEvents + htmlSinceStartEvents;

        String linesHTML = "<br /><br />" + createHTMLTable(lines, "Updates");

        data += linesHTML;

        EmailSender.sendAppEventMail("SA app events", data);

    }

    private static String createHTMLTable(Iterable<String> lines, String headline) {
        String html = "<tr>\n" +
                "    <td align=\"center\">" + headline +" \n" +
                "      <table align=\"center\" width=\"300\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"border:1px solid #ccc;\">";

        for (String line : lines) {

            html += "<tr>\n" +
                    "          <td> " + line+" <br /></td>\n" +
                    "        </tr>";

        }
        html += "</table><br /> <br /></td>\n" +
                "  </tr>";

        return html;
    }


    private static String createMaillHTML(Events events, String time, String headline) {
        String html = "<tr>\n" +
                "    <td align=\"center\">" + headline +" \n" +
                "      <table align=\"center\" width=\"300\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"border:1px solid #ccc;\">";

        html += "<tr>\n" +
                "          <td> Time duration </td>\n" +
                "          <td> "+ time+" </td>\n" + "<br /> <br />\n" +
                "        </tr>";

        Map<String, Integer> map = events.getEvents();
        for (String key : map.keySet()) {
            String value = map.get(key).toString();

            html += "<tr>\n" +
                    "          <td> " + key+" </td>\n" +
                    "          <td> "+ value+" </td>\n" +
                    "        </tr>";

        }

        html += "<tr>\n" +
                "          <td> Error events </td>\n" + "<br /> <br />\n" +
                "        </tr>";

        map = events.getErrorEvents();
        for (String key : map.keySet()) {
            String value = map.get(key).toString();

            html += "<tr>\n" +
                    "          <td> " + key+" </td>\n" +
                    "          <td> "+ value+" </td>\n" +
                    "        </tr>";

        }

        html += "</table><br /> <br /></td>\n" +
                "  </tr>";

        return html;
    }

}
