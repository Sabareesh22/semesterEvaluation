// src/config/db.js

const mysql = require('mysql2/promise'); // Use the promise-based version
require('dotenv').config({ path: '../.env' }); // Adjust based on your structure

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Export the pool for use in your routes
module.exports = pool;
