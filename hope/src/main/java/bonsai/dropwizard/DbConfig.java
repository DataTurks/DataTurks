package bonsai.dropwizard;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.Configuration;
import io.dropwizard.db.DataSourceFactory;
import org.hibernate.validator.constraints.NotEmpty;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

/**
 * Created by mohan.gupta on 04/04/17.
 */
public class DbConfig extends Configuration{

    /**
     * A factory used to connect to a relational database management system.
     * Factories are used by Dropwizard to group together related configuration
     * parameters such as database connection driver, URI, password etc.
     */
    @NotNull
    @Valid
    private DataSourceFactory dataSourceFactory
            = new DataSourceFactory();
    /**
     * A getter for the database factory.
     *
     * @return An instance of database factory deserialized from the
     * configuration file passed as a command-line argument to the application.
     */
    @JsonProperty("database")
    public DataSourceFactory getDataSourceFactory() {
        return dataSourceFactory;
    }

    @NotEmpty
    private String host;

    @NotEmpty
    private String port;

    @NotEmpty
    private String user;

    @NotEmpty
    private String password;

    @NotEmpty
    private String dbName;

    @NotEmpty
    private String firebaseCredFilePath;

    @JsonProperty
    public String getHost() {
        return host;
    }

    @JsonProperty
    public void setHost(String host) {
        this.host = host;
    }

    @JsonProperty
    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    @JsonProperty
    public String getUser() {
        return user;
    }

    @JsonProperty
    public void setUser(String user) {
        this.user = user;
    }

    @JsonProperty
    public String getPassword() {
        return password;
    }

    @JsonProperty
    public void setPassword(String password) {
        this.password = password;
    }

    @JsonProperty
    public String getDbName() {
        return dbName;
    }

    @JsonProperty
    public void setDbName(String dbName) {
        this.dbName = dbName;
    }

    @JsonProperty
    public String getFirebaseCredFilePath() {
        return firebaseCredFilePath;
    }

    @JsonProperty
    public void setFirebaseCredFilePath(String firebaseCredFilePath) {
        this.firebaseCredFilePath = firebaseCredFilePath;
    }
}
