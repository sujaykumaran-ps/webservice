module.exports = {
    HOST: "localhost",
    USER: "ec2-user",
    PASSWORD: "Jayashree44.",
    DB: "userdb",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };