const db = require('../configs/seqconfig.js');
const fileService = require('./file.service');
const User = db.users;
const Image = db.image;
const bcrypt = require('bcrypt');
const {  v4: uuidv4 } = require('uuid');
const logger = require("../configs/logger");
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const fs = require('fs')
const dbConfig = require('../configs/dbConfig.js');
const SDC = require('statsd-client');
const sdc = new SDC({host: dbConfig.METRICS_HOSTNAME, port: dbConfig.METRICS_PORT});

AWS.config.update({
    region: process.env.AWS_REGION
});
const s3 = new AWS.S3();


// Update
async function updateUserPic(req, res, next) {
    const user = await getUserByUsername(req.user.username);

    var image = await Image.findOne({
        where: {
            user_id: user.id
        }
    });

    if (image) {
        var del = await fileService.deleteFile(s3, image);
        if (del) {
        } else {
            res.status(404).send({
                message: 'Error!'
            });
        }
    }

    if (!req.file) {
        res.status(400).send({
            message: 'No File Uploaded!'
        });
        console.log("No Image Uploaded !");
    }

    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(req.file.originalname).toLowerCase());
    const mimetype = filetypes.test(req.file.mimetype);

    if (!mimetype && !extname) {

        res.status(400).send({
            message: 'Unsupported File Type'
        });
        console.log("Unsupported Image File Format !!!");

    } else {

        const fileId = uuidv4();
        const fileName = path.basename(req.file.originalname, path.extname(req.file.originalname)) + path.extname(req.file.originalname);
        console.log('fileName: ', fileName)
        await fileService.fileUpload(req.file.path, fileName, s3, fileId, req, res);

    }

}

// Get
async function getUserPic(req, res, next) {
    const user = await getUserByUsername(req.user.username);
    var image = await Image.findOne({
        where: {
            user_id: user.id
        }
    });
    if (image) {
        logger.info("GET image success");
        sdc.increment('endpoint.getimage');
        res.status(200).send({
            file_name: image.file_name,
            id: image.id,
            url: image.url,
            upload_date: image.upload_date,
            user_id: image.user_id
        });
    } else {
        res.status(404).send({
            message: 'Profile Image not found !!!'
        });
    }
}

// Delete
async function deleteUserPic(req, res, next) {
    const user = await getUserByUsername(req.user.username);

    var image = await Image.findOne({
        where: {
            user_id: user.id
        }
    });

    if (image) {
        console.log('delete image', image);
        var del = await fileService.deleteFile(s3, image);
        if (del) {
            sdc.increment('endpoint.deleteimage');
            logger.info("Successfully deleted profile image");
            res.status(200).send('')
        } else {
            res.status(404).send({
                message: 'Error!'
            });
        }
    } else {
        res.status(404).send({
            message: 'Image not found!'
        });
    }
}

async function getUserByUsername(username) {
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
    updateUserPic: updateUserPic,
    getUserPic: getUserPic,
    deleteUserPic: deleteUserPic,
};