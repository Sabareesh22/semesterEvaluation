import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  TablePagination,
  TextField,
} from '@mui/material';
import { Modal, Box } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';
import axios, { toFormData } from 'axios';
import apiHost from '../../config/config';
import * as XLSX from 'xlsx';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Pagination from '@mui/material/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCookies } from 'react-cookie';
import NoData from '../components/NoData';
const FacultyAllocationTable = ({ departmentId,selectedSemesterCode, courses }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [allocations, setAllocations] = useState({});
  const [paperCounts, setPaperCounts] = useState({});
  const [cookies,setCookie] = useCookies(['auth'])
  const [statuses, setStatuses] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [suggestedFaculties, setSuggestedFaculties] = useState([]); // New state for storing suggested faculties
  const [oldFaculty, setOldFaculty] = useState(null);
const [selectedFaculty, setSelectedFaculty] = useState(null);
const [selectedReason, setSelectedReason] = useState('');
const [facultyStatuses, setFacultyStatuses] = useState({});
const [currentRow, setCurrentRow] = useState(null); // To track which row is being edited
const [bcCe,setBcCe] =  useState([])
const [selectedBcCe,setSelectedBcCe] = useState([])
useEffect(()=>{
 console.log(suggestedFaculties)
},[suggestedFaculties])

const fetchBeCe = async()=>{
  try {
    // Fetch the faculty roles (HOD and Chief Examiners) from the API
    const response = await axios.get(`${apiHost}/api/bc_ce`, {
      params: {
        semcode: selectedSemesterCode.value,
        department: departmentId.value,
      },
      headers:{
        Auth: cookies.auth
     }
    });

    // Handle the response data
    const facultyRoles = response.data.map((data)=>({value:data.chairman_faculty_id,
      label:data.chairman_name,role:data.role
      }));
    console.log('Faculty Roles:', facultyRoles);
setBcCe(facultyRoles)
    // You can set the data to your state or use it as needed
    // setFacultyRoles(facultyRoles);
} catch (error) {
    console.error('Error fetching faculty roles:', error);
    // Handle any errors appropriately, e.g., show an error message
}
}
useEffect(()=>{

if(!departmentId || !selectedSemesterCode){
  
}
else{
  fetchBeCe();

}

},[departmentId,selectedSemesterCode])

const handleOpenModal = async (facultyId, courseId,faculties) => {
 
  setOldFaculty(facultyId); // Store the old faculty
  setCurrentRow({ facultyId, courseId });
  try {
    //  setSuggestedFaculties([]);
    // Fetch suggested faculties from the API
    const response = await axios.get(`${apiHost}/api/facultyReplaceSuggest`, {
      params: {
        courseId: courseId,
        semcode: selectedSemesterCode.value,
        facultyId: facultyId,
      } , headers:{
                    Auth: cookies.auth
                 }   });
   
    // Set the fetched faculties as options in the select
    setSuggestedFaculties(response?.data?.results?.map(fac => ({ value: fac.id, label: fac.name })));

    const otherFaculties = faculties
      .filter(fac => fac.facultyId != facultyId)
      .map(fac => ({ value: fac.facultyId, label: fac.facultyName,notEligible:fac.notEligible }));
    
    console.log("Others:", otherFaculties);
    
    setSuggestedFaculties((prev) => {
      // Check if prev is iterable and not null/undefined
      if (Array.isArray(prev)) {
        const filteredPrev = prev.filter(item => 
          !otherFaculties.some(other => 
            item.value == other.value
          )
        );
        return [...filteredPrev, ...otherFaculties.filter((fac) => !fac.notEligible)];
      }
      // If prev is not iterable, return only otherFaculties
      return [...otherFaculties.filter((fac) => !fac.notEligible)];
    });
    
  
  } catch (error) {
    // console.log("Faculties",faculties)
    toast.error('Error fetching suggested faculties: ' + (error.response?.data?.message || 'Unknown error'));
  }
  
  setOpenModal(true);
};

const handleCloseModal = () => {
  setOpenModal(false);
  setSelectedFaculty(null);
  setSelectedReason('');
};
const handleSubmit = async () => {
  try {
    const response = await axios.post(`${apiHost}/api/facultyChangeRequests`, {
      old_faculty:  currentRow.facultyId,
      new_faculty:selectedFaculty, // Assuming old_faculty is the currently selected faculty in the row
      course: currentRow.courseId,
      semcode: selectedSemesterCode.value,
      remark: selectedReason, // Include the reason as the remark
    },{headers:{
      Auth: cookies.auth
   } });
    fetchFacultyStatuses();
    toast.success('Faculty change request submitted successfully.');
    handleCloseModal();
  } catch (error) {
    toast.error('Error submitting faculty change request: ' + (error.response?.data?.message || 'Unknown error'));
  }
};
const fetchPaperCounts = async () => {
  const newPaperCounts = {};
  const newStatuses = {};
  const newAllocations = { ...allocations }; // Create a copy of allocations to update it
  const newSelectedBcCe = {...selectedBcCe};
  if (courses.length > 0) {
    for (const course of courses) {
      const { courseId, faculties } = course;

      for (const faculty of faculties) {
       
        try {
          const response = await axios.get(`${apiHost}/api/paperCount`, {
            params: {
              course: courseId,
              faculty: faculty.facultyId,
              semcode: selectedSemesterCode.value,
            },headers:{
              Auth: cookies.auth
           } 
          });

          const paperCount = response.data.results.paper_count;
          const status = response.data.results.status;
          const bc_ce  = parseInt(response.data.results.handlingFaculty);
          newSelectedBcCe[`${`${courseId}-${faculty.facultyId}`}`] = bcCe.find((data)=>(data.value==bc_ce));
          // Update paper counts and statuses
          console.log(bcCe.find((data)=>(data.value==bc_ce)))
          newPaperCounts[`${courseId}-${faculty.facultyId}`] = paperCount;
          newStatuses[`${courseId}-${faculty.facultyId}`] = status;
          if(faculty.facultyName=="External"){
            newAllocations[courseId][faculty.facultyId] = parseInt(course.externalCount);
          }
          // If the allocation already exists, retain it; otherwise, initialize it with the paper count
          if (!newAllocations[courseId]) {
            newAllocations[courseId] = {};
          }
          newAllocations[courseId][faculty.facultyId] = newAllocations[courseId][faculty.facultyId] || paperCount;
          
        } catch (error) {
          console.error('Error fetching paper count:', error);
        }
      }
    }
  }
  setSelectedBcCe(newSelectedBcCe);
  setPaperCounts(newPaperCounts); // Update state with paper counts
  setStatuses(newStatuses); // Update state with statuses
  setAllocations(newAllocations); // Update state with allocations
};

const fetchFacultyStatuses = async () => {
  const newStatuses = {};

  if (courses.length > 0) {
    for (const course of courses) {
      for (const faculty of course.faculties) {
        try {
          const response = await axios.get(`${apiHost}/api/check-old-faculty`, {
            params: {
              old_faculty: faculty.facultyId,
              course:course.courseId,
              semcode: selectedSemesterCode.value,
            },headers:{
              Auth: cookies.auth
           } 
          });

          newStatuses[`${`${course.courseId}-${faculty.facultyId}`}`] = response.data.code;

        } catch (error) {
          console.error('Error fetching faculty status:', error);
          toast.error('Error fetching faculty status.');
        }
      }
    }
  }

  setFacultyStatuses(newStatuses); // Update state with fetched statuses
};
useEffect(() => {
  
  fetchFacultyStatuses();
  fetchPaperCounts();
}, [selectedSemesterCode, courses,bcCe]);



const handleInputChange = (event, courseName, facultyId, facultyName, courseId,time) => {
  
  const value = parseInt(event.target.value) || 0; // Allow negative values for direct input
  const courseAllocations = allocations[courseId] || {};
  let facultyCount = courses[currentPage].faculties.length;
 
  // Ensure the value is in multiples of 25
  let allocationValue = Math.ceil(value / 25) * 25;
  if (allocationValue - value === 1) {
    allocationValue = Math.max(Math.floor(value / 25) * 25, 0);
  }
  // Create a copy of the current allocations to modify
  let newAllocations = { ...courseAllocations };

  // Update allocation for the selected faculty
 
    newAllocations[facultyId] = allocationValue;
  


  // Recalculate allocations for all except the last faculty
  let sumAllocations = 0;
  if(courses[currentPage].faculties[facultyCount - 1].facultyName=="External"){
    facultyCount--;
  }
  for (let i = 0; i < facultyCount - 1; i++) {
    const currentFacultyId = courses[currentPage].faculties[i].facultyId;
    console.log(newAllocations[currentFacultyId])
    sumAllocations += newAllocations[currentFacultyId] || 0;
  }
  console.log(sumAllocations)

  // Calculate remaining papers for the last faculty
  let remainingPapers = courses[currentPage].paperCount - sumAllocations-courses[currentPage].externalCount;
  let lastFacultyId = courses[currentPage].faculties[facultyCount - 1].facultyId;

  // Check if the total allocation exceeds the paper count
  if (remainingPapers < 0 ) {
    toast.error("Total allocation exceeds the paper count.");
    return;
  }
  console.log(courses[currentPage].faculties[facultyCount - 1].facultyName=="External")
  if((courses[currentPage].faculties[facultyCount - 1].facultyName=="External")){
    lastFacultyId = courses[currentPage].faculties[facultyCount - 2].facultyId;
  }
  newAllocations[lastFacultyId] = Math.max(0, remainingPapers); // Ensure it's non-negative

  // Update last faculty's allocation based on remaining papers

  // Update the state with the new allocations
  setAllocations(prev => ({
    ...prev,
    [courseId]: newAllocations,
  }));
};
  const handleAllocate = async (courseId, facultyId, paperCount, AllocationSum,time) => {
    const allocationValue = allocations[courseId]?.[facultyId];
    console.log(allocationValue)
    if(roundToHalfOrCeiling(allocationValue/50)>time){
      toast.error(`The Allocation of days per faculty does not exceed ${time} days`);
      return;
    }
    if(!selectedBcCe[`${`${courseId}-${facultyId}`}`]){
      toast.error(`Please Select BC/CE for All`);
      return;
    }
    if (allocationValue > 0) {
      try {
        console.log(selectedBcCe[`${`${courseId}-${facultyId}`}`])
        const response = await axios.post(`${apiHost}/api/allocateFaculty`, [{
          facultyId,
          courseId,
          departmentId:departmentId.value,
          paperCount: allocationValue,
          semCode: selectedSemesterCode.value,
          handledBy:selectedBcCe[`${`${courseId}-${facultyId}`}`].value,
          handlingFacultyRole:selectedBcCe[`${`${courseId}-${facultyId}`}`].role,
          time:time
        }],{headers:{
          Auth: cookies.auth
       } });
        fetchPaperCounts()
        toast.success(response.data.message || 'Faculty allocated successfully.');
      } catch (error) {
        toast.error('Error allocating faculty: ' + (error.response?.data?.message || 'Unknown error'));
      }
    } else {
      if (AllocationSum === paperCount) {
        // Logic for when allocation matches paper count can be added here
      } else {
        toast.error('Allocation value must be greater than zero.');
      }
    }
  };

  const handleAllocateAll = async (courseId, faculties, paperCount,time) => {
    let AllocationSum = 0;
    let exceedsLimit = false;
    try {
      Object.values(allocations[courseId]).forEach(v => {
        if(v==0){

          toast.error("All Faculties must be assigned paper")
          AllocationSum = -100000;
        }
        if(roundToHalfOrCeiling(v/50)>time){
          exceedsLimit = true;
          toast.error(`The Allocation of days per faculty must not exceed ${time} days`);
          return;
        }
        AllocationSum += v;
      });
      console.log(AllocationSum)
    }
     catch (error) {
      toast.error('Please Allocate Something');
    }
    if(exceedsLimit){
      return;
    }
    if (AllocationSum !== paperCount) {
      toast.error('Error allocating  faculties. Count doesnt match total count');
      return;
    }
    try {
      for (const faculty of faculties) {
        if(faculty.facultyName!="External"){
          await handleAllocate(courseId, faculty.facultyId, paperCount, AllocationSum,time);
        }
      }
    } catch (error) {
      if (AllocationSum === paperCount) {
        // Logic for successful allocation
      } else {
        toast.error('Error allocating all faculties.');
      }
    }
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage); // Update to the new page
  };
  function roundToHalfOrCeiling(value) {
    const roundedValue = Math.round(value * 2) / 2;
    return roundedValue < value ? roundedValue + 0.5 : roundedValue;
}
  const currentCourse = courses[currentPage];
  
  return (
    <div>
      <TableContainer
      
        style={{ marginTop: '20px', width: '100%', marginLeft: 'auto', marginRight: 'auto', padding: '10px' }}
      >
        <Table style={{ borderCollapse: 'collapse' }}>
          <TableHead sx={{ color: "white", fontWeight: "bold" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" rowSpan={2} style={{ border: '1px solid black' }}>Course</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" rowSpan={2} style={{ border: '1px solid black' }}>Paper Count</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" rowSpan={2} style={{ border: '1px solid black' }}>Time</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Faculty</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Allocation</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Time</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>BC/CE</TableCell>
              <TableCell colSpan={2} sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}> Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {courses.slice(currentPage, currentPage + 1).map((course) => (
    course.faculties.map((faculty, i) => (
      <TableRow key={`${course.courseId}-${faculty.facultyId}`}>
        {i === 0 && (
          <>
            <TableCell rowSpan={course.faculties.length} align="center" style={{ border: '1px solid black' }}>
              {course.courseName}
            </TableCell>
            <TableCell rowSpan={course.faculties.length} align="center" style={{ border: '1px solid black' }}>
              {course.paperCount}
            </TableCell>
            <TableCell rowSpan={course.faculties.length} align="center" style={{ border: '1px solid black' }}>
              {course.time }  {(course.time > 0 && course.time < 1) ? ' day' : ' days'}
            </TableCell>
          </>
        )}
        <TableCell align="center" style={{ border: '1px solid black' }}>{faculty.facultyName}</TableCell>
        <TableCell align="center" style={{ border: '1px solid black' }}>
        <TextField
  type="number"
  size="small"
  disabled={facultyStatuses[`${course.courseId}-${faculty.facultyId}`] != 0 || statuses[`${course.courseId}-${faculty.facultyId}`] != -100 || faculty.facultyName=="External"}
  variant="outlined"
  value={allocations[course.courseId]?.[faculty.facultyId] || ''}
  onChange={(e) => handleInputChange(e, course.courseName, faculty.facultyId, faculty.facultyName, course.courseId,course.time)}
  placeholder={paperCounts[`${`${course.courseId}-${faculty.facultyId}`}`] || 0}
/>

        </TableCell>
      
        <TableCell align="center" style={{ border: '1px solid black' }}>
        {allocations[course.courseId]?.[faculty.facultyId] 
        ? (() => {
            const roundedValue = roundToHalfOrCeiling(allocations[course.courseId][faculty.facultyId] / 50);
           
            return `${roundedValue} ${roundedValue === 0.5 || roundedValue === 1 ? 'day' : 'days'}`;
        })() 
        : '0 days'
    }
        </TableCell>
        <TableCell width={"100%"}  align="center" style={{ border: '1px solid black' }}>
        { faculty.facultyName!="External"?(
          <Select
          options={bcCe}
          value={selectedBcCe[`${`${course.courseId}-${faculty.facultyId}`}`]}
          onChange={(value)=>{
            setSelectedBcCe((prev)=>{
              let newPrev = {...prev}
               newPrev[`${`${course.courseId}-${faculty.facultyId}`}`] = value;
               return newPrev;
            })
          }}
          isDisabled={facultyStatuses[`${course.courseId}-${faculty.facultyId}`] != 0 || statuses[`${course.courseId}-${faculty.facultyId}`] != -100}
          />
        ):(
          <Typography variant="body1" color="red">
          External Allocation is Done by COE only
          </Typography>
        )
        }
        </TableCell>
                 {
  (facultyStatuses[`${course.courseId}-${faculty.facultyId}`] !== undefined && facultyStatuses[`${course.courseId}-${faculty.facultyId}`] !== null) ? (
    facultyStatuses[`${course.courseId}-${faculty.facultyId}`] === 0 ? (
      statuses[`${course.courseId}-${faculty.facultyId}`] == 0 ? (
        <TableCell align="center" style={{ border: '1px solid black' }}>
          <Typography variant="body1" color="orangered">
            Waiting for Faculty Approval
          </Typography>
        </TableCell>
      ) : statuses[`${course.courseId}-${faculty.facultyId}`] == 1 ? (
        <TableCell align="center" style={{ border: '1px solid black' }}>
          <Typography variant="body1" color="orangered">
            Waiting for COE Approval
          </Typography>
        </TableCell>
      ) : statuses[`${course.courseId}-${faculty.facultyId}`] == 2 ? (
        <TableCell align="center" style={{ border: '1px solid black' }}>
          <Typography variant="body1" color="green">
            Approved By COE
          </Typography>
        </TableCell>
      ): statuses[`${course.courseId}-${faculty.facultyId}`] == -1 ? (
        <TableCell align="center" style={{ border: '1px solid black' }}>
          <Typography variant="body1" color="red">
          Rejected By  Faculty
          </Typography>
        </TableCell>
      ): statuses[`${course.courseId}-${faculty.facultyId}`] == -2 ? (
        <TableCell align="center" style={{ border: '1px solid black' }}>
          <Typography variant="body1" color="red">
          Rejected By COE
          </Typography>
        </TableCell>
      ): statuses[`${course.courseId}-${faculty.facultyId}`] == -3 ? (
        <TableCell align="center" style={{ border: '1px solid black' }}>
          <Typography variant="body1" color="red">
          Rejected By Replaced Faculty
          </Typography>
        </TableCell>
      ): statuses[`${course.courseId}-${faculty.facultyId}`] == -4 ? (
        <TableCell align="center" style={{ border: '1px solid black' }}>
          <Typography variant="body1" color="red">
          Replace - Rejected By COE
          </Typography>
        </TableCell>
      ): statuses[`${course.courseId}-${faculty.facultyId}`] == -5 ? (
        <TableCell align="center" style={{ border: '1px solid black' }}>
          <Typography variant="body1" color="red">
          Faculty is Replaced - not active for this course
          </Typography>
        </TableCell>
      )    : null
    ) : facultyStatuses[`${course.courseId}-${faculty.facultyId}`] == 3 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="green">
          Replace - Approved by COE {`${course.courseId}-${faculty.facultyId}`}
        </Typography>
      </TableCell>
    ) : facultyStatuses[`${course.courseId}-${faculty.facultyId}`] == 2 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="orangered">
          Replace - Waiting for COE Approval
        </Typography>
      </TableCell>
    ) : facultyStatuses[`${course.courseId}-${faculty.facultyId}`] == 1 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="orangered">
          Replace - Waiting for Faculty Approval
        </Typography>
      </TableCell>
    ): statuses[`${course.courseId}-${faculty.facultyId}`] == -1 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Rejected By  Faculty
        </Typography>
      </TableCell>
    ): statuses[`${course.courseId}-${faculty.facultyId}`] == -2 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Rejected By COE
        </Typography>
      </TableCell>
    ): statuses[`${course.courseId}-${faculty.facultyId}`] == -3 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Rejected By Replaced Faculty
        </Typography>
      </TableCell>
    ): statuses[`${course.courseId}-${faculty.facultyId}`] == -4 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Replace - Rejected By COE
        </Typography>
      </TableCell>
    ) : statuses[`${course.courseId}-${faculty.facultyId}`] == -5 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Faculty is Replaced - not active for this course
        </Typography>
      </TableCell>
    )  : null
  ) : (
    (statuses[`${course.courseId}-${faculty.facultyId}`] == 0 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="orangered">
          Waiting for Faculty Approval
        </Typography>
      </TableCell>
    ) : statuses[`${course.courseId}-${faculty.facultyId}`] == 1 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="orangered">
          Waiting for COE Approval
        </Typography>
      </TableCell>
    ) : statuses[`${course.courseId}-${faculty.facultyId}`] == 2 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="green">
          Approved By COE
        </Typography>
      </TableCell>
    ): statuses[`${course.courseId}-${faculty.facultyId}`] == -1 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Rejected By  Faculty
        </Typography>
      </TableCell>
    ): statuses[`${course.courseId}-${faculty.facultyId}`] == -2 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Rejected By COE
        </Typography>
      </TableCell>
    ): statuses[`${course.courseId}-${faculty.facultyId}`] == -3 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Rejected By Replaced Faculty
        </Typography>
      </TableCell>
    ): statuses[`${course.courseId}-${faculty.facultyId}`] == -4 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Replace - Rejected By COE
        </Typography>
      </TableCell>
    ) : statuses[`${course.courseId}-${faculty.facultyId}`] == -5 ? (
      <TableCell align="center" style={{ border: '1px solid black' }}>
        <Typography variant="body1" color="red">
        Faculty is Replaced - not active for this course
        </Typography>
      </TableCell>
    )  : null)
  )
}


