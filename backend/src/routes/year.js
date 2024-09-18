const express = require('express');
const router = express.Router();
const yearController = require('../controllers/yearController');

router.post('/years', yearController.createYear); // Create a year
router.get('/years', yearController.getYears); // Dynamic GET with filters
router.get('/years/:id', yearController.getYearById); // Get year by ID
router.put('/years/:id', yearController.updateYear); // Dynamic Update
router.delete('/years/:id', yearController.deleteYear); // Delete a year

module.exports = router;
