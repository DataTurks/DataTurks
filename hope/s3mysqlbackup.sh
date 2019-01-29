#!/bin/bash

# Based on https://gist.github.com/2206527
# Setup: (1) Install s3cmd (sudo apt get s3cmd), (2) s3cmd --configure (3) chmod +x s3mysqlbackup.sh (change permission).
# make cron: 0 3 * * * bash /home/ubuntu/hope/adminScripts/s3mysqlbackup.sh >/dev/null 2>&1
# Be pretty
echo -e " "
echo -e " .  ____  .    ______________________________"
echo -e " |/      \|   |                              |"
echo -e "[| \e[1;31m♥    ♥\e[00m |]  | S3 MySQL Backup Script v.0.1 |"
echo -e " |___==___|  /                © oodavid 2012 |"
echo -e "              |______________________________|"
echo -e " "

# Basic variables
mysqlpass="flipkart@123"
user="root"
db="hope"

bucket="s3://com.dataturks.backup"


# Timestamp (sortable AND readable)
stamp=`date +"%s - %A %d %B %Y @ %H%M"`

# Feedback
echo -e "Dumping to \e[1;32m$bucket/$stamp/\e[00m"


# Define our filenames
filename="$stamp - $db.sql.gz"
tmpfile="/tmp/$filename"
object="$bucket/$stamp/$filename"

# Feedback
echo -e "\e[1;34m$db\e[00m"

# Dump and zip
echo -e "  creating \e[0;35m$tmpfile\e[00m"
mysqldump -u $user -p$mysqlpass --force --opt --databases "$db" | gzip -c > "$tmpfile"

# Upload
echo -e "  uploading..."
s3cmd put "$tmpfile" "$object"

# Delete
rm -f "$tmpfile"


# Jobs a goodun
echo -e "\e[1;32mJobs a goodun\e[00m"
