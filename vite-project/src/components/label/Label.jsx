import { Cancel } from '@mui/icons-material';
import './Label.css';


const Label = ({content,backgroundColor,isClosable,onClose})=>{
   
    return(
       <div style={{backgroundColor:backgroundColor}} className="labelContainer">
            {content}
           { isClosable && <div className='closeIcon'>
            <Cancel onClick={onClose}/>
            </div>}
       </div>
    )
}

export default Label;