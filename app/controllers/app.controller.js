const { response } = require("express");
const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');

// Create and Save a new User
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

// Fetch Authenticated User Details
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
        res.status(400).send({
          message:
            err.message || "Some error occurred while retrieving User Details."
        });
      });
};

// Update User Details
exports.update = (req, res) => {
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (req.body.password) {
        const salt = bcrypt.genSaltSync(10, 'a');
        req.body.password = bcrypt.hashSync(req.body.password, salt);
    }
    
    // Ignoring Username field
    if(req.body.username && req.body.username != username ){
        res.status(400).send({
          message: "Username cannot be updated !!!"
        });
    }
    // Ignoring Timestamps
    else if(req.body.account_created || req.body.account_updated) {
      res.status(400).send({
        message: "Timestamp Fields cannot be updated !!!"
      });
    }
    else {
    User.update(req.body, {
      where: { username: username }
    })
      .then(num => {
        if (num == 1) {
          res.status(204).send({
            message: "User updated successfully !!!"
          });
        } else {
          res.status(400).send({
            message: "Cannot update User. Maybe User was not found or request body is empty!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
            message:
                err.message || "Error updating User with username=" + username
        });
      });
    }
  };