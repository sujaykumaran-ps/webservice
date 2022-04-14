const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const _ = require('underscore');
const db = require('../configs/seqconfig.js');
const dbConfig = require("../configs/dbConfig.js");
const logger = require("../configs/logger");
const File = db.file;
const User = db.users;
const Image = db.image;
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
require('dotenv').config()

const fileUpload = async (source, targetName, s3, fileId, req, res) => {

    fs.readFile(source, async (err, filedata) => {

        if (!err) {

            let s3_start = Date.now();
            console.log('s3 bucket  ', targetName)
            var user = await User.findOne({
                where: {
                    username: req.user.username
                }
            });
            var params = {
                Bucket: process.env.AWS_BUCKET_NAME ,
                Key: user.id+'/'+targetName,
                Body: filedata
            };
            await s3.upload(params, async (err, data) => {

                if (err) {
                    logger.info("error uploading file!!");
                    console.log('s3 bucket  ', err)
                    res.status(500).send({
                        message: err
                    });
                } else {
                    const aws_metadata = JSON.parse(JSON.stringify(data));
                    
                    var image = {
                        id: uuidv4(),
                        file_name: targetName,
                        url: aws_metadata.Location,
                        user_id: user.id
                    };
                    Image.create(image).then(data => {
                        logger.info("upload file success!!");
                            res.status(201).send({
                                file_name: data.file_name,
                                id: data.id,
                                url: data.url,
                                upload_date: data.updatedAt,
                                user_id: data.user_id
                            });
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: err.message || "Error while creating the image!"
                            });
                        });
                }
            });
        } else {
            console.log("errr", err)
            res.status(500).send({
                message: "Error while creating the image!"
            });
        }
    });
}

const deleteFile = async ( s3, image) => {

    let s3_start = Date.now();
    console.log('file delete')
    let deleted = true;
    const params = {

        Bucket: process.env.AWS_BUCKET_NAME,
        Key:   image.user_id+'/'+image.file_name

    }
    
    await s3.deleteObject(params, async(err, data) => {
        if(err){
            console.log('file delete: ' ,err)

            deleted = false;
            logger.error(err)

        } else {
            logger.info("file delete success!!");
            console.log('file delete success')
            await Image.destroy(
                {
                    where:{
                        id: image.id
                    }
                }
            ).then(data => {
                deleted = true;
            });
            
        }
    });
    return deleted;
}
module.exports = {
    fileUpload,
    deleteFile
};