
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

/* Centralized API error handler */
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    // Handle malformed JSON sent to the API.
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            message: "Invalid JSON request body."
        });
    }

    // Handle oversized request bodies.
    if (err.type === "entity.too.large") {
        return res.status(413).json({
            message: "Request body is too large."
        });
    }

    console.error("Unhandled request error:", err.message);

    return res.status(500).json({
        message: "An unexpected server error occurred."
    });
});


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
