import { InputLabel, TextField } from "@mui/material";
import "./AddFaculty.css";
import Select from "react-select";
import DatePicker from "../../../../components/datePicker/DatePicker";
import Button from "../../../../components/button/Button";
import { Add, Save } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import {toast} from 'react-toastify'
import dayjs from "dayjs";
const AddFaculty = ({ setIsAdding }) => {
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [addFacultyData, setAddFacultyData] = useState({
    name: "",
    faculty_id: "",
    department: 0,
    email:'',
    date_of_joining: null,
    experience_in_bit: null,
    total_teaching_experience: null,
    status:'1'
  });
  const emailBeforeRegex = /.*(?=@)/
    const emailAfterRegex = /(?<=@)[a-zA-z]/
  const fetchDepartmentOptions = () => {
    axios
      .get(`${apiHost}/departments`, {
        headers: { auth: cookies.auth },
      })
      .then((response) => {
        setDepartmentOptions(response.data.map((data)=>({value:data.id,label:data.department})));
      });
  };

  useEffect(() => {
    fetchDepartmentOptions();
  }, [cookies.auth]);

  const handleAddFaculty = () => {
    if (
      addFacultyData.name.trim() === "" ||
      addFacultyData.faculty_id.trim() === "" ||
      addFacultyData.department === null ||
      addFacultyData.date_of_joining === null 
    ){
      toast.error("All fields are required");
      return;
    }
    const modifiedAddFacultyData = {...addFacultyData}
    modifiedAddFacultyData.department = modifiedAddFacultyData.department.value;
    modifiedAddFacultyData.date_of_joining = dayjs(modifiedAddFacultyData.date_of_joining).format(`YYYYMMDD`)
    axios
     .post(`${apiHost}/api/faculty`, modifiedAddFacultyData, {
        headers: {
          auth: cookies.auth,
        },
      })
     .then((response) => {
        console.log(response.data);
        if(response.status===201){
          toast.success(response.data.message || "Faculty added successfully");
          setAddFacultyData({
            name: "",
            faculty_id: "",
            department: null,
            email:'',
            date_of_joining: null,
            experience_in_bit: null,
            total_teaching_experience: null,
            status:'1'
          });
        }
        setIsAdding(false);
      });
  }

  return (
    <div className="addFacultyInputMasterContainer">
      <h4>Add New Faculty</h4>
      <div className="addFacultyInputContainer">
        <div>
          <InputLabel>Name</InputLabel>
          <TextField
            value={addFacultyData.name}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
              },
            }}
            onChange={(e)=>{setAddFacultyData((prev)=>{
              const newPrev = {...prev };
              newPrev.name = e.target.value;
              return newPrev;
            })}}
            placeholder="Name"
            size="small"
          />
        </div>
        <div>
          <InputLabel>Reg No</InputLabel>
          <TextField
           onChange={(e)=>{setAddFacultyData((prev)=>{
            const newPrev = {...prev };
            newPrev.faculty_id = e.target.value;
            return newPrev;
          })}}
            value={addFacultyData.faculty_id}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
              },
            }}
            placeholder="Reg No"
            style={{ borderRadius: "5px" }}
            size="small"
          />
        </div>
        <div>
          <InputLabel>Email</InputLabel>
          <TextField
          type="email"
           onChange={(e)=>{setAddFacultyData((prev)=>{
            const newPrev = {...prev };
            let value = e.target.value;
            console.log(emailAfterRegex.exec(value))
            if(emailBeforeRegex.exec(value)?.length>0 && !emailAfterRegex.exec(value)?.length>0){
              value=value+'bitsathy.ac.in'
            }
            newPrev.email = value;
            return newPrev;
          })}}
            value={addFacultyData.email}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
              },
            }}
            placeholder="Email"
            style={{ borderRadius: "5px" }}
            size="small"
          />
        </div>
        <div>
          <InputLabel>Department</InputLabel>
          <Select
            value={addFacultyData.department}
            onChange={(selectedOption)=>{setAddFacultyData((prev)=>{
              const newPrev = {...prev };
              newPrev.department = selectedOption;
              return newPrev;
          
            })}}
            options={departmentOptions}
            placeholder="Department"
          />
        </div>
        <div>
          <InputLabel>Date of Joining</InputLabel>
          <DatePicker onChange={(date)=>{setAddFacultyData((prev)=>{
              const newPrev = {...prev };
              newPrev.date_of_joining = date;
              return newPrev;
            })}} value={addFacultyData.date_of_joining} size="small" />
        </div>
          <div>
            <InputLabel>Experience in BIT</InputLabel>
                    <TextField
            value={addFacultyData.experience_in_bit}
            InputProps={{ inputProps: { min: 0} }}
            onChange={(e)=>{setAddFacultyData((prev)=>{
              const newPrev = {...prev };
              newPrev.experience_in_bit = Number(e.target.value);
              return newPrev;
            })}}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
              },
            }}
            type="Number"
            placeholder="Exp in BIT"
            style={{ borderRadius: "5px" }}
            size="small"
                    />
          </div>
        <div>
          <InputLabel>Overall Experience</InputLabel>
          <TextField
          onChange={(e)=>{setAddFacultyData((prev)=>{
            const newPrev = {...prev };
            newPrev.total_teaching_experience = Number(e.target.value);
            return newPrev;
          })}}
          InputProps={{ inputProps: { min: 0} }}
          value={addFacultyData.total_teaching_experience}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
              },
            }}
            placeholder="Total Exp"
            style={{ borderRadius: "5px" }}
            size="small"
            type="Number"
          />
        </div>
        <Button
          key={"add"}
          size={"small"}
          label={
            <div onClick={()=>{handleAddFaculty()}} className="addFSaveButton">
              <Save /> Save
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AddFaculty;
