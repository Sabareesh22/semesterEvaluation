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

  const handleInputChange = (event, courseName, faculty, index) => {
    const value = Math.max(0, parseInt(event.target.value) || 0);
    const courseAllocations = allocations[courseName] || {};
    const facultyCount = courses[currentPage].faculties.length;

    // Ensure the value is in multiples of 25
    let allocationValue = Math.ceil(value / 25) * 25;

    // Update allocation for the selected faculty
    let newAllocations = { ...courseAllocations, [faculty]: allocationValue };

    // Recalculate allocations for all except the last faculty
    let sumAllocations = 0;
    for (let i = 0; i < facultyCount - 1; i++) {
        const currentFaculty = courses[currentPage].faculties[i];
        sumAllocations += newAllocations[currentFaculty] || 0;
    }

    // Calculate remaining papers for the last faculty
    const remainingPapers = courses[currentPage].paperCount - sumAllocations;
    const lastFaculty = courses[currentPage].faculties[facultyCount - 1];

    if (remainingPapers < 0) {
        toast.error(`Total allocation exceeds the paper count.`);
        return;
    }

    // Update the last faculty's allocation with the remaining papers
    newAllocations[lastFaculty] = remainingPapers;

    // Update the state with the new allocations
    setAllocations(prev => ({
        ...prev,
        [courseName]: newAllocations,
    }));
};


  const handlePageChange = (event, value) => {
    setCurrentPage(value - 1);
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
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Course</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Paper Count</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Faculty</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Allocation</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentCourse && currentCourse.faculties.map((faculty, i) => (
              <TableRow key={i}>
                {i === 0 && (
                  <>
                    <TableCell rowSpan={currentCourse.faculties.length} align="center" style={{ border: '1px solid black' }}>{currentCourse.courseName}</TableCell>
                    <TableCell rowSpan={currentCourse.faculties.length} align="center" style={{ border: '1px solid black' }}>{currentCourse.paperCount}</TableCell>
                  </>
                )}
                <TableCell align="center" style={{ border: '1px solid black' }}>{faculty}</TableCell>
                <TableCell align="center" style={{ border: '1px solid black' }}>
                  <TextField
                    type="number"
                    size="small"
                    variant="outlined"
                    value={allocations[currentCourse.courseName]?.[faculty] || ''}
                    onChange={(e) => handleInputChange(e, currentCourse.courseName, faculty, i)}
                    disabled={i === currentCourse.faculties.length - 1} // Disable the input for the last faculty
                  />
                </TableCell>
                <TableCell align="center" style={{ border: '1px solid black' }}>
                  <Button variant="contained" color="primary">Allocate</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={courses.length}
        page={currentPage + 1}
        onChange={handlePageChange}
        color="primary"
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
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
