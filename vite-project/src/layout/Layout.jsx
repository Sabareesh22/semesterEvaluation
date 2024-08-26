import React, { useEffect, useRef, useState } from "react";
import './Layout.css';
import Sidebar from '../components/sidebar/Sidebar.jsx';
import { Outlet, useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { AccountCircle, Logout, MenuOutlined } from "@mui/icons-material";
import Loading from "../components/loading/Loading.jsx";
import { useCookies } from "react-cookie";

function Layout({ title, userDetails, loading, setLoading }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['auth']);
    const sidebarRef = useRef();
    const navigate = useNavigate();
    const profileIconRef = useRef();

    const handleBurgerClick = () => {
        setIsOpen(true);
    };

    useEffect(() => {
        const handler = (e) => {
            if (!sidebarRef?.current?.contains(e.target)) {
                setIsOpen(false);
            }
            if (!profileIconRef?.current?.contains(e.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
        };
    }, []);

    const deleteCookie = () => {
        return new Promise((resolve, reject) => {
            try {
                removeCookie('auth', { path: '/' });
                removeCookie('user', { path: '/' });
                resolve(); // Resolve the promise after removing the cookies
            } catch (error) {
                reject(error); // Reject the promise in case of an error
            }
        });
    };

    const handleLogout = () => {
        setLoading(true);

        const navigateLogin = () => {
            deleteCookie();
            navigate('/login');
        };
        setTimeout(navigateLogin, 1000);
    };

    return (
        <div className="layoutContainer">
            <div ref={sidebarRef} className={isOpen ? "layoutSidebarOpen" : "layoutSidebar"}>
                <Sidebar setIsOpen={setIsOpen} setLoading={setLoading} />
            </div>
            <div className="layoutContent">
                <div className="layoutHeader">
                    <div className="burgerAndTitle">
                    <div onClick={handleBurgerClick} className="burgerMenu">
                        <MenuOutlined />
                    </div>
                    <h2>{title}</h2>
                    </div>
                    
                    <div className="layoutProfile">
                        <div>
                            <IconButton disableRipple={true}  className="icon">
                                <div className={`profileMenu ${isProfileMenuOpen ? 'active' : 'inactive'}`}>
                                    <div className={`profileDetails ${isProfileMenuOpen ? 'active' : 'inactive'}`}>
                            
                                        
                                        {userDetails?.picture ? (
                                            <img onClick={() => { setIsProfileMenuOpen((prev) => (!prev)) }}
                                                style={{ borderRadius: "100px", height: "2.25rem" }}
                                                src={userDetails?.picture}
                                                alt="Profile"
                                            />
                                        ) : (
                                            <AccountCircle sx={{ fontSize: "50px" }} />
                                        )}
                                        <p>{userDetails?.name}</p>
                                    </div>
                                    <ul className={`profileOptions ${isProfileMenuOpen ? 'visible' : 'hidden'}`} ref={profileIconRef}>
                                        <li onClick={handleLogout}>Log Out <Logout /></li>
                                    </ul>
                                </div>
                            </IconButton>
                        </div>
                    </div>
                </div>
                <div>
                    {loading && <Loading />}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Layout;
