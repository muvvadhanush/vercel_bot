const { Sequelize } = require("sequelize");

// ===== Serverless-Safe Sequelize Config =====
// Uses DB_URL (Supabase connection string) with minimal pooling
// Compatible with PgBouncer transaction mode on Vercel cold starts

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  // Serverless-safe pool: 1 connection per invocation, no idle retention
  pool: {
    max: 1,
    min: 0,
    idle: 0,
    acquire: 10000,
  },
});

// Global connection reuse — prevents duplicate instances across hot reloads
global._sequelize = global._sequelize || sequelize;

module.exports = global._sequelize;
