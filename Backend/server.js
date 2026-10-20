
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const express = require("express");

const pool = require("./config/db");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));

// Frontend files remain in the root public directory.
app.use(express.static(path.resolve(__dirname, "../public")));

// Database health check
app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            status: "ok",
            database: "connected"
        });
    } catch (error) {
        console.error("Health check failed:", error.message);

        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});

// Report endpoints
app.use("/api/reports", reportRoutes);

// Start server after verifying database connection
async function startServer() {
    try {
        await pool.query("SELECT 1");

        console.log("MySQL connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
        await pool.end();
        process.exit(1);
    }
}

startServer();
