const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController')

router.post('/board-chief-examiner',boardController.postBoardChiefExaminer );

router.put('/board-chief-examiner',boardController.updateBoardChiefExaminer);

router.put('/board-chairman',boardController.updateBoardChairman)

router.post('/board-chairman',boardController.insertBoardChairman)

module.exports = router;