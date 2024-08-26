import './Button.css'
import { useEffect, useState } from 'react';
const Button = ({label,onClick,styles,size})=>{
    const [buttonStyles,setButtonStyles] = useState(styles);
    const setHeight = (height)=>{
        setButtonStyles((prev)=>{
            const newPrev = {...prev,height:height};
            console.log(newPrev)
            return(newPrev)
        }
    )
    }
 useEffect(()=>{
    if(size=="small"){
         setHeight("2.7rem");
    }
 },[])
   

    return(
        <button style={buttonStyles} onClick={onClick} className="button">
            {label}
            </button>
    )
}
export default Button;