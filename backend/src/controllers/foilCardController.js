const db = require('../config/db'); 

exports.postFoilCard = async (req, res) => {
    const { foilCard, allocationId } = req.body;

    if (!foilCard || !allocationId) {
        return res.status(400).json({
            success: false,
            message: 'Foil Card and allocation Id are required.'
        });
    }

    try {
        // Check if an entry with the given allocationId already exists
        const checkQuery = `SELECT COUNT(*) as count FROM foil_card WHERE faculty_paper_allocation = ?`;
        const [checkResult] = await db.query(checkQuery, [allocationId]);

        if (checkResult[0].count > 0) {
            // Update existing entry
            const updateQuery = `UPDATE foil_card SET foil_card_number = ? WHERE faculty_paper_allocation = ?`;
            await db.query(updateQuery, [foilCard, allocationId]);
            res.status(200).send({ message: "Successfully Updated Foil Number" });
        } else {
            // Insert new entry
            const insertQuery = `INSERT INTO foil_card(foil_card_number, faculty_paper_allocation) VALUES(?,?)`;
            await db.query(insertQuery, [foilCard, allocationId]);
            res.status(200).send({ message: "Successfully Added Foil Number" });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.updateFoilCard = async(req,res)=>{

}

exports.getApprovedFacultyAllocationData = async (req, res) => {
    const { department, semcode, year, batch } = req.query;

    // Validate query parameters
    if (!department || !semcode || !year || !batch) {
        return res.status(400).json({ 
            success: false, 
            message: 'Department, semcode, year, and batch are required.' 
        });
    }

    try {
        // Query to fetch course code, faculty name, and paper count
        const query = `
            SELECT 
                fpa.id AS allocationId,
                mc.id AS courseId,
                mc.course_code AS courseCode,
                mf.id AS facultyId,
                mf.faculty_id AS facultyCode,
                mf.name AS facultyName,
                fpa.paper_count AS paperCount
            FROM faculty_paper_allocation fpa
            JOIN master_courses mc ON fpa.course = mc.id
            JOIN master_faculty mf ON fpa.faculty = mf.id
            JOIN board_course_mapping bcm ON mc.id = bcm.course
            JOIN semcodeMapping sm ON bcm.semcode = sm.semcode_id
            WHERE bcm.department = ?  
              AND bcm.semcode = ?   
              AND sm.year = ?
              AND sm.batch = ?
              AND fpa.status = '2'
        `;

        // Execute the query
        const [rows] = await db.query(query, [department, semcode, year, batch]);

        // Transform the data
        const result = rows.reduce((acc, row) => {
            const { allocationId, courseId, courseCode, facultyId, facultyCode, facultyName, paperCount } = row;
            
            // Find the course entry or create a new one
            let course = acc.find(c => c.courseId === courseId);
            if (!course) {
                course = {
                    
                    courseId,
                    courseCode,
                    faculties: []
                };
                acc.push(course);
            }

            // Check for existing faculty entry in the course
            const existingFaculty = course.faculties.find(f => f.facultyId === facultyId);
            if (!existingFaculty) {
                course.faculties.push({
                    facultyId,
                    facultyCode,
                    facultyName,
                    allocationId,
                    paperCount
                });
            }

            return acc;
        }, []);

        // Send the response
        res.json({
            success: true,
            data: result,
            message: 'Data fetched successfully.'
        });
    } catch (error) {
        // Handle errors
        console.error('Error fetching data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

exports.getFoilCardByMappingId = async(req,res)=>{
    const {mappingId} = req.query;
     console.log("sending foil cards")
    // Validate query parameters
    if (!mappingId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Mapping ID is required.' 
        });
    }

    try {
        // Query to fetch foil card numbers
        const query = `
            SELECT 
                fc.foil_card_number
            FROM foil_card fc
            JOIN faculty_paper_allocation fpa ON fc.faculty_paper_allocation = fpa.id
            WHERE fpa.id =?
        `;

        // Execute the query
        const [rows] = await db.query(query, [mappingId]);

        // Send the response
        res.json({
            success: true,
            data: rows,
            message: 'Data fetched successfully.'
        });
    } catch (error) {
        // Handle errors
        console.error('Error fetching data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}