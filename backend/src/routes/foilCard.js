const express = require('express');
const router = express.Router();
const foilCardController = require('../controllers/foilCardController')

router.post('/addFoilCard',foilCardController.postFoilCard)
router.put('/changeFoilCard',foilCardController.updateFoilCard)