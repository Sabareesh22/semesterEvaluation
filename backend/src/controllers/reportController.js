
const db = require('../config/db'); 

exports.getFacultyAllocationReport = async (req, res) => {
  const { departmentId, semcode } = req.query;

  // Validate the input
  if (!departmentId || !semcode) {
      return res.status(400).json({ message: 'departmentId and semcode are required.' });
  }

  const query = `
      SELECT 
          mc.course_code AS courseCode, 
          mc.course_name AS courseName, 
          GROUP_CONCAT(DISTINCT mf.faculty_id) AS facultyIds,
          GROUP_CONCAT(DISTINCT mf.name) AS facultyNames,
          GROUP_CONCAT(fpa.paper_count ORDER BY mf.faculty_id) AS paperCounts, 
          ms.semcode, 
          GROUP_CONCAT(DISTINCT fpa.remark) AS remarks
      FROM 
          faculty_paper_allocation fpa
      JOIN 
          master_faculty mf ON fpa.faculty = mf.id
      JOIN 
          master_courses mc ON fpa.course = mc.id
      JOIN 
          master_semcode ms ON ms.id = fpa.semcode
      WHERE 
          mf.department = ?
          AND fpa.semcode = ?
          AND fpa.status = '2'
      GROUP BY 
          mc.course_code, mc.course_name, ms.semcode;
  `;

  try {
      const [rows] = await db.query(query, [departmentId, semcode]);

      // Check if any rows were returned
      if (rows.length === 0) {
          return res.status(404).json({ message: 'No matching faculty allocations found.' });
      }

      // Parse concatenated strings into arrays
      const results = rows.map(row => {
          // Split concatenated values into arrays
          const facultyIds = row.facultyIds ? row.facultyIds.split(',') : [];
          const facultyNames = row.facultyNames ? row.facultyNames.split(',') : [];
          const paperCounts = row.paperCounts ? row.paperCounts.split(',').map(count => parseInt(count, 10)) : [];
          const remarks = row.remarks ? row.remarks.split(',') : [];

          // Ensure faculty lists and paper counts match
          // We need to handle cases where counts and names might not perfectly align
          const facultyData = facultyIds.map((id, index) => ({
              facultyId: id,
              facultyName: facultyNames[index] || '',
              paperCount: paperCounts[index] || 0,
              remark: remarks[index] || ''
          }));

          return {
              courseCode: row.courseCode,
              courseName: row.courseName,
              facultyData, // Array of objects with facultyId, facultyName, paperCount, and remark
              semcode: row.semcode
          };
      });

      // Send the results
      res.status(200).json({ results });
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
      SUM(fpa.paper_count) AS \`Paper Count\`,
      GROUP_CONCAT(CONCAT(mc.course_name, ' (', mc.course_code, ')') SEPARATOR ', ') AS \`Course Details\`,
      GROUP_CONCAT(fc.foil_card_number SEPARATOR ', ') AS \`Foil Card Number\`
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
    GROUP BY 
      mf.name, mf.faculty_id, fpa.semcode
    ORDER BY 
      mf.faculty_id DESC
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