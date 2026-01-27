const express = require("express");
const path = require("path");
const connectDB = require("./models/db");

// Initialize App
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../Frontend")));

// Routes Modules
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const employeeRoutes = require("./routes/employee");
const consumerRoutes = require("./routes/consumer");

// Mount Routes
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/employee", employeeRoutes);
app.use("/consumer", consumerRoutes);
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
