const router = require('express').Router();
const baseAuthentication = require('./auth.js');
const userController = require('./user.controller.js');
const imageController = require('./image.controller.js');
const dbConfig = require('../configs/dbConfig.js');
const multer = require('multer');
const logger = require("../configs/logger");
const SDC = require('statsd-client');
const sdc = new SDC({host: dbConfig.METRICS_HOSTNAME, port: dbConfig.METRICS_PORT});
var start = new Date();


// GET 
router.get("/healthz", (req, res) => {

    sdc.timing('health.timeout', start);
    logger.info("/health running fine");
    sdc.increment('endpoint.health');
    return res.sendStatus(200).json();
    
});

// POST 
router.post("/v2/user", userController.createUser);

// GET(With Auth)
router.get("/v2/user/self", baseAuthentication(), userController.getUser);

// PUT 
router.put("/v2/user/self", baseAuthentication(), userController.updateUser);

// Post
const upload = multer({
    dest: 'uploads/'
})
router.post("/v1/user/self/pic", baseAuthentication(), upload.single('file'), imageController.updateUserPic);

// Get 
router.get("/v1/user/self/pic", baseAuthentication(), imageController.getUserPic);

// Delete 
router.delete("/v1/user/self/pic", baseAuthentication(), imageController.deleteUserPic);


// Delete all User from table
router.delete("/v2/user/deleteAll", userController.deleteAllUser);


// Verify User email
router.get("/v1/user/verifyUserEmail", userController.verifyUser);

module.exports = router;