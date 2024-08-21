import './UnAuthorized.css'
import unAuthorizedImage from '../assets/unAuthorized.svg'
import { Button } from '@mui/material'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'
const UnAuthorized = ()=>{
    const[cookies,setCookie,removeCookie] = useCookies(['auth']);
    const navigate = useNavigate();
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
    const handleRedirectLogin = async()=>{
       await deleteCookie();
       window.location.reload();
    }
  return(
    <div className="unAuthPageContainer">
        <div className='unAuthContainer'>
        <img src={unAuthorizedImage}></img>
        <p> UnAuthorized Access </p>
        <p>Do you have an Authorized Account Try Login In Using that</p>
        <Button variant="contained" sx={{backgroundColor:"blue"}} onClick={handleRedirectLogin}>Login</Button>
        </div>
       
    </div>
  )
}

export default UnAuthorized