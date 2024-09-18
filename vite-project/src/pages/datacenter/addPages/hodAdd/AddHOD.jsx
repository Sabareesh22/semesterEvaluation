import { InputLabel } from "@mui/material";
import "./AddHOD.css";
import Select from "react-select";
import { Save } from "@mui/icons-material";
import Button from "../../../../components/button/Button";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { toast } from "react-toastify";
const AddHOD = ({setIsAdding}) => {
    const [facultyOptions ,setFacultyOptions] = useState([]);
    const [departmentOptions ,setDepartmentOptions] = useState([]);
    const [cookies,setCookie] = useCookies(['auth']);
    const [newHod,setNewHod] = useState({
        department : null,
        faculty:null
    })

    const fetchFacultyOptions = ()=>{
       try {
         axios.get(`${apiHost}/api/faculty`,{
            params:{
              department : newHod.department.value
            },
             headers:{
                 auth:cookies.auth
             }
         }).then((response)=>{
            console.log(response.data)
             setFacultyOptions(response.data.map((data)=>{
                 return {
                     value:data.id,
                     label:data.faculty_id
                 }
             }))
         })
       } catch (error) {
        
       }
    }

    const handleAddHOD = ()=>{
        try {
            axios.post(`${apiHost}/api/hod`,{
                department: newHod.department.value,
                faculty: newHod.faculty.value,
                status:'1'
            },{
                headers:{
                    auth:cookies.auth
                }
            }).then((response)=>{
                toast.success('HOD Added Successfully')
                setNewHod({
                    department : null,
                    faculty:null
                })
                setIsAdding(false);
            })
            
        } catch (error) {
            toast.error(error.message || 'Error creating new HOD')
        }
    }

    const fetchDepartmentOptions  = () =>{
        try {
            axios.get(`${apiHost}/api/hodDeptsFree`,{
                headers:{
                    auth:cookies.auth
                }
            }).then((response)=>{
                setDepartmentOptions(response.data.map((data)=>{
                    return {
                        value:data.id,
                        label:data.department
                    }
                }))
            })
        } catch (error) {
            
        }
    }

    useEffect(()=>{
        fetchFacultyOptions();
    },[newHod.department])

    useEffect(()=>{
      
      fetchDepartmentOptions();

    },[cookies.auth])
  return (
    <div className="addHODMasterContainer">
      <div className="addHODFormContainer">
        
        <div>
          <InputLabel>Department</InputLabel>
          <Select 
          value={newHod.department}
           menuPortalTarget={document.body} 
           onChange={
            (selectedOption) => {
                setNewHod((prev)=>{
                    const newPrev = {...prev };
                    newPrev.department = selectedOption;
                    return newPrev;
                })
            }
           }
           styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          options={departmentOptions} placeholder="Department" />
        </div>
        <div>
          <InputLabel>Faculty</InputLabel>
          <Select
          isDisabled={!newHod.department}
          value={newHod.faculty}
          onChange={
            (selectedOption) => {
                setNewHod((prev)=>{
                    const newPrev = {...prev };
                    newPrev.faculty = selectedOption;
                    return newPrev;
                })
            }
          }
           menuPortalTarget={document.body} 
           styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          options={facultyOptions} placeholder="Faculty" />
        </div>
        <div>
          <Button
            onClick={()=>{
                handleAddHOD();
            }}
            key={"add"}
            size={"small"}
            label={
              <div  className="addFSaveButton"> 
                <Save /> Save
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AddHOD;
