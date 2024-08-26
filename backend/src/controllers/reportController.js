
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

exports.getFoilCardReport = async(req, res) => {
    // Extract query parameters
    const { department, year, batch, semcode } = req.query;
   console.log(req.query)
    // Check for missing parameters
    if (!department || !year || !batch || !semcode) {
        return res.status(400).json({
            error: 'Missing required query parameters. Please provide department, year, batch, and semcode.'
        });
    }



    // SQL query with parameterized inputs
    const query = `
      SELECT 
        mf.name AS \`Faculty Name\`,
        mf.faculty_id AS \`Faculty Code\`,
        fpa.semcode AS \`Semester Code\`,
        fpa.paper_count AS \`Paper Count\`,
        CONCAT(mc.course_name, ' (', mc.course_code, ')') AS \`Course Details\`,
        fc.foil_card_number AS \`Foil Card Number\`
      FROM 
        faculty_paper_allocation fpa
      JOIN 
        master_faculty mf ON fpa.faculty = mf.id
      JOIN 
        master_courses mc ON fpa.course = mc.id
      JOIN 
        foil_card fc ON fpa.id = fc.faculty_paper_allocation
      JOIN 
        semcodeMapping sm ON fpa.semcode = sm.semcode_id
      JOIN 
        board_course_mapping bcm ON fpa.course = bcm.course AND fpa.semcode = bcm.semcode
      WHERE 
       bcm.department = ?
        AND sm.year = ?
        AND sm.batch = ?
        AND fpa.semcode = ?
      ORDER BY 
        fpa.id DESC
    `;
  
    try {
        const [rows] = await db.query(query, [department, year,batch,semcode]);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No matching faculty allocations found.' });
        }
      // Process the results to include parsed foil card numbers
      const processedResults = rows.map(result => {
        // Parse foil_card_number as a CSV and create an array
        const foilCardNumbers = result['Foil Card Number'] 
            ? result['Foil Card Number'].split(',').map(num => num.trim()) 
            : [];

        return {
            ...result,
            'Foil Card Number': foilCardNumbers // Replace CSV string with an array
        };
    });

    // Send the processed results as JSON response
    res.status(200).json(processedResults);
    } catch (error) {
        console.error('Error fetching faculty allocations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};