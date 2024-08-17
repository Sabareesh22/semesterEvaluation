const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path to your database config

router.post('/semcodes', async (req, res) => {
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
});



// GET route to retrieve all semester codes
router.get('/semcodes', async (req, res) => {
    const { batch, year } = req.query;

    try {
        let getAllSemcodesQuery;
        const queryParams = [];

        if (batch == null && year == null) {
            // Query when both batch and year are not provided
            getAllSemcodesQuery = `
                SELECT id, semcode
                FROM master_semcode
            `;
        } else {
            // Base query to join master_semcode and semcodeMapping tables
            getAllSemcodesQuery = `
                SELECT DISTINCT ms.id, ms.semcode, sm.semester, sm.batch, sm.year, sm.regulation, ms.status 
                FROM master_semcode ms
                JOIN semcodeMapping sm ON ms.id = sm.semcode_id
            `;

            // Conditions to filter by batch and year
            const conditions = [];

            if (batch != null) {
                conditions.push('sm.batch = ?');
                queryParams.push(batch);
            }
            if (year != null) {
                conditions.push('sm.year = ?');
                queryParams.push(year);
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
                bcm.time_in_days,
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
                faculty, 
                course, 
                paper_count 
            FROM 
                external_faculty_paper_allocation 
            WHERE 
                semcode = ? AND course IN (SELECT course FROM board_course_mapping WHERE department = ?)
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
            const { course_id, course_name, faculty_id, faculty_name, paper_count, time_in_days } = row;
            const key = `${course_id}`;
            const remainingPaperCount = paper_count - (externalAllocationMap[key] || 0);

            if (!courses[course_name]) {
                courses[course_name] = {
                    courseId: course_id,
                    courseName: course_name,
                    paperCount: remainingPaperCount > 0 ? remainingPaperCount : 0,
                    externalCount : externalAllocationMap[key] || 0,
                    time: time_in_days,
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
});



// POST route to upload eligible faculty data
router.post('/uploadEligibleFaculty', async (req, res) => {
    const facultyData = req.body;
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
    const { facultyId, courseId, paperCount, semCode,handledBy,time,handlingFacultyRole,departmentId} = req.body[0];
    console.log(req.body[0])
    if (facultyId == null || courseId == null || paperCount == null || semCode == null||handledBy==null||handlingFacultyRole==null) {
        return res.status(400).json({ message: 'All fields are required: faculty, course, paper_count, and semCode' });
    }
    function roundToHalfOrCeiling(value) {
        const roundedValue = Math.round(value * 2) / 2;
        return roundedValue < value ? roundedValue + 0.5 : roundedValue;
    }
    const existingPaperCountQuery = `
    SELECT SUM(paper_count) existingPaperCount FROM faculty_paper_allocation WHERE faculty =  ? AND semcode = ?
    `
    try {
        const [result] = await db.query(existingPaperCountQuery,[facultyId,semCode])
        console.log(result[0].existingPaperCount)
        console.log("roundoff : "+roundToHalfOrCeiling((parseInt(result[0].existingPaperCount)+paperCount)/50))
        console.log({time:time,roundOff:roundToHalfOrCeiling((parseInt(result[0].existingPaperCount)+paperCount)/50)})
        console.log(roundToHalfOrCeiling((parseInt(result[0].existingPaperCount)+paperCount)/50)>time)
        if(roundToHalfOrCeiling((parseInt(result[0].existingPaperCount)+paperCount)/50)>time){
            return res.status(400).json({message:`Faculty Allocation is more than ${time} days Overall the semester try reducing the paper count or adding faculty`})
        }
    } catch (error) {
        console.error('Error processing faculty paper allocation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    const overallPaperInSemesterQuery = `SELECT SUM(paper_count) totalPaperInSem FROM board_course_mapping WHERE department =? AND semcode = ?`
    try {
        const [result] = await db.query(overallPaperInSemesterQuery,[departmentId,semCode]);
        if(roundToHalfOrCeiling(parseInt(result[0].totalPaperInSem)/time)<251){
               if(handlingFacultyRole=='CE'){
                return res.status(400).json({message:"You Cannot Appoint CE until BC have more than 251 paper per day"})
               }
        }
    } catch (error) {
        console.error('Error processing faculty paper allocation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
            INSERT INTO faculty_paper_allocation (faculty, course, paper_count, semcode,handlingFaculty) 
            VALUES (?, ?, ?, ?,?)
        `;
        const [insertResult] = await db.query(insertQuery, [facultyId, courseId, paperCount, semCode,handledBy]);
        res.status(201).json({ message: 'Faculty paper allocation added successfully', allocationId: insertResult.insertId });

    } catch (error) {
        console.error('Error processing faculty paper allocation:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add this route to your existing Express router

// GET route to retrieve faculty and course information based on department
router.get('/facultyPaperAllocationRequests', async (req, res) => {
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
        if (rows.length == 0) {
            res.status(200).json({ results: {paper_count:0,status: '-100'} });
            return
        }
        
        // Assuming we are only interested in the first record
        const { paper_count, status } = rows[0];
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



router.put('/facultyChangeRequests/status', async (req, res) => {
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

        if (status === -2 || status === -1) {
            // Delete the faculty_change_request row
            const deleteRequestQuery = `
                DELETE FROM faculty_change_requests WHERE id = ?
            `;
            await db.query(deleteRequestQuery, [requestId]);

            // Update the status of the old_faculty in faculty_paper_allocation
            const updatedStatus = status === -2 ? -4 : -3;
            const updateAllocationStatusQuery = `
                UPDATE faculty_paper_allocation
                SET status = '?', remark = ?
                WHERE faculty = ? AND course = ? AND semcode = ?
            `;
            await db.query(updateAllocationStatusQuery, [updatedStatus, remark || null, old_faculty, course, semcode]);

            return res.status(200).json({ message: `Status updated to ${updatedStatus}, faculty change request deleted.` });
        }

        // Update the status of the matching record
        const updateQuery = `
            UPDATE faculty_change_requests
            SET status = '?', remark = ?
            WHERE id = ?
        `;

        await db.query(updateQuery, [status, remark || null, requestId]); // Store remark as null if not provided

        // Check if the status is 2
        if (status === 2) {
            // Query to get the paper count of the old faculty
            const paperCountQuery = `
                SELECT paper_count FROM faculty_paper_allocation
                WHERE faculty = ? AND course = ? AND semcode = ?
            `;

            const [paperCountRows] = await db.query(paperCountQuery, [old_faculty, course, semcode]);
            const paperCount = paperCountRows.length > 0 ? paperCountRows[0].paper_count : 0; // Default to 0 if not found


            // Check if the new faculty already has an allocation for this course and semcode
            const checkExistingAllocationQuery = `
                SELECT paper_count FROM faculty_paper_allocation
                WHERE faculty = ? AND course = ? AND semcode = ?
            `;

            const [existingAllocationRows] = await db.query(checkExistingAllocationQuery, [new_faculty, course, semcode]);

            if (existingAllocationRows.length > 0) {
                // If the allocation exists, update the paper_count
                const newPaperCount = existingAllocationRows[0].paper_count + paperCount;
                const updateAllocationQuery = `
                    UPDATE faculty_paper_allocation
                    SET paper_count = ?, remark = ?
                    WHERE faculty = ? AND course = ? AND semcode = ?
                `;
                await db.query(updateAllocationQuery, [newPaperCount, remark || null, new_faculty, course, semcode]);
            } else {
                // If the allocation does not exist, insert a new row
                const insertQuery = `
                    INSERT INTO faculty_paper_allocation (faculty, course, paper_count, semcode, status, remark)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                const insertValues = [new_faculty, course, paperCount, semcode, '2', remark || null];
                await db.query(insertQuery, insertValues);
            }

            // Remove the old faculty from faculty_paper_allocation
            const updateAllocationQuery = `
                UPDATE faculty_paper_allocation SET status='-5'
                WHERE faculty = ? AND course = ? AND semcode = ?
            `;
            await db.query(updateAllocationQuery, [old_faculty, course, semcode]);


            // Delete the respective faculty_change_request row
            await db.query( `DELETE FROM faculty_change_requests WHERE id = ?`, [requestId]);

            return res.status(200).json({ message: 'Status updated to 2, old faculty removed, eligible faculty updated, and faculty change request deleted.' });
        }

    } catch (error) {
        console.error('Error updating faculty change request status:', error);
         return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json({message:"Approved Chnage Request Successfully"})
});



// GET route to retrieve faculty and semcode information
router.get('/facultyReplaceSuggest', async (req, res) => {
    const { courseId, semcode, facultyId } = req.query;
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
            return res.status(200).json({ message: 'No matching faculty found.' });
        }

        // Send the results
        res.status(200).json({ results: rows });
    } catch (error) {
        console.error('Error fetching faculty and semcode information:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/facultyAllocationReport', async (req, res) => {
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
});


router.get('/check-old-faculty', async (req, res) => {
    const { old_faculty, semcode,course } = req.query;
    // SQL query to get the status of old_faculty for the given semcode
    const checkFacultyQuery = `
        SELECT status 
        FROM faculty_change_requests 
        WHERE old_faculty = ? 
        AND semcode = ?
        AND course = ?
        LIMIT 1;
    `;

    try {
        const [result] = await db.query(checkFacultyQuery, [old_faculty, semcode,course]);

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
        res.status(200).json({ code, message: `Status code: ${code}` });
    } catch (error) {
        console.error('Error checking old faculty status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/facultyChangeRequests', async (req, res) => {
    
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
            return res.status(200).json({ message: 'No records found' });
        }

        // Return the faculty change requests
        res.status(200).json({ results: rows });
    } catch (error) {
        console.error('Error fetching faculty change requests:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/countPendingFacultyApprovals', async (req, res) => {

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
});

router.get('/countCompletedFacultyApprovals', async (req, res) => {

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
});

router.get('/countRejectedFacultyApprovals', async (req, res) => {

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
});

router.get('/countAllocatedCourses', async (req, res) => {

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
});


router.get('/pendingAllocations', async (req, res) => {
  
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
});

router.get('/pendingAllocationsSummary', async (req, res) => {

    // Constructing the query to get pending allocations with course codes and paper counts
    let query = `
        SELECT mc.course_code, bcm.paper_count
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
            paper_count: `${row.course_code} - ${row.paper_count} papers`
        }));

        // Return the pending allocations summary
        res.status(200).json({ pending_allocations_summary: pendingAllocations });
    } catch (error) {
        console.error('Error fetching pending allocations summary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/boardChairman', async (req, res) => {
    const { departmentId ,semcode} = req.query;

    try {
        // SQL Query to get board chairman details
        const query = `
            SELECT 
                bcm.id AS mapping_id,
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
});

router.get('/boardChiefExaminer', async (req, res) => {
    const { departmentId, semcode } = req.query;
    try {
        // SQL Query to get board chief examiner details
        const query = `
            SELECT 
                bcem.id AS mapping_id,
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
                AND bcem.status = '1'
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
});

router.get('/bc_ce', async (req, res) => {
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
});


// Export the router
module.exports = router;
