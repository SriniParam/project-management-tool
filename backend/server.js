const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const assigneeRoutes = require("./routes/assignees");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/assignees", assigneeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("API endpoints ready:");
  console.log("  GET  /api/health");
  console.log("  GET  /api/projects");
  console.log("  POST /api/projects");
  console.log("  GET  /api/tasks/:projectId");
  console.log("  POST /api/tasks");
  console.log("  PUT  /api/tasks/:id");
  console.log("  DELETE /api/tasks/:id");
  console.log("  GET  /api/assignees");
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
