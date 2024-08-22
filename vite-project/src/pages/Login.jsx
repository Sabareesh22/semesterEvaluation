import { Button, Input } from '@mui/material'
import './Login.css'
import { GoogleLogin } from '@react-oauth/google';
import LoginImage from '../assets/Login.png'
import {decodeToken} from 'react-jwt'
import { CookiesProvider, useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom';
import apiHost from '../../config/config';
import axios from 'axios';
import { useEffect } from 'react';
const Login = ()=>{
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['user','auth'])

 
    const handleLogin = (response)=>{
        setCookie('user',response.credential,{path:'/'})
        console.log(decodeToken(response.credential))
        const email =decodeToken(response.credential).email;
         axios.post(`${apiHost}/auth/login`,{email:email}).then((res)=>{
            console.log(res.data)
            setCookie('auth',res.data,{path:'/'});
            navigate('/paperallocation/dashboard');
        })
        
    }
    return(
        <div className='loginPageContainer'>
            <div className='loginContainer'>
                    <h1>Login</h1>
                    <img className='loginImage' src={LoginImage} />
                    <GoogleLogin  
                    type='standard'
                    theme='filled_blue'
             size='large'
             width={"250"}
             
     onSuccess={handleLogin}/>
                    
            </div>
        </div>
    )
}
export default Login