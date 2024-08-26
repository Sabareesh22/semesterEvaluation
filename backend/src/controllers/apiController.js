const pool = require('../config/db'); // Use the pool instead of a single connection
const jwt = require('jsonwebtoken') 

exports.getDepartments = async (req, res) => {
    const query = `SELECT id, department FROM master_department WHERE status = '1'`;
    try {
        const [results] = await pool.query(query); // Use the pool's query method
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
    const query = `SELECT DISTINCT id, semester FROM master_semester WHERE status = '1'`;
    try {
        const [results] = await pool.query(query); // Use the pool's query method
        console.log('sending semesters');
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.getBatches = async (req, res) => {
    const query = `SELECT DISTINCT id, batch FROM master_batch WHERE status = '1'`;
    try {
        const [results] = await pool.query(query); // Use the pool's query method
        console.log('sending batches');
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

exports.getRegulations = async (req, res) => {
    const query = `SELECT id, regulation FROM master_regulation WHERE status = '1'`;
    try {
        const [results] = await pool.query(query); // Use the pool's query method
        console.log('sending regulations');
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}