import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { AppRoutes } from '../routes/AppRoutes';


function App() {
  const [cookies] = useCookies(['user']);
  const [userDetails, setUserDetails] = useState(null);
  const[title,setTitle] = useState("Title")
  useEffect(() => {
    if (cookies.user) {
      setUserDetails(decodeToken(cookies.user));
    }
  }, [cookies]);

  return (
    <Router>
      <AppRoutes userDetails={userDetails} />
    </Router>
  );
}

export default App;