<TableCell align="center" style={{ border: '1px solid black' }}>
        {facultyStatuses[`${course.courseId}-${faculty.facultyId}`] === 1 && (
  <Typography variant="body1" color="red">
    Replace request active - Faculty Approval Pending
  </Typography>
)}
{facultyStatuses[`${course.courseId}-${faculty.facultyId}`] === 2 && (
  <Typography variant="body1" color="red">
    Replace request active - initiated COE approval pending
  </Typography>
)}
{facultyStatuses[`${course.courseId}-${faculty.facultyId}`] === 0 ? (
  // If facultyStatuses is 0, check statuses
  statuses[`${course.courseId}-${faculty.facultyId}`] === 0 ? (
    <Typography variant="body1" color="orangered">
      Waiting for Faculty Approval
    </Typography>
  ) : statuses[`${course.courseId}-${faculty.facultyId}`] == 1 ? (
    <Typography variant="body1" color="orangered">
      Waiting for COE Approval
    </Typography>
  )  : statuses[`${course.courseId}-${faculty.facultyId}`] == -5 ? (
    <Typography variant="body1" color="red">
      Replaced
    </Typography>
  ) : (
  <IconButton 
  onClick={() => handleOpenModal(
    faculty.facultyId, 
    course.courseId,
    course.faculties.map(fac => ({
      ...fac,
      notEligible: ((facultyStatuses[`${course.courseId}-${fac.facultyId}`] != 0
         || statuses[`${course.courseId}-${fac.facultyId}`] != -100 ) && statuses[`${course.courseId}-${fac.facultyId}`] != 2 )
    }))
  )}
>


      <RotateLeftIcon />
    </IconButton>
  )
) : facultyStatuses[`${course.courseId}-${faculty.facultyId}`] === null || facultyStatuses[`${course.courseId}-${faculty.facultyId}`] === undefined ? (
  // If facultyStatuses is not present, show the icon
  <IconButton 
  onClick={() => handleOpenModal(
    faculty.facultyId, 
    course.courseId,
    course.faculties.map(fac => ({
      ...fac,
      notEligible: (facultyStatuses[`${course.courseId}-${fac.facultyId}`] != 0 || statuses[`${course.courseId}-${fac.facultyId}`] != -100)
    }))
  )}
>

    <RotateLeftIcon />
  </IconButton>
) : null}

        </TableCell>
        
      </TableRow>
      
    ))
  ))}
   {currentCourse && (
              <TableRow>
                <TableCell colSpan={9} align="center" style={{ border: '1px solid black' }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor:"rgba(2, 0, 48, 0.868)"
                    }}
                    onClick={() => handleAllocateAll(currentCourse.courseId, currentCourse.faculties, currentCourse.paperCount,currentCourse.time)}
                  >
                    Allocate
                  </Button>
                </TableCell>
              </TableRow>
            )}
