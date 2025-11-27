const express = require("express");
const app = express();
const router = require("./routes/userRoutes");
const cors = require("cors");
require("dotenv").config();

// ✅ CORS CONFIG
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://authify-app.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", router);

// Optional health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
