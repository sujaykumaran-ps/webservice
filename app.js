require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./api/users/user.router");
const log = require("./logs");
const logger = log.getLogger("logs");
const SDC = require("statsd-client");
const sdc = new SDC({ port: 8125 });

//convert user input to JSON
app.use(express.json());

app.use("/v1/user", userRouter);

app.get('/healthz', (req,res)=>{
  logger.info("Health Endpoint Status OK");
  sdc.increment("healthEndpoint");
  res.status(200).send();
})
app.listen(3000, () => {
  console.log("App Running on Port : ", 3000);
});