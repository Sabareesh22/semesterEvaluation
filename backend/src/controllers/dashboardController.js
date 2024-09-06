
const db = require('../config/db'); 

exports.getBcCe = async (req, res) => {
    const { semcode, department } = req.query;

    if (!semcode || !department) {
        return res.status(400).json({ error: 'semcode and department are required parameters' });
    }

    try {
        const query = `
            SELECT 
                bcm.id AS chairman_mapping_id,
                CONCAT(mf.name, ' - ', 'BC') AS chairman_name,
                mf.id AS chairman_faculty_id,
                mf.department AS department_id,
                md.department AS department_name,
                ms.semcode AS semcode_name,
                'BC' AS role
            FROM 
                board_chairman_mapping bcm
            JOIN 
                master_faculty mf ON bcm.chairman = mf.id
            JOIN 
                master_department md ON mf.department = md.id
            JOIN 
                master_semcode ms ON bcm.semcode = ms.id
            WHERE 
                bcm.semcode = ? 
                AND mf.department = ?

            UNION

            SELECT 
                bcem.id AS chief_examiner_mapping_id,
                CONCAT(mf2.name, ' - ', 'CE') AS chief_examiner_name,
                mf2.id AS chief_examiner_faculty_id,
                mf2.department AS department_id,
                md.department AS department_name,
                ms.semcode AS semcode_name,
                'CE' AS role
            FROM 
                board_chief_examiner_mapping bcem
            JOIN 
                master_faculty mf2 ON bcem.faculty = mf2.id
            JOIN 
                master_department md ON mf2.department = md.id
            JOIN 
                master_semcode ms ON bcem.semcode = ms.id
            WHERE 
                bcem.semcode = ? 
                AND mf2.department = ?;
        `;

        // Execute the query
        const [rows] = await db.query(query, [semcode, department, semcode, department]);

        // Send the results as a response
        res.json(rows);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
}

exports.getCe = async (req, res) => {
    const { departmentId, semcode } = req.query;
    try {
        // SQL Query to get board chief examiner details
        const query = `
            SELECT 
                bcem.id AS mapping_id,
                mf.id AS faculty_id,
                mf.name AS examiner_name,
                mf.faculty_id AS examiner_faculty_id,
                md.department AS department_name,
                bcem.status AS mapping_status
            FROM 
                board_chief_examiner_mapping bcem
            JOIN 
                master_faculty mf ON bcem.faculty = mf.id
            JOIN 
                master_department md ON bcem.board = md.id
            WHERE 
                bcem.board = ? AND
                bcem.semcode = ?
                AND mf.status = '1'
                AND md.status = '1';
        `;

        // Execute the query with the department ID
        const [results] = await db.query(query, [departmentId, semcode]);

        // Check if results are found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No board chief examiner found for the specified department.' });
        }
        // Return the results as JSON
        res.json(results);

    } catch (error) {
        console.error('Error fetching board chief examiner details:', error);
        res.status(500).json({ message: 'An error occurred while fetching board chief examiner details.' });
    }
}

exports.getBc = async (req, res) => {
    const { departmentId ,semcode} = req.query;

    try {
        // SQL Query to get board chairman details
        const query = `
            SELECT 
                bcm.id AS mapping_id,
                mf.id AS faculty_id,
                mf.name AS chairman_name,
                mf.faculty_id AS chairman_faculty_id,
                md.department AS department_name,
                bcm.status AS mapping_status
            FROM 
                board_chairman_mapping bcm
            JOIN 
                master_faculty mf ON bcm.chairman = mf.id
            JOIN 
                master_department md ON bcm.board = md.id
            WHERE 
                bcm.board = ? AND
                bcm.semcode = ?
                AND bcm.status = '1'
                AND mf.status = '1'
                AND md.status = '1';
        `;

        // Execute the query with the department ID
        const [results] = await db.query(query, [departmentId,semcode]);

        // Check if results are found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No board chairman found for the specified department.' });
        }
        // Return the results as JSON
        res.json(results);

    } catch (error) {
        console.error('Error fetching board chairman details:', error);
        res.status(500).json({ message: 'An error occurred while fetching board chairman details.' });
    }
}

