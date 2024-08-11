import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TablePagination,
  TextField,
} from '@mui/material';
import { Modal, Box } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';
import axios from 'axios';
import apiHost from '../../config/config';
import * as XLSX from 'xlsx';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Pagination from '@mui/material/Pagination';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyAllocationTable = ({ selectedSemesterCode, courses }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [allocations, setAllocations] = useState({});
  const [paperCounts, setPaperCounts] = useState([]); // New state for paper counts
  const [openModal, setOpenModal] = useState(false);
  const [suggestedFaculties, setSuggestedFaculties] = useState([]); // New state for storing suggested faculties

const [selectedFaculty, setSelectedFaculty] = useState(null);
const [selectedReason, setSelectedReason] = useState('');
const [currentRow, setCurrentRow] = useState(null); // To track which row is being edited
const handleOpenModal = async (facultyId, courseId) => {
  setSelectedFaculty(facultyId);
  setCurrentRow({ facultyId, courseId }); // Store current row info
  
  try {
    // Fetch suggested faculties from the API
    const response = await axios.get(`${apiHost}/api/facultyReplaceSuggest`, {
      params: {
        courseId: courseId,
        semcode: selectedSemesterCode.value,
        facultyId: facultyId,
      },
    });

    // Set the fetched faculties as options in the select
    setSuggestedFaculties(response.data.results.map(fac => ({ value: fac.id, label: fac.name })));
  } catch (error) {
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
  // Add your logic for submitting the replacement here
  // Use currentRow to get the courseId and facultyId
  // Example: await axios.post('your_api_endpoint', { facultyId: selectedFaculty, reason: selectedReason });

  // Close the modal after submission
  handleCloseModal();
};

  useEffect(() => {
    const fetchPaperCounts = async () => {
      const newPaperCounts = {};
  
      if (courses.length > 0) {
        for (const course of courses) {
          const { courseId, faculties } = course;
  
          for (const faculty of faculties) {
            try {
              const response = await axios.get(`${apiHost}/api/paperCount`, {
                params: {
                  course: courseId,
                  facultyId: faculty.facultyId, // Send facultyId here
                  semcode: selectedSemesterCode.value,
                },
              });
              // Store the paper count for the specific faculty
              newPaperCounts[faculty.facultyId] = response.data.results; // Store paper count by facultyId
            } catch (error) {
              // console.error('Error fetching paper count:', error);
              // toast.error('Error fetching paper count.');
            }
          }
        }
      }
  
      setPaperCounts(newPaperCounts); // Update state with paper counts
    };
  
    fetchPaperCounts();
  }, [selectedSemesterCode, courses]);
  

  const handleInputChange = (event, courseName, facultyId, facultyName, courseId, index) => {
    const value = parseInt(event.target.value) || 0; // Allow negative values for direct input
    const courseAllocations = allocations[courseId] || {};
    const facultyCount = courses[currentPage].faculties.length;

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
    for (let i = 0; i < facultyCount - 1; i++) {
      const currentFacultyId = courses[currentPage].faculties[i].facultyId;
      sumAllocations += newAllocations[currentFacultyId] || 0;
    }

    // Calculate remaining papers for the last faculty
    const remainingPapers = courses[currentPage].paperCount - sumAllocations;
    const lastFacultyId = courses[currentPage].faculties[facultyCount - 1].facultyId;

    // Check if the total allocation exceeds the paper count
    if (remainingPapers < 0) {
      toast.error(`Total allocation exceeds the paper count.`);
      return;
    }

    // Update last faculty's allocation based on remaining papers
    newAllocations[lastFacultyId] = Math.max(0, remainingPapers); // Ensure it's non-negative

    // Update the state with the new allocations
    setAllocations(prev => ({
      ...prev,
      [courseId]: newAllocations,
    }));
  };

  const handleAllocate = async (courseId, facultyId, paperCount, AllocationSum) => {
    const allocationValue = allocations[courseId]?.[facultyId];

    if (allocationValue > 0) {
      try {
        const response = await axios.post(`${apiHost}/api/allocateFaculty`, [{
          facultyId,
          courseId,
          paperCount: allocationValue,
          semCode: selectedSemesterCode.value,
        }]);

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

  const handleAllocateAll = async (courseId, faculties, paperCount) => {
    let AllocationSum = 0;
    Object.values(allocations[courseId]).forEach(v => {
      AllocationSum += v;
    });
    if (AllocationSum !== paperCount) {
      toast.error('Error allocating all faculties.');
      return;
    }
    try {
      for (const faculty of faculties) {
        await handleAllocate(courseId, faculty.facultyId, paperCount, AllocationSum);
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
    setCurrentPage(newPage - 1); // Update to zero-based index
  };

  const currentCourse = courses[currentPage];

  return (
    <div>
      <TableContainer
        component={Paper}
        style={{ marginTop: '20px', width: '80%', marginLeft: 'auto', marginRight: 'auto', padding: '20px' }}
      >
        <Table style={{ borderCollapse: 'collapse' }}>
          <TableHead sx={{ backgroundColor: "#0d0030", color: "white", fontWeight: "bold" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" rowSpan={2} style={{ border: '1px solid black' }}>Course</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" rowSpan={2} style={{ border: '1px solid black' }}>Paper Count</TableCell>
             
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Faculty</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Allocation</TableCell>
              <TableCell colSpan={2} sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}> Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.slice(currentPage * 1, currentPage * 1 + 1).map((course, index) => (
              course.faculties.map((faculty, i) => (
                <TableRow key={faculty.facultyId}>
                  {i === 0 && (
                    <>
                      <TableCell rowSpan={course.faculties.length} align="center" style={{ border: '1px solid black' }}>
                        {course.courseName}
                      </TableCell>
                      <TableCell rowSpan={course.faculties.length} align="center" style={{ border: '1px solid black' }}>
                        {course.paperCount}
                      </TableCell>
                      
                    </>
                  )}
                  <TableCell align="center" style={{ border: '1px solid black' }}>{faculty.facultyName}</TableCell>
                  <TableCell align="center" style={{ border: '1px solid black' }}>
                    <TextField
                      type="number"
                      size="small"
                      variant="outlined"
                      value={allocations[course.courseId]?.[faculty.facultyId] || ''}
                      onChange={(e) => handleInputChange(e, course.courseName, faculty.facultyId, faculty.facultyName, course.courseId)}
                      placeholder={paperCounts[faculty.facultyId]?.length>0?paperCounts[faculty.facultyId][i]:0}
                    />
                  </TableCell>
                  <TableCell align="center" style={{ border: '1px solid black' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAllocate(course.courseId, faculty.facultyId, course.paperCount)}
                    >
                      Allocate
                    </Button>
                  </TableCell>
                  <TableCell align="center" style={{ border: '1px solid black' }}>
  <IconButton onClick={() => handleOpenModal(faculty.facultyId, course.courseId, '')}>
    <RotateLeftIcon />
  </IconButton>
</TableCell>
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
  value={selectedFaculty}
  onChange={setSelectedFaculty}
  options={suggestedFaculties} // Use the suggested faculties here
  styles={{ container: (provided) => ({ ...provided, width: '100%' }) }}
/>


        <TextField
          placeholder='Reason'
         
          onChange={(e) => setReason(e.target.value)}
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
                </TableRow>
              ))
            ))}
            {currentCourse && (
              <TableRow>
                <TableCell colSpan={5} align="right" style={{ border: '1px solid black' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleAllocateAll(currentCourse.courseId, currentCourse.faculties, currentCourse.paperCount)}
                  >
                    Allocate All
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        count={courses.length}
        rowsPerPage={5}
        page={currentPage + 1} // Adjusted to one-based index
        onPageChange={handlePageChange}
      />
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

const FacultyAllocation = () => {
  const [semesterCodes, setSemesterCodes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedSemesterCode, setSelectedSemesterCode] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [uploadData, setUploadData] = useState([]);
  const [showUploadContainer, setShowUploadContainer] = useState(false);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    const fetchSemesterCodes = async () => {
      try {
        const response = await axios.get(`${apiHost}/api/semcodes`);
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
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiHost}/departments`);
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
          const response = await axios.get(`${apiHost}/api/courses/${departmentId.value}/${selectedSemesterCode.value}`);
          console.log(response.data.results)
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
      const response = await axios.post(`${apiHost}/api/uploadEligibleFaculty`, formattedData);
      toast.success(response.data.message || 'File uploaded successfully.');

      setUploadData([]);
      setHeaders([]);

      const fetchCourses = async () => {
        if (departmentId && selectedSemesterCode) {
          try {
            const courseResponse = await axios.get(`${apiHost}/api/courses/${departmentId.value}/${selectedSemesterCode.value}`);
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
      <h1>Faculty Allocation</h1>
      </div>
      
      <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ width: '30%', float: 'right', marginLeft: '20px' }}>
          <Select
            placeholder="Select Department"
            value={departmentId}
            onChange={(selectedOption) => setDepartmentId(selectedOption)}
            options={departments}
            isClearable
          />
        </div>
        <div style={{ width: '30%', float: 'right' }}>
          <Select
            placeholder="Select Semester Code"
            value={selectedSemesterCode}
            onChange={(selectedOption) => setSelectedSemesterCode(selectedOption)}
            options={semesterCodes}
            isClearable
          />
        </div>
      </div>
      {courses.length > 0 ? (
        <FacultyAllocationTable
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
