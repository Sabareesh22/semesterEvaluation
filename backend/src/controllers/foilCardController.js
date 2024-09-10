const db = require('../config/db'); 

exports.postFoilCard = async(req,res)=>{
     const {foilCard,allocationId} = req.body;
     if(!foilCard || !allocationId){
        return res.status(400).json({ 
            success: false, 
            message: 'Foil Card and allocation Id are required.' 
        });
     }
     try {
        const query = `INSERT INTO foil_card(foil_card_number,faculty_paper_allocation) VALUES(?,?)`
        const [rows] = await db.query(query, [foilCard, allocationId]);
        res.status(200).send({message:"Successfully Added Foil Numbers"})
     } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
     }
}

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
                    allocationId,
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
