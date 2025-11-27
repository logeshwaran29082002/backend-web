const express = require("express");
const app = express();
const router = require("./routes/userRoutes");
const cors = require('cors')
require("dotenv").config();


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://authify-app.netlify.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());

app.use("/api", router);

module.exports = app;
