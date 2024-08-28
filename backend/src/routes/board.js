const express = require('express');
const router = express.Router();   
const boardController = require('../controllers/boardController')

router.post('/board-chief-examiner',boardController.postBoardChiefExaminer );

router.put('/board-chief-examiner',boardController.updateBoardChiefExaminer);

router.post('/board-chief-examiner-add-request',boardController.postBoardChiefExaminerAddition)

router.put('/board-chairman',boardController.updateBoardChairman)

router.post('/board-chairman',boardController.insertBoardChairman)

router.get('/board-chief-examiner-add-request',boardController.getBoardChiefExaminerAddRequests)

router.delete('/board-chief-examiner',boardController.deleteBoardChiefExaminerMapping)

module.exports = router;