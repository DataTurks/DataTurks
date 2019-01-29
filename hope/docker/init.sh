#!/bin/bash
/usr/bin/mysqld_safe  &
sleep 5

mysql -u root -e "CREATE DATABASE hope"
mysql -u root -e "CREATE USER dataturks@'127.0.0.1' IDENTIFIED BY '12345';"
mysql -u root -e "GRANT SELECT, INSERT, UPDATE, DELETE ON hope.* TO dataturks@127.0.0.1;FLUSH PRIVILEGES;"
mysql -u root hope < /home/dataturks/mysqlInit.sql
