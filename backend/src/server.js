const express = require("express");
const app = express();
const apiRoutes = require("./routes/api"); // Adjust the path if necessary
const cors = require("cors");
const verifyToken = require("./middlewares/authMiddleware");
app.use(cors());
const semcodeRoutes = require("./routes/semcodes");
const AuthRoutes = require("./routes/auth");
const reportRoutes = require("./routes/report");
const paperAllocationRoutes = require("./routes/paperAllocation");
const facultyRoutes = require("./routes/faculty");
const dashboardRoutes = require("./routes/dashboard");
const courseRoutes = require("./routes/courses");
const changeRequestRoutes = require("./routes/changeRequests");
const foilCardRoutes = require('./routes/foilCard')
const boardRoutes = require('./routes/board')
const courseMappingRoutes = require('./routes/courseMapping');
const facultyPaperAllocationRoutes = require('./routes/facultyPaperAllocation');
const facultyCourseMappingRoutes = require('./routes/facultyCourseMapping');
const boardCourseMappingRoutes = require('./routes/boardCourseMapping');
const coeRoutes= require('./routes/coe')
const hodRoutes = require('./routes/hod')
const regulationRoutes = require('./routes/regulation')
const yearRoutes = require('./routes/year')
const semesterRoutes = require('./routes/semester')
const batchRoutes = require('./routes/batch')
// Middleware
app.use(express.json());

// API Routes
app.use("/auth", AuthRoutes); // Unprotected routes for authentication
app.use(
  "/api",
  verifyToken,
  semcodeRoutes,
  reportRoutes,
  paperAllocationRoutes,
  facultyRoutes,
  dashboardRoutes,
  courseRoutes,
  changeRequestRoutes,
  foilCardRoutes,
  boardRoutes,
  courseMappingRoutes,
  facultyPaperAllocationRoutes,
  facultyCourseMappingRoutes,
  boardCourseMappingRoutes,
  coeRoutes,
  hodRoutes,
  regulationRoutes,
  yearRoutes,
  semesterRoutes,
  batchRoutes// Protected routes for faculty paper allocation
); // Protected routes
app.use("/",
   verifyToken,
    apiRoutes); // Protected routes for other API functionality

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
