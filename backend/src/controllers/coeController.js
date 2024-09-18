const pool = require('../config/db');

exports.createCOE = async (req, res) => {
    const { faculty, status } = req.body;

    try {
        const [result] = await pool.execute('INSERT INTO master_coe (faculty, status) VALUES (?, ?)', [faculty, status]);
        res.status(201).json({ id: result.insertId, faculty, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCOE = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM master_coe');
        if (rows.length === 0) return res.status(404).json({ message: 'No COE entries found' });

        const coePromises = rows.map(async (coe) => {
            // Fetch related faculty information if faculty ID exists
            if (coe.faculty) {
                const [facultyRows] = await pool.execute('SELECT * FROM master_faculty WHERE id = ?', [coe.faculty]);
                coe.facultyInfo = facultyRows[0] || null;
            } else {
                coe.facultyInfo = null; // Set to null if no faculty ID
            }
            return coe;
        });

        const coeWithFacultyInfo = await Promise.all(coePromises);
        res.status(200).json(coeWithFacultyInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCOE = async (req, res) => {
    const { id } = req.params;
    const { faculty, status } = req.body;

    try {
        const [result] = await pool.execute('UPDATE master_coe SET faculty = ?, status = ? WHERE id = ?', [faculty, status, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'COE not found' });

        res.status(200).json({ id, faculty, status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCOE = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM master_coe WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'COE not found' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFacultiesNotInCOE = async (req, res) => {
    try {
        // Fetch faculties that are not in master_coe
        const [rows] = await pool.execute(`
            SELECT * FROM master_faculty 
            WHERE id NOT IN (SELECT DISTINCT faculty FROM master_coe WHERE faculty IS NOT NULL)
        `);

        if (rows.length === 0) return res.status(404).json({ message: 'No faculties found' });

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
