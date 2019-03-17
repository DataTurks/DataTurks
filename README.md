# DataTurks

[Note: As on March 2019, please use the branch master_with_dist as the main master branch has some build issues w.r.t dist folder]

Can run as a docker image as well. Here is the docker file specifying all the steps for setting things up:

https://github.com/DataTurks/DataTurks/blob/master/hope/docker/Dockerfile

If you rather have it run as a non-docker service, then see below.

Two main subcomponents:
  1. Hope: Java-mysql based backend.
    
    Build:
    Its a maven project, please install maven and then:
    # cd hope
    # mvn package -DskipTests <-- will build the .jar file.
    
    Run:
    The service is based on dropwizard and taken a config file on startup. This config file specifies the MYSQL end-points, 
    password and the port to run the service on.
    
    Setup mysql server as in: https://github.com/DataTurks/DataTurks/blob/master/hope/docker/mysqlInit.sql
    
    # java -Djava.net.useSystemProxies=true -server -jar dataturks-1.0-SNAPSHOT.jar server onprem.yml
    
  2. Bazaar: React based front-end.
   
    Build:
    Install Node Js etc.
    #sudo apt-get -y install build-essential && \
	  curl -sL https://deb.nodesource.com/setup_8.x | bash && \
	  apt-get install --yes nodejs && \
	  node -v && \
	  npm -v && \ 
	  npm i -g nodemon && \
	  nodemon -v && \
	  apt-get clean
   
    Build:
      # cd bazaar
      # npm install && npm run build-onprem
    
    Run the service:
     # npm run start-onprem
    
    

    
