import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Content from './Content';
import PageNotFound from './pages/PageNotFound';
import Login from './pages/Login';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { decodeToken } from 'react-jwt';
function App() {
  const [cookies] = useCookies(['user']);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userDetails,setUserDetails]= useState(null);
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
          element={loggedIn ? <Navigate to='/semesterEvaluation' /> : <Login setLoggedIn={setLoggedIn} />}
        />
        <Route
          path='/semesterEvaluation/*'
          element={loggedIn ? <Content userDetails={userDetails} /> : <Navigate to='/login' />}
        />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
