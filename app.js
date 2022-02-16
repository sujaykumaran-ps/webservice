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

// const db = mysql.createPool({
//    connectionLimit: 100,
//    host: DB_HOST,
//    user: DB_USER,
//    password: DB_PASSWORD,
//    database: DB_DATABASE,
//    port: DB_PORT       
// })
// db.getConnection( (err, connection)=> {
//    if (err) throw (err)
//    console.log ("DB connected successfully !!")
// })

// //CREATE USER
// app.post("/v1/user", async (req,res) => {
//     const firstname = req.body.first_name;
//     const lastname = req.body.last_name;
//     const user = req.body.username;
//     const hashedPassword = await bcrypt.hash(req.body.password,10);

// db.getConnection( async (err, connection) => {
//     if (err) throw (err)
//        const sqlSearch = "SELECT * FROM usertable WHERE username = ?"
//        const search_query = mysql.format(sqlSearch,[user])
//        const sqlInsert = "INSERT INTO usertable VALUES (0,?,?,?,?,0)"
//        const insert_query = mysql.format(sqlInsert,[firstname, lastname, user, hashedPassword])

//  await connection.query (search_query, async (err, result) => {

//     if (err) throw (err)
//     console.log("Search Results")
//     console.log(result.length)

//     if (result.length != 0) {
//         connection.release()
//         console.log("User already exists. Please use a different Mail ID!")
//         res.sendStatus(400) 
//     } 

//     else {
//         await connection.query (insert_query, (err, result)=> {
//             connection.release()
//             if (err) throw (err)
//             console.log ("Successfully Created new User")
//             console.log(result.insertId)
//             res.sendStatus(201)
//         })
//     }
// }) 
// }) 
// })


app.get('/healthz', (req, res) => {
    res.json()
});
require("./app/routes/app.routes.js")(app);
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));