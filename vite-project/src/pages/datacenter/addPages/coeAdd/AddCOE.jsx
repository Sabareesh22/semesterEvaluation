import { InputLabel } from '@mui/material';
import './AddCOE.css';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import Button from '../../../../components/button/Button';
import { Save } from '@mui/icons-material';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import apiHost from '../../../../../config/config';
import { toast } from 'react-toastify';
const AddCOE  =  ({setIsAdding})=>{
    const [facultySuggestions,setFacultySuggestions] = useState([])
    const [cookies,setCookie] = useCookies(['auth']);
    const [newCOE,setNewCOE] = useState({
        faculty:null
    });
    const fetchFacultySuggestions = ()=>{
        try {
            axios.get(`${apiHost}/api/coeAddSuggestion`,{
                headers:{
                    auth:cookies.auth
                }
            }).then((response) => {
                setFacultySuggestions(response.data.map((faculty)=>{
                    return {
                        value:faculty.id,
                        label:faculty.faculty_id
                    }
                }))
            })
        } catch (error) {
            
        }
    }
    const handleAddCOE = ()=>{
        if(!newCOE.faculty){
            return toast.error('Please fill required field')
        }
        try {
            axios.post(`${apiHost}/api/coe`,{faculty:newCOE.faculty.value,status:'1'},{
                headers:{
                    auth:cookies.auth
                }
            }).then((response) => {
                toast.success('COE Added Successfully')
                setIsAdding(false);
            })
        } catch (error) {
            toast.error(error.message||'Unable to Add COE')
        }
    }
    useEffect(()=>{
        fetchFacultySuggestions();
    },[cookies.auth]);

    return(
        <div className="addCOEContainer">
            <div className='addCOEFormContainer'>
                <div>
                    <InputLabel>Faculty</InputLabel>
                    <Select
                    value={newCOE.faculty}
                    menuPortalTarget={document.body} 
                    onChange={(selectedOption)=>{
                        setNewCOE((prev)=>{
                            const newPrev = {...prev };
                            newPrev.faculty = selectedOption;
                            return newPrev;
                        })
                    }}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    placeholder='Faculty' options={facultySuggestions}/>
                </div>
                <div>
                <Button
        
          size={"small"}
          label={
            <div onClick={()=>{handleAddCOE()}} className="saveBoardCourseContainer">
              <Save  /> Save
            </div> 
          }  
        />
                </div>
            </div>
        </div>
    )
}

export default AddCOE;