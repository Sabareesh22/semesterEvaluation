import { InputLabel, TextField } from '@mui/material';
import './AddCourses.css'
import Select from 'react-select'
import { useEffect, useState } from 'react';
import axios from  'axios';
import apiHost from '../../../../../config/config'
import {useCookies} from 'react-cookie'
import Button from '../../../../components/button/Button'
import { Save } from '@mui/icons-material';
import {toast} from 'react-toastify';
const AddCourses  = ( {setIsAdding})=>{
   const [departments,setDepartments] = useState([]);
   const [semesters,setSemesters] = useState([]);
   const [regulations,setRegulations] = useState([]);
   const [cookies,setCookie] = useCookies(['auth']);
   const [newCourseData,setNewCourseData] =  useState({
      course_name : '',
      course_code :'',
      department:null,
      semester:null,
      regulation:null,
      status:'1'
   });

   const fetchDepartments = ( )=>{
      axios.get(`${apiHost}/departments`,{
         headers:{
            auth: cookies.auth
         }
      }).then((response)=>{
         setDepartments(response.data.map((dept)=>{
            return{
               value:dept.id,
               label:dept.department
            }
         }))
      })
   }

   const fetchSemesters = ( )=>{
      axios.get(`${apiHost}/semesters`,{
         headers:{
            auth: cookies.auth
         }
      }).then((response)=>{
         setSemesters(response.data.map((sem)=>{
            return{
               value:sem.id,
               label:sem.semester
            }
         }))
      })
   }

   const fetchRegulations = ( )=>{
      axios.get(`${apiHost}/regulations`,{
         headers:{
            auth: cookies.auth
         }
      }).then((response)=>{
         setRegulations(response.data.map((reg)=>{
            return{
               value:reg.id,
               label:reg.regulation
            }
         }))
      })
   }

  
   const handleCreateNewCourse = ()=>{
      if( newCourseData.course_code === '' ||
         newCourseData.course_name === '' ||
         newCourseData.department === null ||
         newCourseData.semester === null ||
         newCourseData.regulation === null){
            toast.error('Please fill all required fields');
            return;
         }
      
      try {
         axios.post(`${apiHost}/api/courses`,{
            course_name:newCourseData.course_name,
            course_code:newCourseData.course_code,
            department:newCourseData.department.value,
            semester:newCourseData.semester.value,
            regulation:newCourseData.regulation.value,
            status:newCourseData.status
         },{
            headers:{
               auth: cookies.auth
            }
         }).then((response)=>{
            toast.success('Course created successfully');
            setIsAdding(false);
           
         })
      } catch (error) {
         toast.error(error.message||'Error creating new course');
      }
   }

   useEffect(()=>{
      fetchDepartments();
      fetchSemesters();
      fetchRegulations();
   },[cookies.auth])

    return(
       <div className='addCoursesMasterContainer'>
            <div className='addCoursesFormContainer'>
               <div>
                <InputLabel>Course Name</InputLabel>
                <TextField
                value={newCourseData.course_name}
                size='small'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                    },
                  }}
                  placeholder='Course name'
                  onChange={(e)=>{
                     setNewCourseData((prev)=>{
                        const newPrev = {...prev };
                        newPrev.course_name = e.target.value;
                        return newPrev;
                     })
                  }}
                />
               </div>
               <div>
                <InputLabel>Course Code</InputLabel>
                <TextField
                value={newCourseData.course_code}
                size='small'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                    },
                  }}
                  placeholder='Course Code'
                  onChange={(e)=>{
                     setNewCourseData((prev)=>{
                        const newPrev = {...prev };
                        newPrev.course_code = e.target.value;
                        return newPrev;
                     })
                  }}
                />
               </div>
               <div>
                  <InputLabel>Department</InputLabel>
                  <Select
                  value={newCourseData.department}
                   menuPortalTarget={document.body} 
                   styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  options={departments} placeholder='Department'
                  onChange={
                     (selectedOption) => {
                        setNewCourseData((prev)=>{
                           const newPrev = {...prev };
                           newPrev.department = selectedOption;
                           return newPrev;
                        })
                     }
                  }
                  />
               </div>
               <div>
                  <InputLabel>Semester</InputLabel>
                  <Select 
                  value={newCourseData.semester}
                   menuPortalTarget={document.body} 
                   styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                   options={semesters}
                  placeholder='Semester'
                  onChange={
                     (selectedOption) => {
                        setNewCourseData((prev)=>{
                           const newPrev = {...prev };
                           newPrev.semester = selectedOption;
                           return newPrev;
                        })
                     }
                  }
                  />
               </div>
               <div>
                  <InputLabel>Regulation</InputLabel>
                  <Select 
                  value={newCourseData.regulation}
                   menuPortalTarget={document.body} 
                   styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                   options={regulations}
                  placeholder='Regulation'
                  onChange={
                     (selectedOption) => {
                        setNewCourseData((prev)=>{
                           const newPrev = {...prev };
                           newPrev.regulation = selectedOption;
                           return newPrev;
                        })
                     }
                  }
                  />
               </div>
               <div>
                  <Button onClick={()=>{handleCreateNewCourse()}} size={"small"} label={<div className='saveButtonForAddCourses'><Save/> Save</div>}/>
               </div>
            </div>
       </div>
    )
}
export default AddCourses;