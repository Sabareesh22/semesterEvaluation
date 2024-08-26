const express = require("express");
const router = express.Router();

const changeRequestsController = require("../controllers/changeRequestController");

router.post(
  "/facultyChangeRequests",
  changeRequestsController.postChangeRequests
);

router.put(
  "/facultyChangeRequests/status",
  changeRequestsController.updateChangeRequestStatus
);

router.get(
  "/facultyReplaceSuggest",
  changeRequestsController.getFacultySuggestionsForChange
);

router.get(
  "/facultyChangeRequests",
  changeRequestsController.getFacultyChangeRequests
);

module.exports = router;