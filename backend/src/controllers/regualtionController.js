const db = require('../config/db'); 


// controllers/regulationController.js

exports.createRegulation = async (req, res) => {
    try {
        const { regulation, status } = req.body;

        // Check for existing regulation
        const [existing] = await db.execute('SELECT * FROM master_regulation WHERE regulation = ?', [regulation]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Regulation already exists' });
        }

        // Proceed to insert the new regulation
        const [result] = await db.execute('INSERT INTO master_regulation (regulation, status) VALUES (?, ?)', [regulation, status]);
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json(err);
    }
};


// Get all regulations
exports.getAllRegulations = async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM master_regulation');
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get a regulation by ID
exports.getRegulationById = async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM master_regulation WHERE id = ?', [req.params.id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Regulation not found' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Update a regulation by ID
// controllers/regulationController.js

exports.updateRegulation = async (req, res) => {
    try {
        const { regulation, status } = req.body;
        const updates = [];
        const queryParams = [];

        // Check if the regulation is being updated
        if (regulation) {
            // Check for existing regulation
            const [existing] = await db.execute('SELECT * FROM master_regulation WHERE regulation = ? AND id != ?', [regulation, req.params.id]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Regulation already exists' });
            }
            updates.push('regulation = ?');
            queryParams.push(regulation);
        }

        // Check for status update
        if (status) {
            updates.push('status = ?');
            queryParams.push(status);
        }

        // If no updates are present, return error
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Execute the update query
        const sql = `UPDATE master_regulation SET ${updates.join(', ')} WHERE id = ?`;
        queryParams.push(req.params.id);

        const [result] = await db.execute(sql, queryParams);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Regulation not found' });
        }

        res.json({ message: 'Regulation updated successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete a regulation by ID
exports.deleteRegulation = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM master_regulation WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Regulation not found' });
        }
        res.json({ message: 'Regulation deleted successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
};