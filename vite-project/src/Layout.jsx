import React, { useEffect, useRef, useState } from "react";
import './Layout.css'
import Sidebar from './components/Sidebar.jsx'
import { Outlet } from "react-router-dom";
import { IconButton } from "@mui/material";
import { AccountCircle, MenuOutlined } from "@mui/icons-material";

function Layout({title,userDetails}){
    const[isOpen,setIsOpen] = useState(false)
   
    const handleBurgerClick = ()=>{
        
     setIsOpen(true)
     console.log(isOpen)
    }
    const sidebarRef = useRef();
    useEffect(()=>{
        const handler = (e)=>{
            if(!sidebarRef?.current?.contains(e.target)){
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown",handler)
    })
    return(
        <div className="layoutContainer">
            <div ref={sidebarRef} className={isOpen?"layoutSidebarOpen":"layoutSidebar"}>
            <Sidebar/>
            </div>
        <div className="layoutContent">
            <div className="layoutHeader">
                <div onClick={handleBurgerClick}  className="burgerMenu">
                <MenuOutlined />
                </div>
              
              <h2>{title}</h2>
              <div className="layoutProfile">

                <p>{userDetails?.name}</p>
                {}
                <div >
<IconButton className="icon">
    {
        userDetails?.picture?
        <img style={{borderRadius:"100px",height:"50px"}} src={userDetails?.picture}></img>:<AccountCircle sx={{fontSize:"50px"}} />
    }

</IconButton>
              

                </div>
          
              </div>
              
            </div>
            <div>
            <Outlet/>
            </div>
        </div>
        </div>
       
    )
}
export default  Layout;