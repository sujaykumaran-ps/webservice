const { create, getUser, updateUser } = require("./user.service");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("../../config/database");
var data = '';
const {
  validateEmail,
  checkForStrongPassword,
  generateHashedPassword,
} = require("../../helpers/helper");

const { s3_bucket } = require("../../config.json");

var auth = require("basic-auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
// AWS Config
var AWS = require("aws-sdk");
AWS.config.update({ 
  region: "us-east-1" });
s3 = new AWS.S3({ apiVersion: "2006-03-01" });

module.exports = {
  // Create User
  createUser: (req, res) => {
    const newUser = req.body;
    if (!newUser.username) {
      return res.status(400).json({
        message: "Username cannot be Empty !!!",
        resolution: "Enter valid Username",
      });
    }
    if (!newUser.password) {
      return res.status(400).json({
        message: "Password cannot be Empty !!!",
        resolution:
          "Enter a Strong Password(1 lowercase, 1 Uppercase, 1 number, 1 Special Character & Minimum length of 8)",
      });
    }
    if (!validateEmail(newUser.username)) {
      return res.status(400).json({
        message: "Invalid username !!!",
        resolution: "Enter valid Email",
      });
    }
    if (!checkForStrongPassword(newUser.password)) {
      return res.status(400).json({
        message: "Password too Weak !!!",
        resolution:
          "Enter a Strong Password(1 lowercase, 1 Uppercase, 1 number, 1 Special Character & Minimum length of 8)",
      });
    }
    newUser.password = generateHashedPassword(newUser.password);
    newUser.id = crypto.randomBytes(16).toString("hex");
    newUser.account_created = new Date();
    newUser.account_updated = new Date();
    
    create(newUser, (err, results) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          return res.status(400).json({
            message: "Username already exists !!!",
            resolution:
              "Enter a different username",
          });
        } else {
          return res.status(500).json({
            message: "Error processing Request !!!",
            resolution: "Contact Admin if issue persists",
          });
        }
      }
      return res.status(201).send(results);
    });
  },

  // Get User Details
  getUser: async (req, res) => {
    const username = req.username;
    const password = req.password;

    await getUser(username, password, (err, results) => {
      if (err) {
        return res.status(401).json({
          message: "Authentication failed !!!",
          resolution: "Enter valid Basic Auth Header",
        });
      }
      if (!results) {
        return res.status(404).json({
          message: "Record not found !!!",
          resolution: "Enter valid Basic Auth Header",
        });
      }
      return res.send(results);
    });
  },

  // Update User Details
  updateUser: async (req, res) => {
    if (
      "id" in req.body ||
      "account_created" in req.body ||
      "account_updated" in req.body
    ) {
      return res.status(403).json({
        message:
          "User cannot update id, username, account_created and account_updated Fields !!!",
        resolution: "Can update first_name, last_name, password",
      });
    } else {
      //call updateUser service
      if (
        "password" in req.body &&
        !checkForStrongPassword(req.body.password)
      ) {
        return res.status(400).json({
          message: "Password too Weak !!!",
          resolution:
            "Enter a Strong Password(1 lowercase, 1 Uppercase, 1 number, 1 Special Character & Minimum length of 8)",
        });
      }

      await updateUser(req, (err, results) => {
        if (err) {
          return res.status(401).json({
            message: "Authentication failed !!!",
            resolution: "Enter valid Basic Auth Header",
          });
        }
        return res.status(204).send();
      });
    }
  },

  // Upload Profile Image into DB and S3 Bucket
  uploadFile: async (req, res) => {
    buf = Buffer.from(
      req.body.contents.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    var username = req.username;
    var password = req.password;
    let id = crypto.randomBytes(16).toString("hex");
    let today = new Date();
    let s3_file_name = req.username + "-" + req.body.filename;
    pool.query(
      "SELECT u.id, u.password, i.file_name FROM user u left join image i on u.id = i.user_id WHERE username = ?",
      [username],
      async function (error, results, fields) {
        if (error) {
          res.status(400).send({
            failed: "error occurred",
            error: error,
          });
        } else {
          if (results.length > 0) {
            const comparison = await bcrypt.compare(
              password,
              results[0].password
            );
            if (comparison) {
              var upload_data = {
                Bucket: s3_bucket,
                Key: s3_file_name,
                Body: buf,
                ContentEncoding: "base64",
                ContentType: "image/png",
              };
              if (results[0].file_name != null) {
                var params = { Bucket: s3_bucket, Key: results[0].file_name };
                s3.deleteObject(params, function (err, data) {
                  if (err) {
                    console.log("Error !!!");
                  } else {
                    s3.upload(upload_data, function (err, data) {
                      if (err) {
                        console.log(err);
                        console.log("Error uploading data: ", upload_data);
                      } else {
                        console.log("Successfully updated profile image !!!");
                        pool.query(
                          "UPDATE image set id = ?, file_name = ?,url = ?, upload_date = ? where user_id = ?",
                          [id, data.key, data.Location, new Date(), results[0].id],
                          async function (error, results1, fields) {
                            if (error) {
                              console.log("err :", error);
                              res.status(400).send({
                                failed: "Failed to change Profile Image !!!",
                              });
                            } else {
                              res.status(201).send({
                                file_name: data.Key,
                                id: id,
                                url: data.Location,
                                upload_date: today,
                                user_id: results[0].id,
                              });
                            }
                          }
                        );
                      }
                    });
                  }
                });
              } else {
                s3.upload(upload_data, function (err, data) {
                  if (err) {
                    console.log(err);
                    console.log("Error uploading data: ", upload_data);
                  } else {
                    pool.query(
                      "INSERT INTO image(file_name,id,url,upload_date,user_id) VALUES(?,?,?,?,?)",
                      [data.key, id, data.Location, today, results[0].id],
                      async function (error, results1, fields) {
                        if (error) {
                          console.log("err :", error);
                          res.status(400).send({
                            failed: "New Profile Image upload Failed !!!",
                          });
                        } else {
                          res.status(201).send({
                            file_name: data.Key,
                            id: id,
                            url: data.Location,
                            upload_date: today,
                            user_id: results[0].id,
                          });
                        }
                      }
                    );
                  }
                });
              }
            } else {
              res.status(403).send({
                error: "Enter Valid Basic Auth Header !!!",
              });
            }
          } else {
            res.status(404).send({
              error: "Email does not exist !!!",
            });
          }
        }
      }
    );
  },

  // Retrieve Profile Image
  getFile: async (req, res) => {
    var username = req.username;
    var password = req.password;
    pool.query(
      "SELECT * FROM user u left join image i on u.id = i.user_id WHERE username = ?",
      [username],
      async function (error, results, fields) {
        if (error) {
          res.status(400).send({
            failed: "error occurred",
            error: error,
          });
        } else {
          if (results.length > 0) {
            const comparison = await bcrypt.compare(
              password,
              results[0].password
            );
            if (comparison) {
              var params = { Bucket: s3_bucket, Key: results[0].file_name };
              s3.getObject(params, function (err, data) {
                if (err) {
                  res.status(404).send({
                    error: "Image Not Found !!!",
                  });
                }
                res.status(200).send({
                  file_name: results[0].file_name,
                  id: results[0].id,
                  url: results[0].url,
                  upload_date: results[0].upload_date,
                  user_id: results[0].user_id,
                });
              });
            } else {
              res.status(401).send({
                error: "Enter Valid Basic Auth Header !!!",
              });
            }
          } else {
            res.status(404).send({
              error: "Email does not exist !!!",
            });
          }
        }
      }
    );
  },

  // Delete Profile Image
  deleteFile: async (req, res) => {
    var username = req.username;
    var password = req.password;

    pool.query(
      "SELECT * FROM user u inner join image i on u.id = i.user_id WHERE username = ?",
      [username],
      async function (error, results, fields) {
        if (error) {
          res.status(400).send({
            failed: "error occurred",
            error: error,
          });
        } else {
          if (results.length > 0) {
            const comparison = await bcrypt.compare(
              password,
              results[0].password
            );
            if (comparison) {
              var params = { Bucket: s3_bucket, Key: results[0].file_name };
              s3.deleteObject(params, function (err, data) {
                if (err) {
                  res.status(404).send({
                    error: "Image Not Found !!!",
                  });
                } else {
                  pool.query(
                    "DELETE from image where user_id = ?",
                    [results[0].id],
                    async function (error, results1, fields) {
                      if (error) {
                        console.log("err :", error);
                        res.status(400).send({
                          failed:
                            "Image deleted from s3, error in deleting database record !!!",
                        });
                      } else {
                        res.status(204).send({
                          message: "Profile Image Deleted !!!"
                        });
                      }
                    }
                  );
                }
              });
            } else {
              res.status(403).send({
                error: "Enter Valid Basic Auth Header !!!",
              });
            }
          } else {
            res.status(404).send({
              error: "Email or Profile pic does not exist !!!",
            });
          }
        }
      }
    );
  },
};