
const db = require('../config/db'); 

exports.getPaperAllocationRequests =  async (req, res) => {
    const { semcode } = req.query;

    let query = `
        SELECT 
            GROUP_CONCAT(
                CONCAT(
                    c.id, ':',
                    c.course_name, ':',
                    c.course_code, ':' ,
                    bcm.paper_count  -- Using the total paper count from the subquery
                ) 
                SEPARATOR '|'
            ) AS course_info,
            GROUP_CONCAT(
                CONCAT(
                    f.id, ':', f.faculty_id, ':', f.name, ':', faculty_total_papers.faculty_paper_count  -- Using the total paper count from the subquery
                ) 
                SEPARATOR '|'
            ) AS faculty_info,
            SUM(fa.paper_count) AS paperCount,
            h.id AS hod_id,
            h.faculty AS hod_faculty_id,
            md.department,
            hf.name AS hod_name,
            fa.semcode  -- Include semcode in the SELECT statement
        FROM 
            faculty_paper_allocation fa
        JOIN 
            master_faculty f ON fa.faculty = f.id
        JOIN 
            master_courses c ON fa.course = c.id
        JOIN 
            board_course_mapping bcm ON c.id = bcm.course
        JOIN 
            master_hod h ON bcm.department = h.department
        JOIN 
            master_faculty hf ON h.faculty = hf.id
        JOIN 
            master_department md ON md.id = h.department
        JOIN (
            SELECT course, semcode, SUM(paper_count) as course_paper_count
            FROM faculty_paper_allocation
            GROUP BY course, semcode  -- Group by course and semcode to handle different semcodes separately
        ) as course_total_papers ON fa.course = course_total_papers.course AND fa.semcode = course_total_papers.semcode
        JOIN (
            SELECT faculty, semcode, SUM(paper_count) as faculty_paper_count
            FROM faculty_paper_allocation
            GROUP BY faculty, semcode  -- Group by faculty and semcode to handle different semcodes separately
        ) as faculty_total_papers ON fa.faculty = faculty_total_papers.faculty AND fa.semcode = faculty_total_papers.semcode
        WHERE 
            fa.status = '1'
    `;

    // Add semcode filter if provided
    if (semcode) {
        query += ` AND fa.semcode = ${db.escape(semcode)}`;
    }

    query += `
        GROUP BY 
            h.id,    -- Group by HOD information
            fa.semcode  -- Group by semcode as well
        ORDER BY 
            h.id;  -- Order by HOD id or any other relevant field
    `;

    try {
        const [rows] = await db.query(query);

        // Parse the results
        const parsedResults = rows.map(row => ({
            hodId: row.hod_id,
            hodFacultyId: row.hod_faculty_id,
            hodName: row.hod_name,
            department: row.department,
            semCode: row.semcode,
            paperCount: row.paperCount,
            courseInfo: row.course_info ? row.course_info.split('|').map(course => {
                const [id, name, code, count] = course.split(':');
                return { id, name, code, count };
            }) : [],
            facultyInfo: row.faculty_info ? row.faculty_info.split('|').map(faculty => {
                const [id, facultyId, name, paperCount] = faculty.split(':');
                return { id, facultyId, name, paperCount };
            }) : []
        }));

        res.status(200).json({ results: parsedResults });
    } catch (error) {
        console.error('Error fetching faculty and course information:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getAllocationsUnderHOD = async (req, res) => {
    const { hodId } = req.params;

    const query = `
        SELECT 
            fa.id,
            fa.faculty,
            fa.course,
            fa.paper_count,
            fa.semcode,
            fa.status,
            f.faculty_id,
            f.name AS faculty_name,
            c.course_name,
            c.course_code,
            h.id AS hod_id
        FROM 
            faculty_paper_allocation fa
        JOIN 
            master_faculty f ON fa.faculty = f.id
        JOIN 
            master_courses c ON fa.course = c.id
        JOIN 
            board_course_mapping bcm ON c.id = bcm.course
        JOIN 
            master_hod h ON bcm.department = h.department
        WHERE 
            h.id = ?   -- Filter for the specific HOD and active allocations
        ORDER BY 
            fa.id;  -- Order by allocation ID or any other relevant field
    `;

    try {
        const [rows] = await db.query(query, [hodId]);

        // Parse the results
        const parsedResults = rows.map(row => ({
            allocationId: row.id,
            facultyId: row.faculty,
            facultyDetails: {
                facultyId: row.faculty_id,
                facultyName: row.faculty_name
            },
            courseDetails: {
                courseId: row.course,
                courseName: row.course_name,
                courseCode: row.course_code
            },
            paperCount: row.paper_count,
            semesterCode: row.semcode,
            status: row.status,
            hodId: row.hod_id
        }));

        res.status(200).json({ results: parsedResults });
    } catch (error) {
        console.error('Error fetching faculty paper allocations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.updateFacultyAllocationStatus = async (req, res) => {
    
    const {  courseId, status, semCode, remark } = req.body; // Get facultyId, courseId, status, semCode, and remark from the request body
    const facultyId = req.body.facultyId || req.userId
    // Validate the input

    console.log("facultyId : " + facultyId)
    if (facultyId == null || courseId == null || status == null ) {
        return res.status(400).json({ message: 'Invalid input. Faculty ID, Course ID, and Status are required.' });
    }

    // Base update query
    let updateQuery = `
        UPDATE faculty_paper_allocation
        SET status = '?'
    `;
   console.log("remark : "+ remark)
    // Add the remark update if provided
    const queryParams = [status];
    if (remark != null) {
        updateQuery += `, remark = ?`;
        queryParams.push(remark);
    }

    updateQuery += ` WHERE faculty = ? AND course = ? AND semcode = ?`;

    queryParams.push(facultyId, courseId, semCode);

    try {
        const [updateResult] = await db.query(updateQuery, queryParams);

        // Check if any rows were affected
        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Allocation not found for the specified faculty and course.' });
        }

        res.status(200).json({ message: 'Status and remark updated successfully.' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getChangeOfAllocations = async (req, res) => {
    const { facultyId } = req.params;

    const query = `
        SELECT 
            mc.id AS course,
            mc.course_name, 
            mc.course_code,
            ms.id AS semcode,
            fcr.old_faculty,
            fcr.new_faculty,
            ms.semcode AS semester_code, 
            fpa.paper_count AS paper_count,
            fcr.status 
        FROM 
            faculty_paper_allocation fpa
        JOIN 
            master_courses mc ON fpa.course = mc.id
        JOIN 
            master_semcode ms ON fpa.semcode = ms.id
        JOIN 
            faculty_change_requests fcr ON fcr.course = fpa.course 
                                        AND fcr.semcode = fpa.semcode
                                       AND fcr.old_faculty = fpa.faculty
        WHERE 
            fcr.new_faculty = ?;
    `;

    try {
        const [rows] = await db.query(query, [facultyId]);

        // Parse the results
        const allocations = rows.map(row => ({
            semcode: row.semcode,
            status: row.status,
            old_faculty:row.old_faculty,
            new_faculty:row.new_faculty,
            semesterCode: row.semester_code,
            courseName: row.course_name,
            courseId: row.course,
            courseCode: row.course_code,
            paperCount: row.paper_count
        }));

        res.status(200).json({ results: allocations });
    } catch (error) {
        console.error('Error fetching new faculty allocations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getAllocationBasedOnFaculty =  async (req, res) => {
    const facultyId = req.userId;
    const query = `
       SELECT 
    fpa.semcode,
    fpa.course,
    mc.course_name,
    mc.course_code,
    fpa.paper_count,
    fpa.status,
    ms.semcode AS semester_code
FROM 
    faculty_paper_allocation fpa
JOIN 
    master_courses mc ON fpa.course = mc.id
JOIN 
    master_semcode ms ON fpa.semcode = ms.id
WHERE 
    fpa.faculty = ?;
    `;

    try {
        const [rows] = await db.query(query, [facultyId]);

        // Parse the results
        const allocations = rows.map(row => ({
            semcode: row.semcode,
            status:row.status,
            semesterCode :row.semester_code,
            courseName: row.course_name,
            courseId:row.course,
            courseCode: row.course_code,
            paperCount: row.paper_count
        }));

        res.status(200).json({ results: allocations });
    } catch (error) {
        console.error('Error fetching allocations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


exports.getPaperCount =  async (req, res) => {
    const { faculty, course, semcode } = req.query;

    let query = `
        SELECT paper_count,handlingFaculty,status
        FROM faculty_paper_allocation 
        WHERE 1=1
    `;
    
    const params = [];

    if (faculty) {
        query += ' AND faculty = ?';
        params.push(faculty);
    }
    if (course) {
        query += ' AND course = ?';
        params.push(course);
    }
    if (semcode) {
        query += ' AND semcode = ?';
        params.push(semcode);
    }
    try {
        const [rows] = await db.query(query, params);
        if (rows.length == 0) {
            res.status(200).json({ results: {paper_count:0,status: '-100'} });
            return
        }
        
        // Assuming we are only interested in the first record
        const { paper_count, status,handlingFaculty } = rows[0];
        res.status(200).json({ results: {paper_count:paper_count,status: status,handlingFaculty:handlingFaculty} });
    } catch (error) {
        console.error('Error fetching paper count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.postFacultyChangeRequests =  async (req, res) => {
    const { old_faculty,new_faculty, course, semcode,remark } = req.body;
    // Validate the input
    if (old_faculty == null||new_faculty==null || course == null || semcode == null ) {
        return res.status(400).json({ message: 'All fields are required: faculty, course, semcode' });
    }

    const insertQuery = `
        INSERT INTO faculty_change_requests (old_faculty,new_faculty, course, semcode,remark) 
        VALUES (?,?, ?, ?,?)
    `;
    
    try {
        const values = [old_faculty,new_faculty, course, semcode,remark];
        const [insertResult] = await db.query(insertQuery, values);
        
        res.status(201).json({ message: 'Faculty change request added successfully', requestId: insertResult.insertId });
    } catch (error) {
        console.error('Error inserting faculty change request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getTotalPaperCount =  async (req, res) => {
    const { department, batch, semcode } = req.query;
  
    // Validate the required query parameters
    if (!department || !batch || !semcode) {
      return res.status(400).json({ error: 'Department, Batch, and Semcode are required' });
    }
  
    try {
      // Construct the SQL query
      const query = `
        SELECT 
            department, 
            batch, 
            semcode, 
            SUM(paper_count) AS total_papers
        FROM 
            board_course_mapping
        WHERE 
            department = ? AND 
            batch = ? AND 
            semcode = ?
        GROUP BY 
            department, 
            batch, 
            semcode
      `;
  
      // Execute the query
      const [results] = await db.query(query, [department, batch, semcode]);
  
      // Check if results are found
      if (results.length === 0) {
        return res.status(404).json({ message: 'No records found for the provided department, batch, and semcode' });
      }
  
      // Return the results
      return res.status(200).json(results[0]); // Since GROUP BY returns one row per group
  
    } catch (error) {
      console.error('Error fetching total papers:', error);
      return res.status(500).json({ error: 'An error occurred while fetching total papers' });
    }
  }