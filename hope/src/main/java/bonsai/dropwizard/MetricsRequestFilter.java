package bonsai.dropwizard;

import bonsai.config.DBBasedConfigs;
import com.codahale.metrics.Timer;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;
import java.io.IOException;

@Provider
public class MetricsRequestFilter  implements javax.servlet.Filter {
    // Other methods in interface omitted for brevity

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (request instanceof HttpServletRequest) {
            String dateHeader = null;
            Timer.Context context = null;
            try {
                String uri = ((HttpServletRequest) request).getRequestURI();
                if (uri != null && DBBasedConfigs.getConfig("dMetricsCollectionEnabled", Boolean.class, true)) {
                    String[] parts = uri.split("/");
                    String methodName = parts[parts.length -1];
                    if (!methodName.isEmpty()) {
                        Timer timer = MetricUtils.getTimer(methodName);
                        context = timer.time();
                    }
                }

                // always call this
                chain.doFilter(request, response); // This signals that the request should pass this filter
            }
            finally {
                if (context != null) {
                    context.stop();
                }
            }
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void destroy() {

    }
}