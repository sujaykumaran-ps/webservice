#!/bin/bash
sleep 30

sudo yum update -y
sudo yum install ruby wget unzip -y

sudo yum install git make gcc -y

sleep 10
sudo amazon-linux-extras install epel
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash ~/.nvm/nvm.sh
sudo yum install -y gcc-c++ make

curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash -
sudo yum install -y nodejs
sudo npm install pm2 -g

# install codedeploy agent
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo service codedeploy-agent status
# sudo service codedeploy-agent start
# sudo service codedeploy-agent status

#install cloud watch agent
sudo yum install amazon-cloudwatch-agent -y
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
-a fetch-config \
-m ec2 \
-c file:/home/ec2-user/webservice/cloudwatch-config.json \
-s

ls -al
cd /tmp/
echo "$(pwd)"
ls -al
cp webservice.zip /home/ec2-user/
cd /home/ec2-user/
unzip -q webservice.zip
ls -ltr
chown ec2-user:ec2-user /home/ec2-user/webservice
cd webservice
ls -ltr
sudo chmod +x app.js
sudo chmod +x app-server.sh
sudo cp webservice.service /etc/systemd/system


# install pm2 and start application
sleep 15
sudo pm2 start app.js
sudo pm2 save
sudo pm2 startup systemd
sudo service codedeploy-agent stop