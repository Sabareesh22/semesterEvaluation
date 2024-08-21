import { Button, Input } from '@mui/material'
import './Login.css'
import { GoogleLogin } from '@react-oauth/google';
import LoginImage from '../assets/login.svg'
import {decodeToken} from 'react-jwt'
import { CookiesProvider, useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom';
import apiHost from '../../config/config';
import axios from 'axios';
const Login = ({setLoggedIn})=>{
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies([])

    const handleLogin = (response)=>{
        setCookie('user',response.credential)
        console.log(decodeToken(response.credential))
         axios.post(`${apiHost}/auth/login`,{email:decodeToken(response.credential).email}).then((res)=>{
            console.log(res.data)
            setCookie('auth',res.data);
            setLoggedIn(true);
        navigate('/semesterEvaluation');
        })
        
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