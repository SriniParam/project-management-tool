const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// Parse NeonDB connection string or use individual environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Database connection established');
});

const db = {
  query: (text, values, callback) => {
    return pool.query(text, values, callback);
  },
  getClient: async () => {
    return pool.connect();
  },
};

// Initialize database schema on startup
function initializeDatabase() {
  // Create projects table
  pool.query(
    `CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error("Error creating projects table:", err.message);
      } else {
        console.log("✓ Projects table ready");
      }
    }
  );

  // Create assignees table
  pool.query(
    `CREATE TABLE IF NOT EXISTS assignees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      avatar_initials VARCHAR(8) NOT NULL,
      avatar_color VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error("Error creating assignees table:", err.message);
      } else {
        console.log("✓ Assignees table ready");
        seedAssignees();
      }
    }
  );

  // Create tasks table
  pool.query(
    `CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'Todo',
      due_date DATE,
      priority VARCHAR(20) DEFAULT 'Medium',
      assignee_id INT,
      project_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignee_id) REFERENCES assignees(id) ON DELETE SET NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`,
    (err) => {
      if (err) {
        console.error("Error creating tasks table:", err.message);
      } else {
        console.log("✓ Tasks table ready");
      }
    }
  );
}

function seedAssignees() {
  const assignees = [
    { name: "Ananya Rao", role: "Product Manager", email: "ananya.rao@example.com", initials: "AR", color: "#0052cc" },
    { name: "Vikram Mehta", role: "Frontend Engineer", email: "vikram.mehta@example.com", initials: "VM", color: "#36b37e" },
    { name: "Priya Nair", role: "QA Analyst", email: "priya.nair@example.com", initials: "PN", color: "#6554c0" },
    { name: "Rahul Sharma", role: "Backend Engineer", email: "rahul.sharma@example.com", initials: "RS", color: "#ff991f" },
  ];

  assignees.forEach((assignee) => {
    pool.query(
      `INSERT INTO assignees (name, role, email, avatar_initials, avatar_color) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO NOTHING`,
      [assignee.name, assignee.role, assignee.email, assignee.initials, assignee.color],
      (err) => {
        if (err) {
          console.error("Error seeding assignee:", err.message);
        } else {
          console.log(`  ✓ Seeded: ${assignee.name}`);
        }
      }
    );
  });
}

// Initialize database on startup
initializeDatabase();
console.log("PostgreSQL (NeonDB) connecting...");

module.exports = db;
