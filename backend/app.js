const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const leadRoutes = require("./routes/leads");
const employeeRoutes = require("./routes/employees");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://lead-management-systems.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(helmet());

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
