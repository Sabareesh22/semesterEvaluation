const express = require('express');
const router = express.Router();
const semcodeController = require('../controllers/semcodeController')


router.post('/semcodes', semcodeController.postSemcodes );



// GET route to retrieve all semester codes
router.get('/semcodes', semcodeController.getSemcodes);


router.put('/semcodes',semcodeController.updateSemcodes);

router.delete('/semcodes/:id',semcodeController.deleteSemcode)

module.exports = router;
