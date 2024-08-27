const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController')

router.post('/uploadEligibleFaculty', facultyController.uploadEligibleFaculty);

router.post('/allocateFaculty',facultyController.allocateFaculty);

router.get('/check-old-faculty',facultyController.checkOldFaculty );

router.get('/faculty',facultyController.getFaculty); 

module.exports = router;