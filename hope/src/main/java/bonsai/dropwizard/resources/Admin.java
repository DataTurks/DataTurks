package bonsai.dropwizard.resources;


import bonsai.DB.Refresher;
import bonsai.dropwizard.dao.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


/**
 * Created by mohan.gupta on 18/04/17.
 */
@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
public class Admin {

    private static final Logger LOG = LoggerFactory.getLogger(Admin.class);

    @GET
    @Path("/refresh")
    public Response refresh() {
        try {
            Refresher.refresh();
        }
        catch (Exception e) {
            LOG.error( e.toString());
            throw  new WebApplicationException("Internal Server error occured");
        }

        return Response.ok().entity("OK").build();
    }
}
