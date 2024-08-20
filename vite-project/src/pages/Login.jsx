import { Button, Input } from '@mui/material'
import './Login.css'
import { GoogleLogin } from '@react-oauth/google';
import LoginImage from '../assets/login.svg'
import {decodeToken} from 'react-jwt'
import { CookiesProvider, useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom';

const Login = ({setLoggedIn})=>{
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['user'])

    const handleLogin = (response)=>{
        setCookie('user',response.credential)
        console.log(decodeToken(response.credential))
        setLoggedIn(true);
        navigate('/semesterEvaluation');
    }
    return(
        <div className='loginPageContainer'>
            <div className='loginContainer'>
                    <h1>Login</h1>
                    <img height={"100%"} width={"100%"}src={LoginImage} />
                    <GoogleLogin onSuccess={handleLogin}/>
                    
            </div>
        </div>
    )
}
export default Login