const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController')
// Get Departments
router.get('/departments',apiController.getDepartments);

// Get Years
router.get('/years',apiController.getYears);

// Get Semesters
router.get('/semesters',apiController.getSemesters);

// Get Batches
router.get('/batches',apiController.getBatches );

// Get Regulations
router.get('/regulations', apiController.getRegulations);




module.exports = router;
