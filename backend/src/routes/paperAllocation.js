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

router.get('/total-papers',paperAllocationController.getTotalPaperCount);

router.post('/facultyChangeRequests',paperAllocationController.postFacultyChangeRequests);




module.exports = router;