const express = require("express");
const router = express.Router();
const db = require("../db");

const toSqlDate = (value) => {
  if (!value) return null;
  return String(value).slice(0, 10);
};

router.get("/:projectId", (req, res) => {
  const projectId = req.params.projectId;

  db.query(
    `SELECT
      tasks.*,
      assignees.name AS assignee_name,
      assignees.role AS assignee_role,
      assignees.email AS assignee_email,
      assignees.avatar_initials AS assignee_initials,
      assignees.avatar_color AS assignee_color
    FROM tasks
    LEFT JOIN assignees ON tasks.assignee_id = assignees.id
    WHERE tasks.project_id=$1
    ORDER BY tasks.created_at DESC`,
    [projectId],
    (err, result) => {
      if (err) {
        console.error('Error fetching tasks for project', projectId, ':', err);
        return res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
      }
      res.json(result.rows);
    }
  );
});

router.post("/", (req, res) => {
  const { title, description, status, project_id, due_date, priority, assignee_id } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  if (!project_id) {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  db.query(
    "INSERT INTO tasks (title, description, status, project_id, due_date, priority, assignee_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, title, description, status, project_id, due_date, priority, assignee_id, created_at",
    [title.trim(), description || '', status, project_id, toSqlDate(due_date), priority, assignee_id || null],
    (err, result) => {
      if (err) {
        console.error('Error creating task:', err);
        return res.status(500).json({ error: 'Failed to create task', details: err.message });
      }
      res.status(201).json(result.rows[0]);
    }
  );
});

router.put("/:id", (req, res) => {
  const { title, description, status, due_date, priority, assignee_id } = req.body;
  const taskId = req.params.id;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  db.query(
    "UPDATE tasks SET title=$1, description=$2, status=$3, due_date=$4, priority=$5, assignee_id=$6 WHERE id=$7 RETURNING *",
    [title.trim(), description || '', status, toSqlDate(due_date), priority, assignee_id || null, taskId],
    (err, result) => {
      if (err) {
        console.error('Error updating task', taskId, ':', err);
        return res.status(500).json({ error: 'Failed to update task', details: err.message });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(result.rows[0]);
    }
  );
});

router.delete("/:id", (req, res) => {
  const taskId = req.params.id;

  db.query("DELETE FROM tasks WHERE id=$1 RETURNING id", [taskId], (err, result) => {
    if (err) {
      console.error('Error deleting task', taskId, ':', err);
      return res.status(500).json({ error: 'Failed to delete task', details: err.message });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted', id: result.rows[0].id });
  });
});

module.exports = router;
