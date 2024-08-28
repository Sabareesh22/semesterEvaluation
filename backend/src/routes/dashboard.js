const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get(
  "/countPendingFacultyApprovals",
  dashboardController.getPendingFacultyApprovalCount
);

router.get(
  "/countCompletedFacultyApprovals",
  dashboardController.getCompletedFacultyAllocationCount
);

router.get(
  "/countRejectedFacultyApprovals",
  dashboardController.getRejectedFacultyApprovalsCount
);

router.get(
  "/countAllocatedCourses",
  dashboardController.getAllocatedCoursesCount
);

router.get("/pendingAllocations", dashboardController.getPendingAllocations);

router.get(
  "/pendingAllocationsSummary",
  dashboardController.getPendingAllocationSummary
);

router.get("/boardChairman", dashboardController.getBc);

router.get("/boardChiefExaminer", dashboardController.getCe);

router.get("/bc_ce", dashboardController.getBcCe);



module.exports = router;