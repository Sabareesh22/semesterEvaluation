// routes/courseMappingRoutes.js
const express = require('express');
const courseMappingController = require('../controllers/courseMappingController');

const router = express.Router();

// Define route for getting course mapping data
router.get('/getCourseMappingData', courseMappingController.getCourseMappingData);

// Create
router.post('/board-course-mapping', courseMappingController.createBoardCourseMapping);

// Read (Single)
router.get('/board-course-mapping/:id', courseMappingController.getBoardCourseMapping);

// Read (All)
router.get('/board-course-mapping', courseMappingController.getAllBoardCourseMappings);

// Update
router.put('/board-course-mapping/:id', courseMappingController.updateBoardCourseMapping);

// Delete
router.delete('/board-course-mapping/:id', courseMappingController.deleteBoardCourseMapping);

router.get('/courses-with-null-fields', courseMappingController.getCoursesWithNullFields);

router.get('/free-faculties', courseMappingController.getFreeFaculties);

module.exports = router;
