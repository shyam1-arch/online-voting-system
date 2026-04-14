
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// connect database
connectDB();

// middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// auth routes
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/verification", require("./routes/verificationRoutes"));

app.use("/api/polls", require("./routes/pollRoutes"));

app.use("/api/tokens", require("./routes/tokenRoutes"));

app.use("/api/votes", require("./routes/voteRoutes"));

app.use("/api/logs", require("./routes/logRoutes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});