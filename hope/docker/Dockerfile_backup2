FROM openjdk:8-jdk
ENV DEBIAN_FRONTEND noninteractive

RUN echo "LC_ALL=en_US.UTF-8" >> /etc/environment
RUN echo "LANG=en_US.UTF-8" >> /etc/environment
RUN echo "NODE_ENV=development" >> /etc/environment

ENV BASE_DIR=/home/dataturks
ENV BAZAR_PARENT_DIR=/home/dataturks

RUN mkdir $BASE_DIR
RUN mkdir $BASE_DIR/logs

WORKDIR $BASE_DIR


# Install basics
RUN apt-get update && \
	apt-get -y install mysql-server && \
	apt-get -y install apache2 && \
	apt-get install -y php7.0 && \
	apt-get install -y libapache2-mod-php7.0


COPY ./docker/onprem-dataturks.com.conf /etc/apache2/sites-available/
COPY ./docker/onprem-dataturks.com.conf /etc/apache2/sites-available/000-default.conf


RUN a2enmod proxy_http && \
    a2enmod php7.0 && \
    a2ensite onprem-dataturks.com.conf


WORKDIR $BASE_DIR

#init mysql DB
COPY ./docker/mysqlInit.sql $BASE_DIR/mysqlInit.sql
COPY ./docker/init.sh $BASE_DIR/init.sh
RUN chmod +x ./init.sh && \
	./init.sh



#Install Node 8
RUN apt-get -y install build-essential && \
	curl -sL https://deb.nodesource.com/setup_8.x | bash && \
	apt-get install --yes nodejs && \
	node -v && \
	npm -v && \ 
	npm i -g nodemon && \
	nodemon -v



#Copy Bazaar.
RUN mkdir $BAZAR_PARENT_DIR/bazaar
RUN chmod -R 755 $BAZAR_PARENT_DIR/bazaar

COPY ./bazaar/src $BAZAR_PARENT_DIR/bazaar/src
COPY ./bazaar/api $BAZAR_PARENT_DIR/bazaar/api
COPY ./bazaar/webpack $BAZAR_PARENT_DIR/bazaar/webpack
COPY ./bazaar/semantic $BAZAR_PARENT_DIR/bazaar/semantic
COPY ./bazaar/bin $BAZAR_PARENT_DIR/bazaar/bin
COPY ./bazaar/build $BAZAR_PARENT_DIR/bazaar/build
COPY ./bazaar/static $BAZAR_PARENT_DIR/bazaar/static

COPY ./bazaar/js $BAZAR_PARENT_DIR/bazaar/js
COPY ./bazaar/css $BAZAR_PARENT_DIR/bazaar/css
COPY ./bazaar/img $BAZAR_PARENT_DIR/bazaar/img
COPY ./bazaar/vendor $BAZAR_PARENT_DIR/bazaar/vendor

COPY ./bazaar/.babelrc $BAZAR_PARENT_DIR/bazaar/.babelrc
COPY ./bazaar/server.babel.js $BAZAR_PARENT_DIR/bazaar/server.babel.js

COPY ./bazaar/semantic.json $BAZAR_PARENT_DIR/bazaar/semantic.json
COPY ./bazaar/package.json $BAZAR_PARENT_DIR/bazaar/package.json
COPY ./bazaar/onprem.php $BAZAR_PARENT_DIR/bazaar/onprem.php

#allow local uploads.
WORKDIR $BAZAR_PARENT_DIR/bazaar
RUN rm -rf $BAZAR_PARENT_DIR/bazaar/uploads && \
	mkdir $BAZAR_PARENT_DIR/bazaar/uploads && \
	npm install && \
	npm run build-onprem && \
	npm prune



#remove source.
RUN rm -rf $BAZAR_PARENT_DIR/bazaar/src/components && \
	rm -rf $BAZAR_PARENT_DIR/bazaar/src/containers && \
	rm -rf $BAZAR_PARENT_DIR/bazaar/src/theme && \
	rm -rf $BAZAR_PARENT_DIR/bazaar/src/utils


#set permissions for apache readable.
#RUN chmod -R 755 $BAZAR_PARENT_DIR/bazaar

WORKDIR $BASE_DIR


EXPOSE 9090
EXPOSE 3000
EXPOSE 3001
EXPOSE 80


COPY ./code/hope/target/dataturks-1.0-SNAPSHOT.jar $BASE_DIR/dataturks-1.0-SNAPSHOT.jar
COPY ./code/hope/onprem.yml $BASE_DIR/onprem.yml

COPY ./docker/startup.sh $BASE_DIR/startup.sh
RUN chmod +x ./startup.sh
CMD ./startup.sh > ./startup_log.log

