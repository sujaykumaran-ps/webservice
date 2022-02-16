const { response } = require("express");
const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const basicAuth = require('../_helpers/basic-auth.js');


// Create and Save a new Tutorial
exports.create = (req, res) => {
    // Create a User
    const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    username: req.body.username,
    password: req.body.password
    };
    // Save User in the database
    User.create(user)
    .then(data => {
        res.status(201).send(data);
    })
    .catch(err => {
        res.status(400).send({
        message:
            err.message || "Error while creating User"
        });
    });
};

exports.authenticate = (req, res, next) => {
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    console.log(username);
    User.findAll({ where: {username: username} })
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving User Details."
        });
      });
};

