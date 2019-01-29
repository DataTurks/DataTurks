
1. Copy the '.dockerignore' file to the parent of this directory.
2. Directory structure expected:
      PARENT has: .dockerignore   code/hope bazaar/*
3. Commands:
	> Build an image (The last param ../ speicifs the context for docker, i.e includes files in the parent): 
	             docker build --no-cache -t dataturks/dataturks:2.0.0 -f ./Dockerfile ../../../ 

	> RUN an image:
	             docker run -d -p 80:80 dataturks/dataturks:2.0.0

	> login to a running container:
	                docker ps <-- get the id
	                sudo docker exec -i -t 93f82429af32 /bin/bash

	> Save the image to a file:
					docker save --output dataturks_docker.tar dataturks/dataturks:2.0.0
					tar -cvzf dataturks_docker.tar.gz dataturks_docker.tar 


	> Start container from the save image:
					tar -xvzf dataturks_docker.tar.gz
					docker load --input ./dataturks_docker.tar
					docker images
					docker run -d -p 80:80 dataturks/dataturks:2.0.0

[ec2-user ~]$ sudo yum update -y
[ec2-user ~]$ sudo yum install docker -y
#Start the Docker Service
[ec2-user ~]$ sudo service docker start


4. Others:
    > Start/stop a container:
                      docker stop ID
                      docker start ID
    > Delete all old containers:
                      docker rm `docker ps --no-trunc -aq`

    > Delete all old images:
                     docker rmi $(docker images -qf "dangling=true")





5. Install docker:
			[ec2-user ~]$ sudo yum update -y

			Install Docker

			[ec2-user ~]$ sudo yum install docker -y

			Start the Docker Service

			[ec2-user ~]$ sudo service docker start

			Add the ec2-user to the docker group so you can execute Docker commands without using sudo.

			[ec2-user ~]$ sudo usermod -a -G docker ec2-user




                      53M	./node_modules/phantomjs/
66M	./node_modules/phantomjs-prebuilt/
71M	./node_modules/eslint-config-airbnb-standard/
121M	./node_modules/unicode-5.2.0/


