// routes/facultyPaperAllocationRoutes.js
const express = require('express');
const router = express.Router();
const facultyPaperAllocationController = require('../controllers/facultyPaperAllocationController');

// Define routes
router.get('/facultyPaperAllocations', facultyPaperAllocationController.getAllAllocations);
router.get('/facultyPaperAllocations/:id', facultyPaperAllocationController.getAllocationById);
router.post('/facultyPaperAllocations', facultyPaperAllocationController.createAllocation);
router.put('/facultyPaperAllocations/:id', facultyPaperAllocationController.updateAllocation);
router.delete('/facultyPaperAllocations/:id', facultyPaperAllocationController.deleteAllocation);
router.get('/facultyPaperAllocationsFilter', facultyPaperAllocationController.getAllocationsWithFilters);

module.exports = router;
