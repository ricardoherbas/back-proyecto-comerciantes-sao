const { Pool } = require("pg");

const conexion = new Pool({
  connectionString: process.env.DATABASE_URL || null,
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "miapp",
  port: 5432,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

module.exports = conexion;