exports.getPendingAllocationSummary =  async (req, res) => {

    // Constructing the query to get pending allocations with course codes and paper counts
    let query = `
        SELECT mc.course_code, bcm.paper_count,bcm.type
        FROM board_course_mapping bcm
        INNER JOIN master_courses mc ON bcm.course = mc.id
        WHERE NOT EXISTS (
            SELECT 1
            FROM faculty_paper_allocation fpa
            WHERE fpa.course = bcm.course
            AND fpa.semcode = bcm.semcode
        )
    `;
    
    const params = [];

    // Adding condition based on provided semcode query parameter
    if (req.query.semcode) {
        query += ' AND bcm.semcode = ?';
        params.push(req.query.semcode);
    }

    // Adding condition based on provided department query parameter
    if (req.query.department) {
        query += ' AND bcm.department = ?';
        params.push(req.query.department);
    }

    try {
        const [rows] = await db.query(query, params);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(200).json({ message: 'No pending allocations found' });
        }

        // Format the response data
        const pendingAllocations = rows.map(row => ({
            course_code: row.course_code,
            paper_count: row.paper_count,
            type:row.type
        }));

        // Return the pending allocations summary
        res.status(200).json({ pending_allocations_summary: pendingAllocations });
    } catch (error) {
        console.error('Error fetching pending allocations summary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getPendingAllocations = async (req, res) => {
  
    // Constructing the base query
    let query = `
        SELECT COUNT(*) count
        FROM board_course_mapping bcm
        WHERE NOT EXISTS (
            SELECT 1
            FROM faculty_paper_allocation fpa
            WHERE fpa.course = bcm.course
            AND fpa.semcode = bcm.semcode
        )
    `;
    
    const params = [];

    // Adding condition based on provided semcode query parameter
    if (req.query.semcode) {
        query += ' AND bcm.semcode = ?';
        params.push(req.query.semcode);
    }

    // Adding condition based on provided department query parameter
    if (req.query.department) {
        query += ' AND bcm.department = ?';
        params.push(req.query.department);
    }

    try {
        const [rows] = await db.query(query, params);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(200).json({ message: 'No pending allocations found' });
        }

        // Return the pending allocations
        res.status(200).json({ pending_allocations: rows[0].count });
    } catch (error) {
        console.error('Error fetching pending allocations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getAllocatedCoursesCount =  async (req, res) => {

    let query = `
        SELECT COUNT(DISTINCT fpa.course) AS unique_course_count
        FROM faculty_paper_allocation fpa
        INNER JOIN board_course_mapping bcm ON fpa.course = bcm.course
        WHERE 1 = 1
    `;

    const params = [];

    if (req.query.semcode) {
        query += ' AND fpa.semcode = ? AND bcm.semcode = ?';
        params.push(req.query.semcode, req.query.semcode);
    }

    if (req.query.department) {
        query += ' AND bcm.department = ?';
        params.push(req.query.department);
    }

    try {
        const [rows] = await db.query(query, params);
        if (rows.length === 0) {
            return res.status(200).json({ message: 'No records found' });
        }
        res.status(200).json({ unique_course_count: rows[0].unique_course_count });
    } catch (error) {
        console.error('Error fetching unique course count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getRejectedFacultyApprovalsCount = async (req, res) => {

    let query = `
        SELECT COUNT(*) AS record_count
        FROM faculty_paper_allocation fpa
        INNER JOIN board_course_mapping bcm ON fpa.course = bcm.course
        WHERE fpa.status = '-1'
    `;

    const params = [];

    if (req.query.semcode) {
        query += ' AND fpa.semcode = ? AND bcm.semcode = ?';
        params.push(req.query.semcode, req.query.semcode);
    }

    if (req.query.department) {
        query += ' AND bcm.department = ?';
        params.push(req.query.department);
    }

    try {
        const [rows] = await db.query(query, params);
        if (rows.length === 0) {
            return res.status(200).json({ message: 'No records found' });
        }
        res.status(200).json({ record_count: rows[0].record_count });
    } catch (error) {
        console.error('Error fetching faculty allocations count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getCompletedFacultyAllocationCount = async (req, res) => {

    let query = `
        SELECT COUNT(*) AS record_count
        FROM faculty_paper_allocation fpa
        INNER JOIN board_course_mapping bcm ON fpa.course = bcm.course
        WHERE fpa.status = '1'
    `;

    const params = [];

    if (req.query.semcode) {
        query += ' AND fpa.semcode = ? AND bcm.semcode = ?';
        params.push(req.query.semcode, req.query.semcode);
    }

    if (req.query.department) {
        query += ' AND bcm.department = ?';
        params.push(req.query.department);
    }

    try {
        const [rows] = await db.query(query, params);
        if (rows.length === 0) {
            return res.status(200).json({ message: 'No records found' });
        }
        res.status(200).json({ record_count: rows[0].record_count });
    } catch (error) {
        console.error('Error fetching faculty allocations count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getPendingFacultyApprovalCount =  async (req, res) => {
    console.log(req.query)
    let query = `
        SELECT COUNT(*) AS record_count
        FROM faculty_paper_allocation fpa
        INNER JOIN board_course_mapping bcm ON fpa.course = bcm.course
        WHERE fpa.status = '0'
    `;

    const params = [];

    if (req.query.semcode) {
        query += ' AND fpa.semcode = ? AND bcm.semcode = ?';
        params.push(req.query.semcode, req.query.semcode);
    }

    if (req.query.department) {
        query += ' AND bcm.department = ?';
        params.push(req.query.department);
    }

    try {
        const [rows] = await db.query(query, params);
        if (rows.length === 0) {
            return res.status(200).json({ message: 'No records found' });
        }
        res.status(200).json({ record_count: rows[0].record_count });
    } catch (error) {
        console.error('Error fetching faculty allocations count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}