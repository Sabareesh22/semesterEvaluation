const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/authMiddleware')

const authController = require('../controllers/authController')

router.post('/login',authController.login)
router.get('/role', checkAuth,authController.getRoles );
router.get('/hodDetails',checkAuth,authController.getHodDetails)

module.exports = router;