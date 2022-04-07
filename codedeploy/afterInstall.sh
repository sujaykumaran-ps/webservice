#start cloudwatch agent
sudo cp /home/ec2-user/webservice/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/etc/
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
-a fetch-config \
-m ec2 \
-c file:/opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json \
-s