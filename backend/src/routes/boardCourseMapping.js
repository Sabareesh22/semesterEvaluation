// routes/boardCourseRoutes.js
const express = require('express');
const router = express.Router();
const boardCourseMappingController = require('../controllers/boardCourseMappingController');

// Define routes and link them to the controller functions
router.post('/boardCourseMapping', boardCourseMappingController.createBoardCourseMapping);
router.get('/boardCourseMapping', boardCourseMappingController.getBoardCourseMapping);
router.put('/boardCourseMapping/:id', boardCourseMappingController.updateBoardCourseMapping);
router.delete('/boardCourseMapping/:id', boardCourseMappingController.deleteBoardCourseMapping);
router.get('/unmappedCoursesForBCM',boardCourseMappingController.getUnmappedCourses);
module.exports = router;
