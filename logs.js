const log4js = require("log4js");
var appRoot = require('app-root-path');
log4js.configure({
  appenders: { logs: { type: "file", filename: "${appRoot}/logs/csye6225.log" } },
  categories: { default: { appenders: ["logs"], level: "info" } },
});

module.exports = log4js;