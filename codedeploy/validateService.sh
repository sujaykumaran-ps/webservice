#!/bin/bash
cd /home/ec2-user/webservice
sudo pm2 kill
sudo pm2 start app.js
sudo pm2 save
sudo pm2 startup systemd