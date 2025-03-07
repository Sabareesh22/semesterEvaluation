
const db = require('../config/db'); 

exports.postSemcodes = async (req, res) => {
    const { semcode, semester, batch, year, regulation, status } = req.body;

    // Query to check if the semcode already exists
    const checkSemcodeQuery = `
        SELECT id FROM master_semcode WHERE semcode = ?
    `;
    
    // Query to check if the unique combination of semester, batch, year, and regulation exists
    const checkUniqueCombinationQuery = `
        SELECT COUNT(*) as count 
        FROM semcodeMapping 
        WHERE semcode_id = ? AND semester = ? AND batch = ? AND year = ? AND regulation = ?
    `;
    
    try {
        // Check if the semcode already exists
        const [checkSemcodeResult] = await db.query(checkSemcodeQuery, [semcode]);

        let semcode_id;

        if (checkSemcodeResult.length > 0) {
            // Semcode exists, get its id
            semcode_id = checkSemcodeResult[0].id;
        } else {
            // Semcode doesn't exist, insert it into master_semcode table
            const insertSemcodeQuery = `
                INSERT INTO master_semcode (semcode, status)
                VALUES (?, ?)
            `;
            const [insertSemcodeResult] = await db.query(insertSemcodeQuery, [semcode, status]);

            // Get the newly inserted semcode_id
            semcode_id = insertSemcodeResult.insertId;
        }

        // Check the unique combination in semcodeMapping
        const [checkCombinationResult] = await db.query(checkUniqueCombinationQuery, [semcode_id, semester, batch, year, regulation]);

        if (checkCombinationResult[0].count > 0) {
            return res.status(400).json({ message: 'The combination of semester, batch, year, and regulation already exists for this semcode.' });
        }

        // Insert the details into semcodeMapping table
        const insertMappingQuery = `
            INSERT INTO semcodeMapping (semcode_id, semester, batch, year, regulation, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const mappingValues = [semcode_id, semester, batch, year, regulation, status];
        await db.query(insertMappingQuery, mappingValues);
        
        res.status(201).json({ message: 'Semester code and mapping added successfully' });
    } catch (error) {
        console.error('Error inserting semcode:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


exports.getSemcodes = async (req, res) => {
    const { batch, year, semcode } = req.query;

    try {
        let getAllSemcodesQuery;
        const queryParams = [];

        if (batch == null && year == null && semcode == null) {
            // Query when batch, year, and semcode are not provided
            getAllSemcodesQuery = `
                SELECT *
                FROM master_semcode
            `;
        } else {
            // Base query to join master_semcode and semcodeMapping tables
            getAllSemcodesQuery = `
                SELECT DISTINCT ms.id, ms.semcode, sm.semester, sm.batch, sm.year, sm.regulation, ms.status 
                FROM master_semcode ms
                JOIN semcodeMapping sm ON ms.id = sm.semcode_id
            `;

            // Conditions to filter by batch, year, and optional semcode
            const conditions = [];

            if (batch != null) {
                conditions.push('sm.batch = ?');
                queryParams.push(batch);
            }
            if (year != null) {
                conditions.push('sm.year = ?');
                queryParams.push(year);
            }
            if (semcode != null) {
                conditions.push('ms.semcode = ?');
                queryParams.push(semcode);
            }

            // Add conditions to the query if any exist
            if (conditions.length > 0) {
                getAllSemcodesQuery += ` WHERE ` + conditions.join(' AND ');
            }
        }

        // Execute the query with the provided query parameters
        const [semcodes] = await db.query(getAllSemcodesQuery, queryParams);
        res.status(200).json({ results: semcodes });
    } catch (error) {
        console.error('Error fetching semcodes:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


exports.updateSemcodes = async (req, res) => {
    const { id, semcode, semester, batch, year, regulation, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Semcode ID is required for update.' });
    }

    // Build dynamic update query
    let updateFields = [];
    let updateValues = [];

    if (semcode) {
        updateFields.push('semcode = ?');
        updateValues.push(semcode);
    }
    if (semester) {
        updateFields.push('semester = ?');
        updateValues.push(semester);
    }
    if (batch) {
        updateFields.push('batch = ?');
        updateValues.push(batch);
    }
    if (year) {
        updateFields.push('year = ?');
        updateValues.push(year);
    }
    if (regulation) {
        updateFields.push('regulation = ?');
        updateValues.push(regulation);
    }
    if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
    }

    // Ensure there are fields to update
    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update.' });
    }

    // Add ID to the values for the WHERE clause
    updateValues.push(id);

    const updateQuery = `
        UPDATE master_semcode 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
    `;

    try {
        await db.query(updateQuery, updateValues);
        res.status(200).json({ message: 'Semcode updated successfully' });
    } catch (error) {
        console.error('Error updating semcode:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


exports.deleteSemcode = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Semcode ID is required for deletion.' });
    }

    const deleteQuery = `
        DELETE FROM master_semcode 
        WHERE id = ?
    `;

    try {
        const [result] = await db.query(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Semcode not found.' });
        }

        res.status(200).json({ message: 'Semcode deleted successfully' });
    } catch (error) {
        console.error('Error deleting semcode:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
