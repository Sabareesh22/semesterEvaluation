const pool = require('../config/db'); // Use the pool instead of a single connection
const jwt = require('jsonwebtoken') 

exports.getDepartments = async (req, res) => {
    let query = `SELECT id, department FROM master_department WHERE status = '1'`;
    const queryParams = [];

    // Dynamically add conditions based on the query parameters in the request
    if (req.query.department) {
        query += ` AND department = ?`;
        queryParams.push(req.query.department);
    }

    if (req.query.id) {
        query += ` AND id = ?`;
        queryParams.push(req.query.id);
    }

    try {
        const [results] = await pool.query(query, queryParams); // Use queryParams for dynamic binding
        console.log('sending departments');
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


exports.getYears  =  async (req, res) => {
    const query = `SELECT id, year FROM master_year WHERE status = '1'`;
    try {
        const [results] = await pool.query(query); // Use the pool's query method
        console.log('sending years');
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.getSemesters = async (req, res) => {
    const { status, semester } = req.query;
    let query = `SELECT DISTINCT id, semester FROM master_semester WHERE 1=1`;

    // Dynamically add conditions based on request parameters
    if (status) {
        query += ` AND status = ${pool.escape(status)}`;
    }
    if (semester) {
        query += ` AND semester = ${pool.escape(semester)}`;
    }

    try {
        const [results] = await pool.query(query); // Use the pool's query method
        console.log('sending semesters');
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}


exports.getBatches = async (req, res) => {
    // Extract parameters from the request
    const { status = '1', batch, id } = req.query;

    // Initialize an array to hold the conditions
    const conditions = [];

    // Add conditions based on provided parameters
    if (status) {
        conditions.push(`status = '${status}'`);
    }
    if (batch) {
        conditions.push(`batch = '${batch}'`);
    }
    if (id) {
        conditions.push(`id = '${id}'`);
    }

    // Build the WHERE clause dynamically
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Define the SQL query with the dynamic WHERE clause
    const query = `SELECT DISTINCT id, batch FROM master_batch ${whereClause}`;

    try {
        const [results] = await pool.query(query); // Use the pool's query method
        console.log('sending batches');
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


exports.getRegulations = async (req, res) => {
    const { status, regulation } = req.query;
    let query = `SELECT id, regulation FROM master_regulation WHERE 1=1`;

    // Dynamically add conditions based on request parameters
    if (status) {
        query += ` AND status = ${pool.escape(status)}`;
    }
    if (regulation) {
        query += ` AND regulation = ${pool.escape(regulation)}`;
    }

    try {
        const [results] = await pool.query(query); // Use the pool's query method
        console.log('sending regulations');
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
