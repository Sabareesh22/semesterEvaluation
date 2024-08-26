const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController')

router.get('/facultyAllocationReport',reportController.getFacultyAllocationReport);

router.get('/foilCardReport', reportController.getFoilCardReport);

module.exports = router;
