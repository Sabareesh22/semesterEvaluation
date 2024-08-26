const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController')

router.get('/courses/:departmentId/:semcode',courseController.courseFacultyDetails );

module.exports = router;