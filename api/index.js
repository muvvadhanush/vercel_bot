// Vercel Serverless Entry Point
// This thin wrapper lets Vercel auto-discover the Express app
// without needing complex rewrites in vercel.json.
const app = require("../backend/app");
module.exports = app;
