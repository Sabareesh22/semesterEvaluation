const express = require('express');
const router = express.Router();
const facultyCourseMappingController = require('../controllers/facultyCourseMappingController');

// CRUD Routes
router.get('/facultyCourseMapping', facultyCourseMappingController.getAllMappings); // Get all mappings
router.get('/facultyCourseMapping/:id', facultyCourseMappingController.getMappingById); // Get mapping by ID
router.post('/facultyCourseMapping', facultyCourseMappingController.createMapping); // Create a new mapping
router.put('/facultyCourseMapping/:id', facultyCourseMappingController.updateMapping); // Update a mapping
router.delete('/facultyCourseMapping/:id', facultyCourseMappingController.deleteMapping); // Delete a mapping
router.get('/facultyCoursesMappingNotMapped/:facultyId', facultyCourseMappingController.getCoursesNotMappedToFaculty);
module.exports = router;
