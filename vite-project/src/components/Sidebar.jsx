import React, { useState } from 'react';
import './Sidebar.css';
import { ExpandMore, ExpandLess, Menu, Dashboard } from '@mui/icons-material';
import { School, Download, Assignment, SwapHoriz, People, Book } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';

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
        <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
          <img style={{ backgroundColor: "white", borderRadius: "10px" }} height={"80px"} width={"80px"} src={Logo} alt="Logo" />
          <h2 className="sidebarTitle">Paper Allocation</h2>
        </div>
       
        <ul>
          <li>
            <div className={`listItem ${open.COE ? 'active' : ''}`} onClick={() => toggleDropdown('COE')}>
              <School className="icon" />
              COE
              {open.COE ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.COE && (
              <div className="submenuContainer">
                <ul>
                  <Link to="/createSemesterEvaluation" onClick={closeMobileMenu}>
                    <div className="submenuItem"><Assignment className="icon" /> Create Evaluation</div>
                  </Link>
                  <Link to="/semesterEvaluationReport" onClick={closeMobileMenu}>
                    <div className="submenuItem"><Download className="icon" /> Download Report</div>
                  </Link>
                  <Link to="/facultyAllocationRequests" onClick={closeMobileMenu}>
                    <div className="submenuItem"><People className="icon" /> Alloc Requests</div>
                  </Link>
                  <Link to="/facultyChangeRequests" onClick={closeMobileMenu}>
                    <div className="submenuItem"><SwapHoriz className="icon" /> Change Requests</div>
                  </Link>
                </ul>
              </div>
            )}
          </li>
          <li>
            <div className={`listItem ${open.HOD ? 'active' : ''}`} onClick={() => toggleDropdown('HOD')}>
              <People className="icon" />
              HOD
              {open.HOD ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.HOD && (
              <div className="submenuContainer">
                <ul>
                <Link to="/facultyAllocationDashBoard" onClick={closeMobileMenu}>
                    <div className="submenuItem"><Dashboard className="icon" /> Dashboard</div>
                  </Link>
                  <Link to="/facultyAllocation" onClick={closeMobileMenu}>
                    <div className="submenuItem"><Assignment className="icon" /> Allocation</div>
                  </Link>
                
                
                </ul>
              </div>
            )}
          </li>
          <li>
            <div className={`listItem ${open.Faculty ? 'active' : ''}`} onClick={() => toggleDropdown('Faculty')}>
              <Book className="icon" />
              Faculty
              {open.Faculty ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.Faculty && (
              <div className="submenuContainer">
                <ul>
                  <Link to="/facultyApproval" onClick={closeMobileMenu}>
                    <div className="submenuItem"><Assignment className="icon" /> Paper Allocation</div>
                  </Link>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
