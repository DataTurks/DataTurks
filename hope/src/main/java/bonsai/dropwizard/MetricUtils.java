package bonsai.dropwizard;

import bonsai.config.AppConfig;
import bonsai.config.DBBasedConfigs;
import com.codahale.metrics.MetricFilter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer;
import com.codahale.metrics.graphite.Graphite;
import com.codahale.metrics.graphite.GraphiteReporter;
import com.codahale.metrics.graphite.GraphiteSender;
import com.codahale.metrics.graphite.PickledGraphite;

import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

import static com.codahale.metrics.MetricRegistry.name;

/*
* Just FYI: The Graphite + Grafana are hosted as a docker from this image (https://github.com/kamon-io/docker-grafana-graphite)
* */
public class MetricUtils {
    public static Timer getTimer(String metricName) {
        MetricRegistry metrics = AppConfig.getInstance().getMetrics();
        Timer timer = metrics.timer(name(MetricUtils.class, metricName));
        return timer;
    }

    public static void setupExportData() {

        if (DBBasedConfigs.getConfig("dMetricsExportEnabled", Boolean.class, false)) {
            long exportInterval = DBBasedConfigs.getConfig("dMetricExportIntervalSec", Integer.class, 300);
            String metricExportUrl = DBBasedConfigs.getConfig("dMetricExportHost", String.class, "54.184.178.247");
            final Graphite graphite = new Graphite(new InetSocketAddress(metricExportUrl, 2003));
            final GraphiteReporter reporter = GraphiteReporter.forRegistry(AppConfig.getInstance().getMetrics())
                    .prefixedWith("dataturks")
                    .convertRatesTo(TimeUnit.SECONDS)
                    .convertDurationsTo(TimeUnit.MILLISECONDS)
                    .filter(MetricFilter.ALL)
                    .build(graphite);
            reporter.start(exportInterval, TimeUnit.SECONDS);
        }
    }
}
