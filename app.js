require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./api/users/user.router");

//convert user input to JSON
app.use(express.json());

app.use("/v2/user", userRouter);

app.get('/healthz', (req,res)=>{
  res.status(200).send();
})
app.listen(3000, () => {
  console.log("App Running on Port : ", 3000);
});