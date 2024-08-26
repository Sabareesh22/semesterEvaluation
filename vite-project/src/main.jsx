import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId='930277363430-nain1j7a9fmvk8uecmer1p5jgs5jt4bm.apps.googleusercontent.com'>
  
  <StrictMode>

    <App />
    
  </StrictMode>,
</GoogleOAuthProvider>

)
