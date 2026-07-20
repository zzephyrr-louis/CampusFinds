const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { initializeDatabase } = require("./database/schema");
const { seedDefaultAdmin } = require("./database/seedAdmin");
const { databasePath, testConnection } = require("./db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const databaseConnected = await testConnection();

    res.status(200).json({
      status: "ok",
      database: databaseConnected ? "connected" : "unavailable",
      databasePath,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database health check failed.",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

async function startServer() {
  try {
    await initializeDatabase();
    await seedDefaultAdmin();
    const databaseConnected = await testConnection();

    if (!databaseConnected) {
      throw new Error("SQLite connection test failed.");
    }

    app.listen(PORT, () => {
      console.log(`CampusFind API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start CampusFind API server:", error.message);
    process.exit(1);
  }
}

startServer();
