const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path to your database config

// POST route to add a new semester code
router.post('/semcodes', async (req, res) => {
    const { semcode, semester, batch, year, regulation, status } = req.body;

    // Check if the semester code already exists
    const checkSemcodeQuery = `
        SELECT COUNT(*) as count FROM master_semcode WHERE semcode = ?
    `;
    
    // Check if the unique combination of semester, batch, year, and regulation exists
    const checkUniqueCombinationQuery = `
        SELECT COUNT(*) as count FROM master_semcode 
        WHERE semester = ? AND batch = ? AND year = ? AND regulation = ?
    `;
    
    try {
        const [checkSemcodeResult] = await db.query(checkSemcodeQuery, [semcode]);
        
        // If the semester code exists, return an error message
        if (checkSemcodeResult[0].count > 0) {
            return res.status(400).json({ message: 'Semester code already exists in the database.' });
        }

        // Check the unique combination
        const [checkCombinationResult] = await db.query(checkUniqueCombinationQuery, [semester, batch, year, regulation]);

        // If the unique combination exists, return an error message
        if (checkCombinationResult[0].count > 0) {
            return res.status(400).json({ message: 'The combination of semester, batch, year, and regulation already exists.' });
        }

        // Proceed to insert the new semester code if it doesn't exist
        const insertQuery = `
            INSERT INTO master_semcode (semcode, semester, batch, year, regulation, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [semcode, semester, batch, year, regulation, status];
        const [insertResult] = await db.query(insertQuery, values);
        
        res.status(201).json({ message: 'Semester code added successfully', results: insertResult });
    } catch (error) {
        console.error('Error inserting semcode:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET route to retrieve all semester codes
router.get('/semcodes', async (req, res) => {
    try {
        const getAllSemcodesQuery = `
            SELECT * FROM master_semcode
        `;
        const [semcodes] = await db.query(getAllSemcodesQuery);
        console.log("sending semester codes")
        res.status(200).json({ results: semcodes });
    } catch (error) {
        console.error('Error fetching semcodes:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/courses/:departmentId/:semcode', async (req, res) => {
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
                mc.id AS course_id,
                mc.course_name, 
                mf.id AS faculty_id,
                mf.name AS faculty_name
            FROM 
                board_course_mapping bcm
            INNER JOIN 
                master_courses mc ON mc.id = bcm.course
            INNER JOIN 
                faculty_course_mapping fcm ON fcm.course = bcm.course
            INNER JOIN 
                master_faculty mf ON mf.id = fcm.faculty
            WHERE 
                bcm.department = ?
            ORDER BY 
                mc.course_name, mf.name;
        `;

        const [rows] = await db.query(query, [departmentId]);

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

        // Parse the data to fit the structure needed by the React component
        const courses = {};

        rows.forEach(row => {
            const { course_id, course_name, faculty_id, faculty_name, paper_count } = row;
            if (!courses[course_name]) {
                courses[course_name] = {
                    courseId: course_id,
                    courseName: course_name,
                    paperCount: paper_count,
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
        });

        // Convert the courses object to an array
        const parsedCourses = Object.values(courses);

        console.log(parsedCourses);
        res.status(200).json({ results: parsedCourses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// POST route to upload eligible faculty data
router.post('/uploadEligibleFaculty', async (req, res) => {
    const facultyData = req.body;
     console.log(facultyData)
    if (!Array.isArray(facultyData) || facultyData.length === 0) {
        return res.status(400).json({ message: 'Invalid data format. Expected an array of faculty records.' });
    }

    try {
        for (const faculty of facultyData) {
            const { facultyId, semcode, department } = faculty;

            if (facultyId == null || semcode == null || department == null) {
                return res.status(400).json({ message: 'Invalid faculty data. Faculty ID, semester code, and department are required.' });
            }

            const [rows] = await db.query(`
                SELECT id FROM master_faculty WHERE faculty_id = ?
            `, [facultyId]);

            if (rows.length === 0) {
                return res.status(404).json({ message: `Faculty ID ${facultyId} not found in master_faculty.` });
            }

            const actualFacultyId = rows[0].id;

            await db.query(`
                INSERT INTO eligible_faculty (faculty, semcode, department) 
                VALUES (?, ?, ?)
            `, [actualFacultyId, semcode, department]);
        }

        res.status(201).json({ message: 'Eligible faculty data uploaded successfully.' });
    } catch (error) {
        console.error('Error uploading eligible faculty data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/allocateFaculty', async (req, res) => {
    const { facultyId, courseId, paperCount, semCode } = req.body[0];

    if (facultyId == null || courseId == null || paperCount == null || semCode == null) {
        return res.status(400).json({ message: 'All fields are required: faculty, course, paper_count, and semCode' });
    }

    const checkQuery = `
        SELECT * FROM faculty_paper_allocation 
        WHERE faculty = ? AND course = ? AND semcode = ?
    `;

    try {
        const [existingAllocations] = await db.query(checkQuery, [facultyId, courseId, semCode]);

        if (existingAllocations.length > 0) {
            // Record already exists, ignore insertion
            return res.status(200).json({ message: 'Allocation already exists. Ignored.' });
        }

        const insertQuery = `
            INSERT INTO faculty_paper_allocation (faculty, course, paper_count, semcode) 
            VALUES (?, ?, ?, ?)
        `;
        const [insertResult] = await db.query(insertQuery, [facultyId, courseId, paperCount, semCode]);
        res.status(201).json({ message: 'Faculty paper allocation added successfully', allocationId: insertResult.insertId });

    } catch (error) {
        console.error('Error processing faculty paper allocation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add this route to your existing Express router

// GET route to retrieve faculty and course information based on department
router.get('/facultyPaperAllocationRequests', async (req, res) => {

    const query = `
        SELECT 
    GROUP_CONCAT(
        CONCAT(
            c.id, ':',
            c.course_name, ':',
            c.course_code
        ) 
        SEPARATOR '|'
    ) AS course_info,
    GROUP_CONCAT(
        CONCAT(
            f.id, ':', f.faculty_id, ':', f.name, ':', fa.paper_count
        ) 
        SEPARATOR '|'
    ) AS faculty_info,
    SUM(fa.paper_count) AS paperCount,
    h.id AS hod_id,
    h.faculty AS hod_faculty_id,
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
WHERE 
    fa.status = '1' 
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
            semCode : row.semcode,
            paperCount: row.paperCount,
            courseInfo: row.course_info ? row.course_info.split('|').map(course => {
                const [id, name, code] = course.split(':');
                return { id, name, code };
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
});

// Add this route to your existing Express router

// GET route to retrieve allocation details based on HOD ID
router.get('/allocations/hod/:hodId', async (req, res) => {
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
});

// PUT route to change the status of faculty paper allocation based on facultyId and courseId
router.put('/facultyPaperAllocation/status', async (req, res) => {
    const { facultyId, courseId, status, semCode, remark } = req.body; // Get facultyId, courseId, status, semCode, and remark from the request body
   console.log(req.body)
    // Validate the input
    if (facultyId == null || courseId == null || status == null ) {
        return res.status(400).json({ message: 'Invalid input. Faculty ID, Course ID, and Status are required.' });
    }

    // Base update query
    let updateQuery = `
        UPDATE faculty_paper_allocation
        SET status = '?'
    `;

    // Add the remark update if provided
    const queryParams = [status];
    if (remark !== undefined) {
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
});



router.get('/allocations/new-faculty/:facultyId', async (req, res) => {
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
});



router.get('/allocations/faculty/:facultyId', async (req, res) => {
    const { facultyId } = req.params;

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
});

// GET route to retrieve paper count based on various parameters
router.get('/paperCount', async (req, res) => {
    const { faculty, course, semcode } = req.query;
    console.log(req.query);

    let query = `
        SELECT paper_count, status
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

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No records found' });
        }
        console.log(rows)
        // Assuming we are only interested in the first record
        const { paper_count, status } = rows[0];
        console.log({ results: {paper_count:paper_count,status: status} })
        res.status(200).json({ results: {paper_count:paper_count,status: status} });
    } catch (error) {
        console.error('Error fetching paper count:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.post('/facultyChangeRequests', async (req, res) => {
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
});



// PUT route to update the status of a faculty change request based on matching fields
router.put('/facultyChangeRequests/status', async (req, res) => {
    console.log(req.body);
    const { old_faculty, new_faculty, course, semcode, status, remark } = req.body; // Get fields from the request body
   
    // Validate the input
    if (old_faculty == null || new_faculty == null || course == null || semcode == null || status == null) {
        return res.status(400).json({ message: 'Faculty, course, semcode, and status are required.' });
    }

    // Query to find the record with matching fields
    const checkQuery = `
        SELECT id FROM faculty_change_requests
        WHERE old_faculty = ? AND new_faculty = ? AND course = ? AND semcode = ?
    `;

    try {
        const [rows] = await db.query(checkQuery, [old_faculty, new_faculty, course, semcode]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No matching change request found.' });
        }

        const requestId = rows[0].id; // Get the ID of the matching record

        // Update the status of the matching record
        const updateQuery = `
            UPDATE faculty_change_requests
            SET status = '?', remark = ?
            WHERE id = ?
        `;

        await db.query(updateQuery, [status, remark || null, requestId]); // Store remark as null if not provided

        // Check if the status is 2
        if (status === 2) {
            // Insert the new faculty into faculty_paper_allocation
            const insertQuery = `
                INSERT INTO faculty_paper_allocation (faculty, course, paper_count, semcode, status, remark)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const paperCount = 0; // Set the paper count as required, defaulting to 0 or modify as needed
            const insertValues = [new_faculty, course, paperCount, semcode, '2', remark || null];

            await db.query(insertQuery, insertValues);
        }

        // Remove the old faculty from faculty_paper_allocation
        const deleteQuery = `
            DELETE FROM faculty_paper_allocation
            WHERE faculty = ? AND course = ? AND semcode = ?
        `;
        
        await db.query(deleteQuery, [old_faculty, course, semcode]);

        res.status(200).json({ message: 'Status updated successfully and old faculty removed.' });
    } catch (error) {
        console.error('Error updating faculty change request status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET route to retrieve faculty and semcode information
router.get('/facultyReplaceSuggest', async (req, res) => {
    const { courseId, semcode, facultyId } = req.query;
     console.log(req.query)
    // Validate the input
    if (courseId == null || semcode == null || facultyId == null) {
        return res.status(400).json({ message: 'courseId, semcode, and facultyId are required.' });
    }

    const query = `
        SELECT f.id, f.faculty_id, CONCAT(f.name,' - ',ms.semcode) name 
        FROM faculty_paper_allocation fpa
        INNER JOIN master_faculty f ON fpa.faculty = f.id
        INNER JOIN master_semcode ms ON ms.id = fpa.semcode
        WHERE fpa.course = ? 
          AND fpa.semcode != ? 
          AND fpa.faculty != ?;
    `;

    try {
        const [rows] = await db.query(query, [courseId, semcode, facultyId]);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No matching faculty found.' });
        }

        // Send the results
        res.status(200).json({ results: rows });
    } catch (error) {
        console.error('Error fetching faculty and semcode information:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/check-old-faculty', async (req, res) => {
    const { old_faculty, semcode } = req.query;
     console.log(req.query)
    // SQL query to get the status of old_faculty for the given semcode
    const checkFacultyQuery = `
        SELECT status 
        FROM faculty_change_requests 
        WHERE old_faculty = ? 
        AND semcode = ?
        LIMIT 1;
    `;

    try {
        const [result] = await db.query(checkFacultyQuery, [old_faculty, semcode]);

        if (result.length === 0) {
            return res.status(200).json({ code: 0, message: 'No record found for the given old_faculty and semcode.' });
        }

        const status = result[0].status;
        let code;
        switch (status) {
            case '0':
                code = 1;
                break;
            case '1':
                code = 2;
                break;
            case '2':
                code = 3;
                break;
            default:
                code = 0;
                break;
        }
        console.log("code : "+code)
        res.status(200).json({ code, message: `Status code: ${code}` });
    } catch (error) {
        console.error('Error checking old faculty status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/facultyChangeRequests', async (req, res) => {
    console.log(req.query);
    
    // Constructing the base query
    let query = `
        SELECT 
            fcr.id AS request_id,
            fcr.remark,
            old_faculty.id AS old_faculty_id,
            old_faculty.name AS old_faculty_name,
            old_faculty.faculty_id AS old_faculty_unique_id,
            new_faculty.id AS new_faculty_id,
            new_faculty.name AS new_faculty_name,
            new_faculty.faculty_id AS new_faculty_unique_id,
            mc.id AS course_id,
            mc.course_name,
            mc.course_code,
            ms.id AS semcode_id,
            ms.semcode
        FROM 
            faculty_change_requests fcr
        JOIN 
            master_faculty old_faculty ON fcr.old_faculty = old_faculty.id
        JOIN 
            master_faculty new_faculty ON fcr.new_faculty = new_faculty.id
        JOIN 
            master_courses mc ON fcr.course = mc.id
        JOIN 
            master_semcode ms ON fcr.semcode = ms.id
        WHERE fcr.status='1'
    `;
    
    const params = [];

    // Adding conditions based on provided query parameters (if needed)
    if (req.query.semcode) {
        query += ' WHERE ms.semcode = ?';
        params.push(req.query.semcode);
    }

    try {
        const [rows] = await db.query(query, params);

        // Check if any rows were returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No records found' });
        }

        // Return the faculty change requests
        res.status(200).json({ results: rows });
    } catch (error) {
        console.error('Error fetching faculty change requests:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Export the router
module.exports = router;
