const express = require('express');
const router = express.Router();
const paperAllocationController = require('../controllers/paperAllocationController')

router.get('/facultyPaperAllocationRequests',paperAllocationController.getPaperAllocationRequests);

router.get('/allocations/hod/:hodId', paperAllocationController.getAllocationsUnderHOD);

router.put('/facultyPaperAllocation/status',paperAllocationController.updateFacultyAllocationStatus );

router.get('/allocations/new-faculty/:facultyId', paperAllocationController.getChangeOfAllocations);

router.get('/allocations/faculty',paperAllocationController.getAllocationBasedOnFaculty);

// GET route to retrieve paper count based on various parameters
router.get('/paperCount',paperAllocationController.getPaperCount);


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




module.exports = router;