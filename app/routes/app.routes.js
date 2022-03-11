module.exports = app => {
    const users = require("../controllers/app.controller.js");
    var router = require("express").Router();
    // Declaring Routes
    router.post("/", users.create);
    router.get("/self", users.authenticate);
    router.put("/self", users.update);
    app.use('/v1/user', router);
  };