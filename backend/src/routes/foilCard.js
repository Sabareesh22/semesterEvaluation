const express = require('express');
const router = express.Router();
const foilCardController = require('../controllers/foilCardController')

router.post('/addFoilCard',foilCardController.postFoilCard)
router.put('/changeFoilCard',foilCardController.updateFoilCard)
router.get('/foilCardEntryTableData',foilCardController.getApprovedFacultyAllocationData)
router.get('/foilCardByMappingId',foilCardController.getFoilCardByMappingId)
module.exports = router