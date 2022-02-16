const express = require('express');
const cors = require("cors");
const app = express();


const sequelize = require('sequelize');
const basicAuth = require('./app/_helpers/basic-auth');

const db = require("./app/models");
db.sequelize.sync();

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(basicAuth);
require("dotenv").config()

const PORT = process.env.PORT


app.get('/healthz', (req, res) => {
    res.json()
});
require("./app/routes/app.routes.js")(app);
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));