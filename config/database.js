const { createPool } = require("mysql2");

const pool = createPool({
  port: 3306,
  host: 'localhost',
  user: 'root',
  password: 'Jayashree44.',
  database: 'userdb',
  connectionLimit: 0,  // default value
});

var user_creation =
  "CREATE TABLE IF NOT EXISTS `userdb`.`user` ( `id` VARCHAR(45) NOT NULL, `first_name` VARCHAR(45) NOT NULL, `last_name` VARCHAR(45) NOT NULL, `password` VARCHAR(150) NOT NULL,    `username` VARCHAR(150) NOT NULL,    `account_created` VARCHAR(45) NULL,    `account_updated` VARCHAR(45) NULL,     PRIMARY KEY (`id`),     UNIQUE INDEX `username_UNIQUE` (`username` ASC));";

var image_creation =
  "CREATE TABLE IF NOT EXISTS `userdb`.`image` ( `id` VARCHAR(45) NOT NULL, `file_name` VARCHAR(45) NOT NULL, `url` VARCHAR(100) NOT NULL, `upload_date` VARCHAR(50) NOT NULL, `user_id` VARCHAR(150) NOT NULL , PRIMARY KEY (`id`), FOREIGN KEY (`user_id`) REFERENCES user(`id`) );";

pool.query("show tables", function (err, result) {
  if (err) {
    console.log("error in showing tables");
    throw err;
  } else {
    console.log("tables :", result);
    pool.query(user_creation, function (err, result) {
      if (err) {
        console.log("error in creating user table");
        throw err;
      } else {
        console.log("User Table created");
        pool.query(image_creation, function (err, result) {
          if (err) {
            console.log("error in creating user table");
            throw err;
          }
          console.log("Image Table created");
        });
      }
    });
  }
});

module.exports = pool;
