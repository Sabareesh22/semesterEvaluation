import React, { useState } from 'react';
import './Sidebar.css';
import { ExpandMore, ExpandLess, Menu } from '@mui/icons-material';
import { School, Assignment, SwapHoriz, People, Book } from '@mui/icons-material';
import { Link } from 'react-router-dom';

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
        <Menu className={isMobileOpen ? 'whiteIcon' : ''} /> {/* Add whiteIcon class when open */}
      </div>
      <div className={`sidebarContainer ${isMobileOpen ? 'open' : ''}`}>
        <h2 className="sidebarTitle">Semester Allocation</h2>
        <ul>
          <li>
            <div
              className={`listItem ${open.COE ? 'active' : ''}`}
              onClick={() => toggleDropdown('COE')}
            >
              <School className="icon" />
              COE Portal
              {open.COE ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.COE && (
              <ul>
                <li><Link to="/createSemesterEvaluation" onClick={closeMobileMenu}><Assignment className="icon" /> Create Semester Evaluation</Link></li>
                <li><Link to="/facultyAllocationRequests" onClick={closeMobileMenu}><People className="icon" /> Faculty Allocation Requests</Link></li>
                <li><Link to="/facultyChangeRequests" onClick={closeMobileMenu}><SwapHoriz className="icon" /> Faculty Change Requests</Link></li>
              </ul>
            )}
          </li>
          <li>
            <div
              className={`listItem ${open.HOD ? 'active' : ''}`}
              onClick={() => toggleDropdown('HOD')}
            >
              <People className="icon" />
              HOD Portal
              {open.HOD ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.HOD && (
              <ul>
                <li><Link to="/facultyAllocation" onClick={closeMobileMenu}><Assignment className="icon" /> Faculty Allocation</Link></li>
              </ul>
            )}
          </li>
          <li>
            <div
              className={`listItem ${open.Faculty ? 'active' : ''}`}
              onClick={() => toggleDropdown('Faculty')}
            >
              <Book className="icon" />
              Faculty Portal
              {open.Faculty ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.Faculty && (
              <ul>
                <li><Link to="/facultyApproval" onClick={closeMobileMenu}><Assignment className="icon" /> Semester Paper Allocation</Link></li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
