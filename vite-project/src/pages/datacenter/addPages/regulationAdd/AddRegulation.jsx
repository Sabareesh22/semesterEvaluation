import { InputLabel } from "@mui/material";
import "./AddRegulation.css";
import DatePickerWithRange from "../../../../components/datePicker/DatePicker";
import { Save } from "@mui/icons-material";
import Button from "../../../../components/button/Button";
import { useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import apiHost from "../../../../../config/config";
import { useCookies } from "react-cookie";

const AddRegulation = ({setIsAdding}) => {
    const [newRegulation,setNewRegulation] = useState({
        regulation:'',
        status:'1'
    })

    const [cookies,setCookie] = useCookies(['auth'])

    const addNewRegulation  = ()=>{
      if(newRegulation.regulation === ''){
         return toast.error('Invalid Regulation');
      }
        try {
            axios.post(`${apiHost}/api/regulation`,newRegulation,{
                headers:{
                    auth:cookies.auth
                }
            }).then((response)=>{
                toast.success(response.data.message || 'New Regulation Added Successfully');
                setNewRegulation({
                    regulation:'',
                    status:'1'
                })
                setIsAdding(false);
            }
            ).catch((response)=>{
              
                toast.error(response.response.data.message || 'Error while adding new Regulation');
              
            })
        } catch (error) {
            toast.error(error.message || 'Error while adding new Regulation');
        } 
    }

  return (
    <div className="AddRegulationMasterContainer">
      <div className="AddRegulationFormContainer">
        <div>
          <InputLabel>Year</InputLabel>
          <DatePickerWithRange onChange={(date)=>{
            setNewRegulation((prev)=>{
                const newPrev = {...prev };
                newPrev.regulation = date.year().toString();
                return newPrev;
            })
          }} value={dayjs(newRegulation.regulation)} size={"small"} views={["year"]} />
        </div>
        <div>
          <Button
          onClick={()=>{
            addNewRegulation();
          }}
            key={"add"}
            size={"small"}
            label={
              <div
                
                className="addFSaveButton"
              >
                <Save /> Save
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};


export default AddRegulation;