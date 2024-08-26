import React, { useState,useEffect } from 'react';
import './Sidebar.css';
import { ExpandMore, ExpandLess, Menu, Dashboard, Logout, SchoolRounded, Receipt, ConfirmationNumber } from '@mui/icons-material';
import { School, Download, Assignment, SwapHoriz, People, Book } from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.png';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import apiHost from '../../../config/config';
const Sidebar = ({setLoading,setIsOpen}) => {
  const [open, setOpen] = useState({ COE: false, HOD: false, Faculty: false });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const [cookies,setCookie,removeCookie] = useCookies(['auth']);
  const navigate = useNavigate();
    const [role, setRole] = useState([]);
  const toggleDropdown = (key) => {
    setOpen(prevState => ({ ...prevState, [key]: !prevState[key] }));
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(prevState => !prevState);
  };

  const closeMobileMenu = () => {
    if (isMobileOpen) setIsMobileOpen(false);
    if(setIsOpen) setIsOpen(false);
  };


  useEffect(() => {
    const fetchRole = async () => {
        try {
            if(cookies.auth){
                const response = await axios.get(`${apiHost}/auth/role`, {
                    headers: {
                        auth: cookies.auth,
                    },
                });
                setRole(response.data.roles);
            }
            
        } catch (error) {
            console.error('Error fetching role:', error);
        }
    };

    fetchRole();
}, [cookies.auth]);

const deleteCookie = () => {
  return new Promise((resolve, reject) => {
    try {
      removeCookie('auth' ,{path:'/'});
      removeCookie('user',{path:'/'});
      resolve(); // Resolve the promise after removing the cookies
    } catch (error) {
      reject(error); // Reject the promise in case of an error
    }
  });
};
const handleLogout = ()=>{

  setLoading(true)

 const navigateLogin = ()=>{
  deleteCookie();
  navigate('/login')
 }
 const timeout = setTimeout(navigateLogin,1000);
}



  return (
    <>
    
      {/* <div className={`burgerIcon ${isMobileOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
        <Menu className={isMobileOpen ? 'whiteIcon' : ''} />
      </div> */}
      <div className={`sidebarContainer ${isMobileOpen ? 'open' : ''}`}>
      <Link to="dashboard" onClick={closeMobileMenu}>
        <div style={{ display: "flex", width: "100%",fontSize:"100px", justifyContent: "center", alignItems: "center" ,gap:'10px'}}>
         <SchoolRounded sx={{fontSize:"40px"}}/>
          <h6 className="sidebarTitle">Paper Allocation</h6>
        </div>
        </Link>
       
        <ul>
          { role.includes('coe') &&
 <li>
 <div className={`listItem ${open.COE ? 'active' : ''}`} onClick={() => toggleDropdown('COE')}>
   <School className="icon" />
   COE
   {open.COE ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
 </div>
 {open.COE && (
   <div className="submenuContainer">
     <ul>
     <Link to="dashboard" onClick={closeMobileMenu}>
         <div className="submenuItem"><Dashboard className="icon" /> Dashboard</div>
       </Link>
       <Link to="createsemcode" onClick={closeMobileMenu}>
         <div className="submenuItem"><Assignment className="icon" /> Create Evaluation</div>
       </Link>
       <Link to="report" onClick={closeMobileMenu}>
         <div className="submenuItem"><Download className="icon" /> Download Report</div>
       </Link>
       <Link to="allocationrequests" onClick={closeMobileMenu}>
         <div className="submenuItem"><People className="icon" /> Alloc Requests</div>
       </Link>
       <Link to="changerequests" onClick={closeMobileMenu}>
         <div className="submenuItem"><SwapHoriz className="icon" /> Change Requests</div>
       </Link>
       <Link to="foilcardentry" onClick={closeMobileMenu}>
         <div className="submenuItem"><ConfirmationNumber className='icon'/> Foil Card Entry</div>
       </Link>
     </ul>
   </div>
 )}
</li>
          }
         
      { role.includes('hod') &&
 <li>
 <div className={`listItem ${open.HOD ? 'active' : ''}`} onClick={() => toggleDropdown('HOD')}>
   <People className="icon" />
   HOD
   {open.HOD ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
 </div>
 {open.HOD && (
   <div className="submenuContainer">
     <ul>
     <Link to="dashboard" onClick={closeMobileMenu}>
         <div className="submenuItem"><Dashboard className="icon" /> Dashboard</div>
       </Link>
       <Link to="allocation" onClick={closeMobileMenu}>
         <div className="submenuItem"><Assignment className="icon" /> Allocation</div>
       </Link>
     
     
     </ul>
   </div>
 )}
</li>
      }  { role.includes('faculty') &&
          <li>
            <div className={`listItem ${open.Faculty ? 'active' : ''}`} onClick={() => toggleDropdown('Faculty')}>
              <Book className="icon" />
              Faculty
              {open.Faculty ? <ExpandLess className="dropdownIcon" /> : <ExpandMore className="dropdownIcon" />}
            </div>
            {open.Faculty && (
              <div className="submenuContainer">
                <ul>
                  <Link to="facultyapproval" onClick={closeMobileMenu}>
                    <div className="submenuItem"><Assignment className="icon" /> Paper Allocation</div>
                  </Link>
                </ul>
              </div>
            )}
          </li>}
          <li>
            <div onClick={handleLogout} className={`listItem`}>
              <div  style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <Logout/>
              Logout
              </div>
            
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
