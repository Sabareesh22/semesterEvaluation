const express = require("express");
const router = express.Router();
const batchController = require("../controllers/batchController");

router.get("/batches", batchController.getAllBatches);
router.post("/batches", batchController.createBatch);
router.put("/batches/:id", batchController.updateBatch);
router.delete("/batches/:id", batchController.deleteBatch);

module.exports = router;
