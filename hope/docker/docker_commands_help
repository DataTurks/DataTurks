docker ps -a
docker images
docker rm containerID
docker run -d -p host_port:container_exposed_port --name mohicontainer imageName. (-d to detach --name to give the container a name)

Stop a detached container:
docker stop mohicontainer

Build:
docker build -t mohangupta13/first -f ./Dockerfile ../

Run: 

docker run -d -p 9090:9090 -p 3000:3000 -p 3001:3001 -p 80:80 mohangupta13/first

Connect to a running docker:
sudo docker exec -i -t 93f82429af32 /bin/bash

Delete old containers:
docker rm `docker ps --no-trunc -aq`

Copy file from host to Docker:
docker cp ./dataturks-1.0-SNAPSHOT.jar bb79a9fb5e95:/home/dataturks

Restart docker image:
docker stop bb79a9fb5e95
docker start bb79a9fb5e95
        