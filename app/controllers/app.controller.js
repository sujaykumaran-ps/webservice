const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;
const userService = require('../services/app.service.js');

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
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
};

