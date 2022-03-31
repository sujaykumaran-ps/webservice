#!/bin/bash

cd /home/ec2-user/webservice
pm2 kill
pm2 start app.js
pm2 startup
pm2 save
pm2 list