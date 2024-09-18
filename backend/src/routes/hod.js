const express = require('express');
const hodController = require('../controllers/hodController');
const router = express.Router();

router.post('/hod', hodController.createHOD);
router.get('/hod', hodController.getAllHODs);
router.put('/hod/:id', hodController.updateHOD);
router.delete('/hod/:id', hodController.deleteHOD);

module.exports = router;