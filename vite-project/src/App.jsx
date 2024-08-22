import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Content from './Content';
import PageNotFound from './pages/PageNotFound';
import Login from './pages/Login';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { decodeToken } from 'react-jwt';
import ProtectedRoutes from './ProtectedRoutes';
import axios from 'axios';
import apiHost from '../config/config';
import UnAuthorized from './pages/UnAuthorized';
function App() {
  const [cookies] = useCookies(['user']);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role,setRole] = useState('');
  const [userDetails,setUserDetails]= useState(null);
  const [loginRedirect,setLoginRedirect] = useState('/');
  useEffect(() => {
    if (cookies.user) {
      setUserDetails(decodeToken(cookies.user))
      setLoggedIn(true);
    }
  }, [cookies]);


  return (
    <Router>
      <Routes>
        <Route
          path='/login'
          element={loggedIn  ? <Navigate to={'/semesterEvaluation'} /> : <Login setLoggedIn={setLoggedIn} />}
        />
   
        <Route
        path='/semesterEvaluation/*'
        element={loggedIn ? <Content setLoggedIn = {setLoggedIn} userDetails={userDetails} /> : <Navigate to='/login' />}
      />

        <Route path='/unAuthorized' element={loggedIn?<UnAuthorized/>:<Navigate to='/login' />}/>
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
