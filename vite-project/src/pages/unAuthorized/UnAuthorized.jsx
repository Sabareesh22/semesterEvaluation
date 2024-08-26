import './UnAuthorized.css'
import unAuthorizedImage from '../../assets/Unauthorized.gif'
import { Button } from '@mui/material'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'

const UnAuthorized = (props)=>{
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
       navigate('/login')
    }
    const handleGoBack = ()=>{
      navigate(-1)
    }
  return(
    <div className="unAuthPageContainer">
        <div className='unAuthContainer'>
        <img src={unAuthorizedImage}></img>
        <div className='unAuthText'>
        <h2> UnAuthorized Access </h2>
        <p>Do you have an Authorized Account Try Login In Using that</p>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:"20px"}}>
        <Button variant="contained" sx={{backgroundColor:"white",color:"black", ':hover': {
      bgcolor: 'darkblue', // theme.palette.primary.main
      color: 'white',
    }}} onClick={handleGoBack}>Go Back</Button>
        <Button variant="contained" sx={{backgroundColor:"blue"}} onClick={handleRedirectLogin}>Login</Button>
        </div>
        
        </div>
       
    </div>
  )
}

export default UnAuthorized