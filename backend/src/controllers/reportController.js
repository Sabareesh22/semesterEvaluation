
const db = require('../config/db'); 

exports.getFacultyAllocationReport = async (req, res) => {
    const { departmentId, semcode } = req.query;

    // Validate the input
    if (!departmentId || !semcode) {
        return res.status(400).json({ message: 'departmentId and semcode are required.' });
    }

    const query = `
        SELECT 
        
            mf.faculty_id facultyId, 
            mf.name AS facultyName, 
            mc.course_code courseCode, 
            mc.course_name courseName, 
            fpa.paper_count paperCount, 
            ms.semcode, 
            fpa.remark
        FROM 
            faculty_paper_allocation fpa
        JOIN 
            master_faculty mf ON fpa.faculty = mf.id
        JOIN 
            master_courses mc ON fpa.course = mc.id
        JOIN master_semcode ms ON ms.id = fpa.semcode
        WHERE 
            mf.department = ?
            AND fpa.semcode = ?
            AND fpa.status = '2';
    `;

    try {
        const [rows] = await db.query(query, [departmentId, semcode]);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No matching faculty allocations found.' });
        }

        // Send the results
        res.status(200).json({ results: rows });
    } catch (error) {
        console.error('Error fetching faculty allocations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}