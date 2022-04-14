const db = require('../configs/seqconfig.js');
const User = db.users;
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const dbConfig = require('../configs/dbConfig.js');
const logger = require("../configs/logger");
const SDC = require('statsd-client');
const sdc = new SDC({host: dbConfig.METRICS_HOSTNAME, port: dbConfig.METRICS_PORT});

const AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1'
});
var sns = new AWS.SNS({});
var dynamoDatabase = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION || 'us-east-1'
});


// //Delete all User
async function deleteAllUser(req, res, next) {

    console.log('delete user')
    await User.sync({
        force: true
    });
    console.log('delete all users')
    res.status(201).send({
        message: 'Deleted all users'
    });

}

// Create a User
async function createUser(req, res, next) {
    console.log('create user')
    var hash = await bcrypt.hash(req.body.password, 10);
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(req.body.username)) {
        logger.info("/create user 400");
        res.status(400).send({
            message: 'Enter your Email ID in correct format !!'
        });
    }
    const getUser = await User.findOne({
        where: {
            username: req.body.username
        }
    }).catch(err => {
        logger.error("/create user error 500");
        res.status(500).send({
            message: err.message || 'Some error while creating the user'
        });
    });
    if (getUser) {
        res.status(400).send({
            message: 'User Already Exists !'
        });
    } else {
        var user = {
            id: uuidv4(),
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: hash,
            username: req.body.username,
            isVerified: false
        };
        console.log('above user');
        User.create(user).then(async udata => {

                let link = ' http://demo.sujays.me/v1/verifyUserEmail?email=' + udata.username + '&token=' + uuidv4();
                const data_link = {
                    email: udata.id,
                    link: link
                }
                const randomnanoID = uuidv4();

                const initialTime = Math.round(Date.now() / 1000);
                const expiryTime = new Date().getTime();
                // Create the Service interface for dynamoDB
                var parameter = {
                    TableName: 'csye6225Pro',
                    Item: {
                        'TokenName': {
                            S: randomnanoID
                        },
                        'TimeToLive': {
                            N: expiryTime.toString()
                        }
                    }
                };
                
                //saving the token onto the dynamo DB
                try {
                    var dynamodb = await dynamoDatabase.putItem(parameter).promise();
                    console.log('try dynamoDatabase', dynamodb);
                } catch (err) {
                    console.log('err dynamoDatabase', err);
                }

                console.log('dynamoDatabase', dynamodb);
                var msg = {
                    'username': udata.username,
                    'token': randomnanoID
                };
                console.log(JSON.stringify(msg));

                const params = {

                    Message: JSON.stringify(msg),
                    Subject: randomnanoID,
                    TopicArn: 'arn:aws:sns:us-east-1:342617959621:verify_email'

                }
                var publishTextPromise = await sns.publish(params).promise();

                console.log('publishTextPromise', publishTextPromise);
                res.status(201).send({
                    id: udata.id,
                    first_name: udata.first_name,
                    last_name: udata.last_name,
                    username: udata.username,
                    account_created: udata.createdAt,
                    account_updated: udata.updatedAt,
                    isVerified: udata.isVerified
                });

            })
            .catch(err => {
                logger.error(" Error while creating the user! 500");
                res.status(500).send({
                    message: err.message || "Some error while creating the user!"
                });
            });
    }
}

// Verify user
async function verifyUser(req, res, next) {
    console.log('verifyUser :');
    console.log('verifyUser :', req.query.email);
    const user = await getUserByUsername(req.query.email);
    if (user) {
        console.log('got user  :');
        if (user.dataValues.isVerified) {
            res.status(202).send({
                message: 'Your account has been verified!'
            });
        } else {

            var params = {
                TableName: 'csye6225',
                Key: {
                    'Email': {
                        S: req.query.email
                    },
                    'TokenName': {
                        S: req.query.token
                    }
                }
            };
            console.log('got user  param:');
            // Call DynamoDB to read the item from the table

            dynamoDatabase.getItem(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                    res.status(400).send({
                        message: 'unable to verify'
                    });
                } else {
                    console.log("Success dynamoDatabase getItem", data.Item);
                    try {
                        var ttl = data.Item.TimeToLive.N;
                        var curr = new Date().getTime();
                        console.log(ttl);
                        console.log('time diffrence', curr - ttl);
                        var time = (curr - ttl) / 60000;
                        console.log('time diffrence ', time);
                        if (time < 5) {
                            if (data.Item.Email.S == user.dataValues.username) {
                                User.update({
                                    isVerified: true,
                                }, {
                                    where: {
                                        username: req.query.email
                                    }
                                }).then((result) => {
                                    if (result == 1) {
                                        logger.info("update user 204");
                                        sdc.increment('endpoint.userUpdate');
                                        res.status(200).send({
                                            message: 'Successfully Verified!'
                                        });
                                    } else {
                                        res.status(400).send({
                                            message: 'unable to verify'
                                        });
                                    }
                                }).catch(err => {
                                    res.status(500).send({
                                        message: 'Error Updating the user'
                                    });
                                });
                            } else {
                                res.status(400).send({
                                    message: 'Token and email did not matched'
                                });
                            }
                        } else {
                            res.status(400).send({
                                message: 'Your token has been expired! You can not verify your account now.'
                            });
                        }
                    } catch (err) {
                        console.log("Error", err);
                        res.status(400).send({
                            message: 'unable to verify'
                        });
                    }
                }
            });

        }
    } else {
        res.status(400).send({
            message: 'User not found!'
        });
    }
}

//Get User
async function getUser(req, res, next) {
    const user = await getUserByUsername(req.user.username);
    //logger.info("get user"+ user);
    if (user) {
        sdc.increment('endpoint.getuser');
        logger.info("GET user success!! 200");
        res.status(200).send({
            id: user.dataValues.id,
            first_name: user.dataValues.first_name,
            last_name: user.dataValues.last_name,
            username: user.dataValues.username,
            account_created: user.dataValues.createdAt,
            account_updated: user.dataValues.updatedAt
        });
    } else {
        logger.error("user not found! 400");
        res.status(400).send({
            message: 'User not found !!!'
        });
    }
}

// Update user

async function updateUser(req, res, next) {
    if (req.body.username != req.user.username) {
        logger.error("Cannot Update User !!! 400");
        res.status(400);
    }
    if (!req.body.first_name || !req.body.last_name || !req.body.username || !req.body.password) {
        logger.error("Update user failed !! 400");
        res.status(400).send({
            message: 'Enter all parameters !!!'
        });
    }
    User.update({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: await bcrypt.hash(req.body.password, 10)
    }, {
        where: {
            username: req.user.username
        }
    }).then((result) => {
        if (result == 1) {
            logger.info("Update user success !! 204");
            sdc.increment('endpoint.updateuser');
            res.sendStatus(204);
        } else {
            logger.info("Update user failed !! 400");
            res.sendStatus(400);
        }
    }).catch(err => {
        res.status(500).send({
            message: 'Error Updating the User details !!!'
        });
    });
}

async function getUserByUsername(username) {
    logger.info("GET user success !!");
    sdc.increment('endpoint.getuser');
    return User.findOne({
        where: {
            username: username
        }
    });
}

async function comparePasswords(existingPassword, currentPassword) {
    return bcrypt.compare(existingPassword, currentPassword);
}

module.exports = {
    createUser: createUser,
    getUser: getUser,
    getUserByUsername: getUserByUsername,
    comparePasswords: comparePasswords,
    updateUser: updateUser,
    deleteAllUser: deleteAllUser,
    verifyUser: verifyUser
};
