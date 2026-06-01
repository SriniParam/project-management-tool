const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const query = `
    SELECT projects.*,
    COUNT(tasks.id) AS total_tasks,
    COALESCE(SUM(CASE WHEN tasks.status = 'Done' THEN 1 ELSE 0 END), 0) AS completed_tasks
    FROM projects
    LEFT JOIN tasks ON projects.id = tasks.project_id
    GROUP BY projects.id
    ORDER BY projects.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching projects:", err);
      return res.status(500).json({ error: "Failed to fetch projects", details: err.message });
    }
    res.json(
      result.rows.map((project) => ({
        ...project,
        total_tasks: Number(project.total_tasks) || 0,
        completed_tasks: Number(project.completed_tasks) || 0,
      }))
    );
  });
});

router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Project name is required" });
  }

  db.query(
    "INSERT INTO projects (name) VALUES ($1) RETURNING id, name, created_at",
    [name.trim()],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to create project" });
      }
      res.status(201).json({
        id: result.rows[0].id,
        name: result.rows[0].name,
        created_at: result.rows[0].created_at,
        total_tasks: 0,
        completed_tasks: 0,
      });
    }
  );
});

router.put("/:id", (req, res) => {
  const { name } = req.body;
  const projectId = req.params.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Project name is required" });
  }

  db.query(
    "UPDATE projects SET name=$1 WHERE id=$2 RETURNING *",
    [name.trim(), projectId],
    (err, result) => {
      if (err) {
        console.error("Error updating project", projectId, ":", err);
        return res.status(500).json({ error: "Failed to update project", details: err.message });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(result.rows[0]);
    }
  );
});

router.delete("/:id", (req, res) => {
  const projectId = req.params.id;
  db.query(
    "DELETE FROM projects WHERE id=$1 RETURNING id",
    [projectId],
    (err, result) => {
      if (err) {
        console.error("Error deleting project", projectId, ":", err);
        return res.status(500).json({ error: "Failed to delete project", details: err.message });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ message: "Project deleted", id: result.rows[0].id });
    }
  );
});

module.exports = router;
