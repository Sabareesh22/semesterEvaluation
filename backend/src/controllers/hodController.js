// controllers/hodController.js
const db = require('../config/db');



exports.createHOD = async (req, res) => {
    try {
        const { faculty_id, department_id, status } = req.body;
        const [result] = await db.execute('INSERT INTO master_hod (faculty, department, status) VALUES (?, ?, ?)', [faculty_id, department_id, status]);
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json(err);
    }
};
// Dynamic GET: Retrieve HODs based on optional query parameters
exports.getAllHODs = async (req, res) => {
    try {
        const { faculty_id, department_id, status } = req.query;

        let query = `
            SELECT h.id, h.faculty, h.department, h.status, 
                   f.name AS faculty_name, d.department AS department_name 
            FROM master_hod h 
            JOIN master_faculty f ON h.faculty = f.id 
            JOIN master_department d ON h.department = d.id
        `;
        
        const queryParams = [];
        if (faculty_id) {
            query += ' WHERE h.faculty = ?';
            queryParams.push(faculty_id);
        }
        if (department_id) {
            query += faculty_id ? ' AND' : ' WHERE';
            query += ' h.department = ?';
            queryParams.push(department_id);
        }
        if (status) {
            query += (faculty_id || department_id) ? ' AND' : ' WHERE';
            query += ' h.status = ?';
            queryParams.push(status);
        }

        const [results] = await db.execute(query, queryParams);
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Dynamic UPDATE: Update specific fields based on the request body
exports.updateHOD = async (req, res) => {
    try {
        const updates = [];
        const queryParams = [];

        if (req.body.faculty_id) {
            updates.push('faculty = ?');
            queryParams.push(req.body.faculty_id);
        }
        if (req.body.department_id) {
            updates.push('department = ?');
            queryParams.push(req.body.department_id);
        }
        if (req.body.status) {
            updates.push('status = ?');
            queryParams.push(req.body.status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const sql = `UPDATE master_hod SET ${updates.join(', ')} WHERE id = ?`;
        queryParams.push(req.params.id);

        const [result] = await db.execute(sql, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'HOD not found' });
        }

        res.json({ message: 'HOD updated successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.deleteHOD = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM master_hod WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'HOD not found' });
        }

        res.json({ message: 'HOD deleted successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
};