const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,       // ej: db.xxxxx.supabase.co
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,       // normalmente 'postgres'
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false      // necesario para Supabase
  }
});

module.exports = pool;
