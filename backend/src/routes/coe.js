const express = require('express');
const coeController = require('../controllers/coeController');

const router = express.Router();

router.post('/coe', coeController.createCOE);
router.get('/coe', coeController.getCOE);
router.put('/coe/:id', coeController.updateCOE);
router.delete('/coe/:id', coeController.deleteCOE);
router.get('/coeAddSuggestion',coeController.getFacultiesNotInCOE);
module.exports = router;
