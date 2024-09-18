// routes/regulationRoutes.js
const express = require('express');
const router = express.Router();
const regulationController = require('../controllers/regualtionController');

router.post('/regulation', regulationController.createRegulation);
router.get('/regulation', regulationController.getAllRegulations);
router.get('/regulation/:id', regulationController.getRegulationById);
router.put('/regulation/:id', regulationController.updateRegulation);
router.delete('/regulation/:id', regulationController.deleteRegulation);

module.exports = router;
