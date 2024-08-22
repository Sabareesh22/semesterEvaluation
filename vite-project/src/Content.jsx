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
import axios from 'axios';
import apiHost from '../config/config';
import ProtectedRoutes from './ProtectedRoutes';
import { useCookies } from 'react-cookie';
import { useState ,useEffect} from 'react';
function Content(props) {
  console.log(props.userDetails)

  const userDetails = props.userDetails;
  const [title,setTitle] = useState("");

  return (
    <div className="appContainer">
      <Sidebar setLoggedIn={props.setLoggedIn} />
      <div className="content">
        <div className="header">
          <h2>{title}</h2>
          <div className='profile'>
          <p>{userDetails.name}</p>
          <IconButton>
            
            {userDetails?
              <img height={"40px"} style={{borderRadius:"20px"}} src={userDetails.picture}/>
:
            <AccountCircle sx={{ fontSize: 40, color: '#333' }} /> 
}
          </IconButton>
          </div>
     
        </div>
        <Routes>
        <Route path="" element={<Dashboard setTitle={setTitle} />} />
        <Route path="/Dashboard"  element={<Dashboard userDetails={userDetails}  setTitle={setTitle} />} />
        <Route element={<ProtectedRoutes  authorizedRole={'coe'} setTitle={setTitle}/>}>
          <Route path='createSemesterEvaluation' element={<COEpage setTitle={setTitle}/>}/>
          <Route path='semesterEvaluationReport' element={<ReportDownloadPage setTitle={setTitle}/>}/>
          <Route path="facultyAllocationRequests" element={<FacultyAllocationRequests setTitle={setTitle} />} />
          <Route path="facultyChangeRequests" element={<FacultyChangeRequests setTitle={setTitle} />} />
          </Route>
          <Route element={<ProtectedRoutes authorizedRole={'hod'} setTitle={setTitle}/>}>
          <Route path="facultyAllocation" element={<FacultyAllocation userDetails={userDetails} setTitle={setTitle} />} />
          </Route> 
          <Route element={<ProtectedRoutes authorizedRole={'faculty'} setTitle={setTitle}/>}>
          <Route path="facultyApproval" element={<FacultyApprovalPage setTitle={setTitle}/>} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default Content;
