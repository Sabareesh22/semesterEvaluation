import { Cancel } from '@mui/icons-material';
import './Label.css';


const Label = ({content,backgroundColor,isClosable})=>{
   
    return(
       <div style={{backgroundColor:backgroundColor}} className="labelContainer">
            {content}
           { isClosable && <div className='closeIcon'>
            <Cancel/>
            </div>}
       </div>
    )
}

export default Label;