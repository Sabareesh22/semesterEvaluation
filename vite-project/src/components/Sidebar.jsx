import React, { useState } from 'react';
import './Sidebar.css';
import { ExpandMore, ExpandLess, Menu } from '@mui/icons-material';
import { School,Download, Assignment, SwapHoriz, People, Book } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png'
const Sidebar = () => {
  const [open, setOpen] = useState({ COE: false, HOD: false, Faculty: false });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleDropdown = (key) => {
    setOpen(prevState => ({ ...prevState, [key]: !prevState[key] }));
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(prevState => !prevState);
  };

  const closeMobileMenu = () => {
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      <div className={`burgerIcon ${isMobileOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
        <Menu className={isMobileOpen ? 'whiteIcon' : ''} />
      </div>
      <div className={`sidebarContainer ${isMobileOpen ? 'open' : ''}`}>
        <div style={{display:"flex",width:"100%",justifyContent:"center",alignItems:"center"}}>
        <img style={{backgroundColor:"white",borderRadius:"10px"}} height={"80px"} width={"80px"} src={Logo}></img>
        <h2 className="sidebarTitle">Paper Allocation</h2>
        </div>
       
        <ul>
          <li>
            <div
              className={`listItem ${open.COE ? 'active' : ''}`}
              onClick={() => toggleDropdown('COE')}
            >
              <School className="icon" />
              COE
              {open.COE ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.COE && (
              <ul>
                <li><Link to="/createSemesterEvaluation" onClick={closeMobileMenu}><Assignment className="icon" /> Create Evaluation</Link></li>
                <li><Link to="/semesterEvaluationReport" onClick={closeMobileMenu}><Download className="icon" /> Download Report</Link></li>
                <li><Link to="/facultyAllocationRequests" onClick={closeMobileMenu}><People className="icon" /> Alloc Requests</Link></li>
                <li><Link to="/facultyChangeRequests" onClick={closeMobileMenu}><SwapHoriz className="icon" /> Change Requests</Link></li>
              </ul>
            )}
          </li>
          <li>
            <div
              className={`listItem ${open.HOD ? 'active' : ''}`}
              onClick={() => toggleDropdown('HOD')}
            >
              <People className="icon" />
              HOD
              {open.HOD ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.HOD && (
              <ul>
                <li><Link to="/facultyAllocation" onClick={closeMobileMenu}><Assignment className="icon" /> Allocation</Link></li>
              </ul>
            )}
          </li>
          <li>
            <div
              className={`listItem ${open.Faculty ? 'active' : ''}`}
              onClick={() => toggleDropdown('Faculty')}
            >
              <Book className="icon" />
              Faculty
              {open.Faculty ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.Faculty && (
              <ul>
                <li><Link to="/facultyApproval" onClick={closeMobileMenu}><Assignment className="icon" /> Paper Allocation</Link></li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
