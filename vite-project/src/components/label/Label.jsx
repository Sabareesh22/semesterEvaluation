import { Cancel, ChangeCircle, Refresh } from '@mui/icons-material';
import './Label.css';


const Label = ({content,backgroundColor,isClosable,onClose,isReplacable,onReplace})=>{
   
    return(
       <div style={{backgroundColor:backgroundColor}} className="labelContainer">
            {content}
           { isClosable && <div className='closeIcon'>
            <Cancel onClick={onClose}/>
            </div>}
            { isReplacable && 
                <div className='closeIcon'>
            <ChangeCircle onClick={onReplace}/>
            </div>
            }
       </div>
    )
}

export default Label;