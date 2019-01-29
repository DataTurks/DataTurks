package bonsai.dropwizard;

import bonsai.config.AppConfig;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlets.MetricsServlet;

import javax.servlet.annotation.WebListener;

@WebListener
public class MetricHTTPExporter extends MetricsServlet.ContextListener {

    @Override
    protected MetricRegistry getMetricRegistry() {
        return AppConfig.getInstance().getMetrics();
    }

}
