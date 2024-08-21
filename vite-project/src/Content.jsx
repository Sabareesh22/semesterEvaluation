import { Routes, Route } from 'react-router-dom';
import './Content.css';
import Sidebar from './components/Sidebar';
import COEpage from './pages/COEpage';
import { IconButton } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import FacultyAllocation from './pages/FacultyAllocation';
import FacultyAllocationRequests from './pages/FacutlyAllocationRequests'
import FacultyApprovalPage from './pages/FacultyApprovalPage';
import FacultyChangeRequests from './pages/FacultyChangeRequests';
import ReportDownloadPage from './pages/ReportDownloadPage';
import FacultyAllocationDashboard from './pages/FacultyAllocationDashboard';
import Dashboard from './pages/Dashboard';
import ProtectedRoutes from './ProtectedRoutes';
function Content(props) {
  console.log(props.userDetails)
  const userDetails = props.userDetails;
  return (
    <div className="appContainer">
      <Sidebar />
      <div className="content">
        <div className="header">
          <IconButton>
            {userDetails.name}
            <AccountCircle sx={{ fontSize: 40, color: '#333' }} /> {/* Adjust size and color */}
          </IconButton>
        </div>
        <Routes>
        <Route path="" element={<Dashboard />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route element={<ProtectedRoutes authorizedRole={'coe'}/>}>
          <Route path='createSemesterEvaluation' element={<COEpage/>}/>
          <Route path='semesterEvaluationReport' element={<ReportDownloadPage/>}/>
          <Route path="facultyAllocationRequests" element={<FacultyAllocationRequests />} />
          <Route path="facultyChangeRequests" element={<FacultyChangeRequests />} />
          </Route>
          <Route element={<ProtectedRoutes authorizedRole={'hod'}/>}>
          <Route path="facultyAllocation" element={<FacultyAllocation />} />
          </Route>
          <Route element={<ProtectedRoutes authorizedRole={'faculty'}/>}>
          <Route path="facultyApproval" element={<FacultyApprovalPage/>} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default Content;
