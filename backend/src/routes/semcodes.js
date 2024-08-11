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
            console.log("No Eligible Faculty")
            return res.status(404).json({ message: 'No Eligible Faculty. So Upload Eligible faculty List' });
        }

        // Proceed to fetch the courses if semcode exists
        const query = `
            SELECT 
                bcm.id,
                bcm.paper_count,
                mc.id AS course_id,
                mc.course_name, 
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

        // Parse the data to fit the structure needed by the React component
        const courses = {};
        
        rows.forEach(row => {
            const { course_name, faculty_name,paper_count } = row;
            if (!courses[course_name]) {
                courses[course_name] = {
                    courseName: course_name,
                    paperCount: paper_count,
                    department: `Department ${departmentId}`,
                    faculties: []
                };
            }
            courses[course_name].faculties.push(faculty_name);
        });

        // Convert the courses object to an array
        const parsedCourses = Object.values(courses);
    console.log(parsedCourses)
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

// Export the router
module.exports = router;

// Export the router
module.exports = router;
