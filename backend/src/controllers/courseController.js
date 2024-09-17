const db = require('../config/db'); 

exports.courseFacultyDetails  = async (req, res) => {
    const { departmentId, semcode } = req.params;

    // Query to check if the semcode exists in eligible_faculty table
    const checkSemcodeQuery = `
        SELECT COUNT(*) AS count 
        FROM eligible_faculty 
        WHERE semcode = ? AND department = ?;
    `;

    try {
        // Check if the semcode exists
        const [semcodeCheck] = await db.query(checkSemcodeQuery, [semcode, departmentId]);
        
        // If semcode does not exist, return an error response
        if (semcodeCheck[0].count === 0) {
            console.log("No Eligible Faculty");
            return res.status(404).json({ message: 'No Eligible Faculty. So Upload Eligible Faculty List' });
        }

        // Query to fetch the courses
        const query = `
            SELECT 
                bcm.id,
                bcm.paper_count,
                bcm.in_charge,
                bcm.time_in_days,
                mc.id AS course_id,
                mc.course_name, 
                mc.course_code,
                mf.id AS faculty_id,
                mf.name AS faculty_name,
                bcm.status
            FROM 
                board_course_mapping bcm
            INNER JOIN 
                master_courses mc ON mc.id = bcm.course
            INNER JOIN 
                faculty_course_mapping fcm ON fcm.course = bcm.course
            INNER JOIN 
                master_faculty mf ON mf.id = fcm.faculty
            WHERE 
                bcm.department = ? AND bcm.semcode = ?
            ORDER BY 
                mc.course_name, mf.name;
        `;

        const [rows] = await db.query(query, [departmentId, semcode]);

        // Query to fetch eligible faculties
        const eligibleFacultiesQuery = `
            SELECT 
                faculty AS faculty_id
            FROM 
                eligible_faculty
            WHERE 
                semcode = ? AND department = ?;
        `;
        const [eligibleRows] = await db.query(eligibleFacultiesQuery, [semcode, departmentId]);

        // Create a set of eligible faculty IDs for quick lookup
        const eligibleFacultyIds = new Set(eligibleRows.map(row => row.faculty_id));

        // Query to check existing allocations in external_faculty_paper_allocation
        const externalAllocationsQuery = `
            SELECT 
                course,
                SUM(paper_count) paper_count
            FROM 
                external_faculty_paper_allocation 
            WHERE 
                semcode = ? AND course IN (SELECT course FROM board_course_mapping WHERE department = ?)
                GROUP BY course
        `;
        const [externalAllocations] = await db.query(externalAllocationsQuery, [semcode, departmentId]);

        // Create a map to track external allocations by course
        const externalAllocationMap = {};
        externalAllocations.forEach(allocation => {
            const key = `${allocation.course}`;
            if (!externalAllocationMap[key]) {
                externalAllocationMap[key] = allocation.paper_count;
            }
        });
        console.log(externalAllocationMap)
       let addedExternals =  false;
        // Parse the data to fit the structure needed by the React component
        const courses = {};
        console.log(rows)
        rows.forEach(row => {
            const { course_id, course_name, course_code, faculty_id, faculty_name, paper_count, time_in_days } = row;
            const key = `${course_id}`;


            if (!courses[course_name]) {
                courses[course_name] = {
                    courseId: course_id,
                    courseName: course_name,
                    courseCode : course_code,
                    inCharge: row.in_charge,
                    paperCount: paper_count,
                    externalCount : externalAllocationMap[key] || 0,
                    time: time_in_days,
                    status: row.status,
                    department: `Department ${departmentId}`,
                    faculties: []
                };
            }

            // Add faculty only if they are in the eligible faculty list
            if (eligibleFacultyIds.has(faculty_id)) {
                courses[course_name].faculties.push({
                    facultyId: faculty_id,
                    facultyName: faculty_name
                });
            }

            // Add an entry for the external faculty if they exist
            if (externalAllocationMap[key] && !addedExternals) {
                courses[course_name].faculties.push({
                    facultyId: course_name,
                    facultyName: `External`
                });
                addedExternals = true;
            }
        });

        // Convert the courses object to an array
        const parsedCourses = Object.values(courses);

        res.status(200).json({ results: parsedCourses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Create Course
exports.createCourse = async (req, res) => {
  try {
    const { course_name, course_code, department, semester, regulation, status } = req.body;
    
    // Check if the course code already exists
    const checkSql = 'SELECT id FROM master_courses WHERE course_code = ?';
    const [existingCourse] = await db.query(checkSql, [course_code]);

    if (existingCourse.length > 0) {
      // Course code already exists, so ignore the insertion
      return res.status(200).json({ message: 'Course code already exists' });
    }

    // Insert the new course
    const insertSql = 'INSERT INTO master_courses (course_name, course_code, department, semester, regulation, status) VALUES (?, ?, ?, ?, ?, ?)';
    const [results] = await db.query(insertSql, [course_name, course_code, department, semester, regulation, status]);

    res.json({ message: 'Course created successfully', courseId: results.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  
  // Get Courses (Dynamic Filtering)
  exports.getCourses = async (req, res) => {
    try {
      const filters = req.query;  // e.g. { department: 1, semester: 2 }
      let sql = 'SELECT * FROM master_courses';
      let queryParams = [];
      let whereClauses = [];
  
      // Dynamically build the WHERE clause
      for (const [key, value] of Object.entries(filters)) {
        whereClauses.push(`${key} = ?`);
        queryParams.push(value);
      }
  
      if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
      }
  
      const [results] = await db.query(sql, queryParams);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // Update Course (Dynamic Fields)
  exports.updateCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;  // e.g. { course_name: 'New Name', status: '1' }
      let sql = 'UPDATE master_courses SET ';
      let queryParams = [];
      let setClauses = [];
  
      // Dynamically build the SET clause
      for (const [key, value] of Object.entries(updates)) {
        setClauses.push(`${key} = ?`);
        queryParams.push(value);
      }
  
      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
      }
  
      sql += `${setClauses.join(', ')} WHERE id = ?`;
      queryParams.push(id);
  
      const [results] = await db.query(sql, queryParams);
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json({ message: 'Course updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // Delete Course
  exports.deleteCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const sql = 'DELETE FROM master_courses WHERE id = ?';
      const [results] = await db.query(sql, [id]);
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json({ message: 'Course deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  