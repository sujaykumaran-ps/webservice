#!/bin/sh
#!/usr/bin/env bash
sleep 30

sudo yum update -y
sudo yum install -y git

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
node -e "console.log('Running Node.js ' + process.version)"
nvm use node
node -v
npm install npm@latest -g
npm -v

# sudo yum -y install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
# echo 'Install epel'
# sudo amazon-linux-extras install epel -y
# echo 'Install community server'
# sudo yum -y install mysql-community-server
# sudo systemctl enable --now mysqld
# systemctl status mysqld
# echo 'here'
# pass=$(sudo grep 'temporary password' /var/log/mysqld.log | awk {'print $13'})
# mysql --connect-expired-password -u root -p$pass -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Jayashree44.';"

sudo yum update -y sudo 
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm 
sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022 
sudo rpm -Uvh mysql80-community-release-el7-3.noarch.rpm sudo yum 
install mysql-server -y 
sudo systemctl start mysqld.service 
sudo systemctl status mysqld.service 
pwd=$(sudo grep 'temporary password' /var/log/mysqld.log | rev | cut -d':' -f 1 | rev | xargs) mysql -uroot -p$pwd --connect-expired-password -e "Alter user 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Jayashree44.'" mysql -uroot -pJayashree44. -e "CREATE DATABASE IF NOT EXISTS userdb"


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


# npm install -g pm2

# mkdir -p ~/code/app-dist
# mv /tmp/webservice ~/code/app-dist/webservice
# cd  ~/code/app-dist/webservice
# pm2 start app.js
# pm2 startup systemd
# pm2 save
# pm2 list


# # In the temp dir, get the node binaries and extract them
# curl -sLO https://nodejs.org/dist/latest-v14.x/node-$VERSION.tar.gz
# tar -xzf node-$VERSION.tar.gz
# mv node-$VERSION /usr/src/node

# # Link the binaries onto the $PATH
# ln -s /usr/src/node/bin/node /usr/bin/node
# ln -s /usr/src/node/bin/npm /usr/bin/npm
# ln -s /usr/src/node/bin/npx /usr/bin/npx

# # Clean the temporary directory
# rm -r $TMP

# # Create the unix user
# adduser node

# # Add them to groups
# usermod -aG sudo node
# usermod -aG gpio node

# # Create a node-owned folder to put the app in
# # You call this whatever you like, probably the name of your application
# mkdir -p /usr/src/webservice
# chown -R node:node /usr/src/webservice

# # Become our new node user
# su node

# # Clone the repo
# git clone git@github.com:the-office-csye6225/webservice.git /usr/src/webservice
# cd /usr/src/webservice

# # Install the app's production dependencies
# # There could be trouble here if any of your dependencies require extra binaries, like python
# # You might need to debug you packages and see what they require a bit
# npm install 

# SERVICE=webservice

# # Link the service file into place
# sudo ln -s /usr/src/webservice/webservice.service /lib/systemd/system/webservice.service

# # Reload the daemon so it knows about the new file
# sudo systemctl daemon-reload

# # Enable our new service
# sudo systemctl enable $SERVICE

# # Start the service
# sudo systemctl start $SERVICE

# Install MySQL Server
# sudo yum -y install https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
# echo install epel
# sudo amazon-linux-extras install epel
# echo install community server
# sudo yum -y install mysql-community-server
# sudo systemctl enable --now mysqld
# systemctl status mysqld