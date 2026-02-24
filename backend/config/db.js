const { Sequelize } = require("sequelize");

// ===== Serverless-Safe Sequelize Config =====
// Uses DB_URL (Supabase connection string) with minimal pooling
// Compatible with PgBouncer transaction mode on Vercel cold starts

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 6543,
    dialect: "postgres",
    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      // Force IPv4 — Render doesn't support IPv6
      family: 4,
    },

    // Serverless-safe pool: 1 connection per invocation, no idle retention
    pool: {
      max: 1,
      min: 0,
      idle: 0,
      acquire: 10000,
    },
  }
);

// Global connection reuse — prevents duplicate instances across hot reloads
global._sequelize = global._sequelize || sequelize;

module.exports = global._sequelize;