</TableBody>

<Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, // You can adjust this width as needed
        backgroundColor: 'white',
        border: '2px solid #000',
        boxShadow: 24,
        padding: '20px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <h2 id="modal-title">Select Faculty and Reason</h2>
        <CloseIcon style={{ cursor: 'pointer', position: 'absolute', top: '10px', right: '10px' }} onClick={handleCloseModal} />
        <br></br>
        {}
        <Select
  placeholder="Select Faculty"
  value={suggestedFaculties.find(fac => fac.value === selectedFaculty)}
  onChange={option => setSelectedFaculty(option.value)}
  options={suggestedFaculties}
  styles={{ container: (provided) => ({ ...provided, width: '100%' }) }}
/>



<TextField
  placeholder='Reason'
  value={selectedReason}
  onChange={(e) => setSelectedReason(e.target.value)} // Change this line
  variant="outlined"
  margin="normal"
  fullWidth
/>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button variant="outlined" color="secondary" onClick={handleCloseModal} style={{ marginRight: '10px' }}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </Modal>
              
        </Table>
      </TableContainer>
      <center>
      <TablePagination
  rowsPerPageOptions={[1]} // Set to 1 to show one course per page
  count={courses.length} // Total number of courses
  rowsPerPage={1} // Show one course per page
  page={currentPage} // Current page index
  onPageChange={handlePageChange} // Function to handle page changes
