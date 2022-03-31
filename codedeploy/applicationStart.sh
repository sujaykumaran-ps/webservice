#!/bin/bash
#start app
cd /home/ec2-user/webservice
pm2 start app.js
pm2 startup
pm2 save
pm2 list