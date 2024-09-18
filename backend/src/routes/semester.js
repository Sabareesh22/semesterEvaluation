const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');

router.post('/semesters', semesterController.createSemester); // Create a semester
router.get('/semesters', semesterController.getSemesters); // Dynamic GET with filters
router.get('/semesters/:id', semesterController.getSemesterById); // Get semester by ID
router.put('/semesters/:id', semesterController.updateSemester); // Dynamic Update
router.delete('/semesters/:id', semesterController.deleteSemester); // Delete a semester

module.exports = router;