/>

      </center>
    </div>
  );
};

const FacultyUploadTable = ({ headers, data, onCancel, onSubmit }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Change this to adjust the number of rows per page

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page on rows per page change
  };

  return (
    <div>
      <TableContainer component={Paper} style={{ marginTop: '20px', width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
        <Table style={{ borderCollapse: 'collapse' }}>
          <TableHead sx={{ backgroundColor: "#0d0030", color: "white", fontWeight: "bold" }}>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} align="center" style={{ border: '1px solid black' }}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]} // Options for rows per page
        component="div"
        count={data.length} // Total number of rows
        rowsPerPage={rowsPerPage} // Current rows per page
        page={page} // Current page
        onPageChange={handleChangePage} // Function to handle page change
        onRowsPerPageChange={handleChangeRowsPerPage} // Function to handle change in rows per page
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <Button variant="contained" color="secondary" onClick={onCancel} style={{ marginRight: '10px' }}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={onSubmit}>Submit</Button>
      </div>
    </div>
  );
};

const FacultyAllocation = (props) => {
  const [semesterCodes, setSemesterCodes] = useState([]);
  const [selectedSemesterCode, setSelectedSemesterCode] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [year,setYear] =  useState([]);
  const [yearOptions,setYearOptions] = useState([])
  const [batch, setBatch] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [courses, setCourses] = useState([]);
  const [uploadData, setUploadData] = useState([]);
  const [showUploadContainer, setShowUploadContainer] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [cookies,setCookie] = useCookies(['auth'])
  const [roles,setRoles] =  useState([])
  const [hodDetails,setHodDetails] = useState({})

useEffect(()=>{
  props.setTitle("Allocation")

},[])

  useEffect(() => {
    const fetchSemesterCodes = async () => {
      if(!batch || !year){
        return;
      }
      try {
        const response = await axios.get(`${apiHost}/api/semcodes?batch=${batch.value}&year=${year.value}`,{headers:{
          Auth: cookies.auth
       } });
        const parsedCodes = response.data.results.map(item => ({
          value: item.id,
          label: item.semcode,
        }));
        setSemesterCodes(parsedCodes);
      } catch (error) {
        console.error('Error fetching semester codes:', error);
      }
    };

    fetchSemesterCodes();
  }, [batch,year]);


  useEffect(()=>{
   
    try {
        if(roles.includes('hod')){
            axios.get(`${apiHost}/auth/hodDetails`,{headers:{
                Auth: cookies.auth,
            }}).then((res)=>{
                console.log(res.data[0])
                setHodDetails(res.data[0])
                setDepartmentId({value:res.data[0]?.department})
            })
        }
        
    } catch (error) {
        console.error('Error fetching role:', error);
    }
},[cookies.auth,roles])

useEffect(() => {
  const fetchRole = async () => {
      try {
          if(cookies.auth){
              const response = await axios.get(`${apiHost}/auth/role`, {
                  headers: {
                      auth: cookies.auth,
                  },
              });
              setRoles(response.data.roles)
              
          }
          
      } catch (error) {
          console.error('Error fetching role:', error);
      }
  };

  fetchRole();
}, [cookies.auth]);

  useEffect(() => {
    const fetchYears = async () => {
        try {
            const response = await axios.get(`${apiHost}/years`,{headers:{
              Auth: cookies.auth
           } });
            const parsedYears = response.data.map(item => ({
                value: item.id,
                label: item.year,
            }));
            setYearOptions(parsedYears);
        } catch (error) {
            console.error('Error fetching years:', error);
        }
    };

    fetchYears();
}, []);
  useEffect(() => {
    const fetchBatches = async () => {
        try {
            const response = await axios.get(`${apiHost}/batches`,{headers:{
              Auth: cookies.auth
           } });
            const parsedBatches = response.data.map(item => ({
                value: item.id,
                label: item.batch,
            }));
            setBatchOptions(parsedBatches);
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    fetchBatches();
}, []);
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiHost}/departments`,{headers:{
          Auth: cookies.auth
       } });
        const parsedDepartments = response.data.map(item => ({
          value: item.id,
          label: item.department,
        }));
        setDepartments(parsedDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (departmentId && selectedSemesterCode) {
        try {
          const response = await axios.get(`${apiHost}/api/courses/${departmentId.value}/${selectedSemesterCode.value}`,
            {headers:{
              Auth: cookies.auth
           }}
          );
          console.log("Allocation data : ",response.data.results)
          setCourses(response.data.results);
          setShowUploadContainer(false); // Hide upload container on successful fetch
        } catch (error) {
          if (error.response) {
            if (error.response.status === 404) {
              setUploadData([]); // Clear any previous upload data
              setShowUploadContainer(true); // Show upload container on error
              toast.error(error.response.data.message || 'The selected semester code has no eligible faculty.');
            } else {
              toast.error('Error fetching courses: ' + (error.response.data.message || 'Unknown error'));
            }
          } else {
            toast.error('Network error. Please try again later.');
          }
        }
      }
    };

    fetchCourses();
  }, [departmentId, selectedSemesterCode]);

  const handleFileUpload = async () => {
    const formattedData = uploadData
      .filter(row => row.length > 0 && row[0]) // Ensure the row has at least one column and the first column (facultyId) is not empty
      .map(row => ({
        facultyId: row[0], // Assuming the first column contains facultyId
        semcode: selectedSemesterCode.value, // Use the selected semester code
        department: departmentId.value, // Use the selected department ID
      }));

    if (formattedData.length === 0) {
      toast.error('No valid data to upload.');
      return; // Exit if there's no valid data
    }

    try {
      const response = await axios.post(`${apiHost}/api/uploadEligibleFaculty`, formattedData,{headers:{
        Auth: cookies.auth
     }});
      toast.success(response.data.message || 'File uploaded successfully.');

      setUploadData([]);
      setHeaders([]);

      const fetchCourses = async () => {
        if (departmentId && selectedSemesterCode) {
          try {
            const courseResponse = await axios.get(`${apiHost}/api/courses/${departmentId.value}/${selectedSemesterCode.value}`,{headers:{
              Auth: cookies.auth
           }});
            setCourses(courseResponse.data.results);
            setShowUploadContainer(false); // Hide upload container on successful fetch
          } catch (error) {
            toast.error('Error fetching courses after upload: ' + (error.response?.data?.message || 'Unknown error'));
          }
        }
      };

      fetchCourses(); // Trigger refetching of courses

    } catch (error) {
      toast.error('Error uploading file: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleCancel = () => {
    setShowUploadContainer(true);
    setUploadData([]); // Clear the upload data
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = json[0];
        const newData = json.slice(1);
        setHeaders(headers);
        setUploadData(newData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <div style={{padding:"10px"}}>
      </div>
      
      <div className='selectContainer' style={{ margin: '20px 20px',padding:"20px",borderRadius:"10px", display: 'flex',gap:"10px", justifyContent: 'space-between' }}>
       
         
     
        <div style={{ width: '30%', float: 'right'}}>
          <Select
            placeholder="Select Year"
            value={year}
            onChange={(selectedOption) => setYear(selectedOption)}
            options={yearOptions}
            isClearable
          />
        </div>
        <div style={{ width: '30%', float: 'right'}}>
          <Select
            placeholder="Select Batch"
            value={batch}
            onChange={(selectedOption) => setBatch(selectedOption)}
            options={batchOptions}
            isClearable
          />
        </div>
        <div style={{ width: '30%', float: 'right' }}>
          <Select
            placeholder="Select SemCode"
            value={selectedSemesterCode}
            onChange={(selectedOption) => setSelectedSemesterCode(selectedOption)}
            options={semesterCodes}
            isClearable
          />
        </div>
      </div>
      {(!courses.length>0 && !showUploadContainer) && <NoData/>}
      {courses.length > 0 ? (
        <FacultyAllocationTable
        departmentId={departmentId}
          selectedSemesterCode={selectedSemesterCode}
          courses={courses}
        />
      ) : (
        ((showUploadContainer)&&uploadData.length==0) && (
          <div
            style={{
              marginTop: '20px',
              marginBottom: '20px',
              width: '80%',
              marginLeft: 'auto',
              marginRight: 'auto',
              border: '2px dashed #ccc',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <CloudUploadIcon style={{ fontSize: '50px', color: '#888' }} />
            <p style={{ marginTop: '10px' }}>Click to upload Excel file</p>
          </div>
        )
      )}
      {uploadData.length > 0 && (
        <FacultyUploadTable
          headers={headers}
          data={uploadData}
          onCancel={handleCancel}
          onSubmit={handleFileUpload}
        />
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss={false}
        style={{ fontFamily: 'Poppins, sans-serif' }}
      />
    </div>
  );
};

export default FacultyAllocation;
