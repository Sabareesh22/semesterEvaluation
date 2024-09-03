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