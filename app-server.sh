#!/bin/sh
#!/usr/bin/env bash
sleep 30

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
node -e "console.log('Running Node.js ' + process.version)"
nvm use 17.7.0
node -v
npm install npm@latest -g
npm -v


#install mysql
sudo yum update -y
sudo wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
sudo rpm -Uvh mysql80-community-release-el7-3.noarch.rpm
sudo yum install mysql-server -y
sudo systemctl start mysqld.service
sudo systemctl status mysqld.service

sleep 5
#updating default password and create DB
pwd=$(sudo grep 'temporary password' /var/log/mysqld.log | rev | cut -d':' -f 1 | rev | xargs)
mysql -uroot -p"$pwd" --connect-expired-password -e "Alter user 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Jayashree44.'"
mysql -uroot -pJayashree44. -e "CREATE DATABASE IF NOT EXISTS userdb"


ls -al
cd /tmp/
echo "$(pwd)"
ls -al
cp webservice.tar /home/ec2-user/
cd /home/ec2-user/
tar -xf webservice.tar
ls -ltr
cd webservice
ls -ltr
sudo chmod +x app.js
sudo chmod +x app-server.sh
sudo cp webservice.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl enable webservice
sudo systemctl start webservice
npm install pm2 -g
sleep 15
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v17.7.0/bin /home/ec2-user/.nvm/versions/node/v17.7.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 start app.js
pm2 startup
pm2 save
pm2 list