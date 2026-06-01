const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  db.query(
    "SELECT id, name, role, email, avatar_initials, avatar_color FROM assignees ORDER BY name ASC",
    (err, result) => {
      if (err) {
        console.error('Error fetching assignees:', err);
        return res.status(500).json({ error: 'Failed to fetch assignees', details: err.message });
      }
      res.json(result.rows);
    }
  );
});

module.exports = router;
