import React, { useState } from 'react';
import './Sidebar.css';
import { ExpandMore, ExpandLess, Menu } from '@mui/icons-material';
import { School, Assignment, SwapHoriz, People, Book } from '@mui/icons-material';

const Sidebar = () => {
  const [open, setOpen] = useState({ COE: false, HOD: false, Faculty: false });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleDropdown = (key) => {
    setOpen(prevState => ({ ...prevState, [key]: !prevState[key] }));
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(prevState => !prevState);
  };

  return (
    <>
      <div className="burgerIcon" onClick={toggleMobileMenu}>
        <Menu />
      </div>
      <div className={`sidebarContainer ${isMobileOpen ? 'open' : ''}`}>
        <h2 className="sidebarTitle">Semester Allocation</h2> {/* Add this line for the title */}
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
                <li><Assignment className="icon" /> Create Semester Evaluation</li>
                <li><People className="icon" /> Faculty Allocation Requests</li>
                <li><SwapHoriz className="icon" /> Faculty Change Requests</li>
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
                <li><Assignment className="icon" /> Faculty Allocation</li>
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
                <li><Assignment className="icon" /> Semester Paper Allocation</li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
