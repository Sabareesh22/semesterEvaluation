import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Pagination
} from '@mui/material';
import Select from 'react-select';
import axios from 'axios'; // Import Axios
import apiHost from '../../config/config'; // Adjust the import path as needed

const FacultyAllocationTable = ({ selectedSemesterCode, courses }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [allocations, setAllocations] = useState({});

  const handleInputChange = (event, courseName, faculty, index, isLast) => {
    const value = Math.max(0, parseInt(event.target.value) || 0);

    if (!isLast) {
      const adjustedValue = Math.ceil(value / 25) * 25;
      setAllocations(prev => ({
        ...prev,
        [courseName]: {
          ...prev[courseName],
          [faculty]: adjustedValue
        }
      }));
    } else {
      setAllocations(prev => ({
        ...prev,
        [courseName]: {
          ...prev[courseName],
          [faculty]: value
        }
      }));
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value - 1);
  };

  const currentCourse = courses[currentPage];

  return (
    <div>
      <TableContainer component={Paper} style={{ marginTop: '20px', width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
        <Table style={{ borderCollapse: 'collapse' }}>
          <TableHead sx={{ backgroundColor: "#0d0030", color: "white", fontWeight: "bold" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" rowSpan={2} style={{ border: '1px solid black' }}>Course</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Faculty</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}>Allocation</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center" style={{ border: '1px solid black' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentCourse && currentCourse.faculties.map((faculty, i) => (
              <TableRow key={i}>
                {i === 0 && (
                  <TableCell rowSpan={currentCourse.faculties.length} align="center" style={{ border: '1px solid black' }}>{currentCourse.courseName}</TableCell>
                )}
                <TableCell align="center" style={{ border: '1px solid black' }}>{faculty}</TableCell>
                <TableCell align="center" style={{ border: '1px solid black' }}>
                  <TextField
                    type="number"
                    size="small"
                    variant="outlined"
                    value={allocations[currentCourse.courseName]?.[faculty] || ''}
                    onChange={(e) => handleInputChange(e, currentCourse.courseName, faculty, i, i === currentCourse.faculties.length - 1)}
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

const FacultyAllocation = () => {
  const [semesterCodes, setSemesterCodes] = useState([]);
  const [departments, setDepartments] = useState([]); // New state for departments
  const [selectedSemesterCode, setSelectedSemesterCode] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);
  const [courses, setCourses] = useState([]);

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
    if (departmentId) {
      const fetchCourses = async () => {
        try {
          const response = await axios.get(`${apiHost}/api/courses/${departmentId}`);
          setCourses(response.data.results);
        } catch (error) {
          console.error('Error fetching courses:', error);
        }
      };

      fetchCourses();
    }
  }, [departmentId]);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333', fontWeight: 'bold' }}>Faculty Allocation Request</h1>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '250px', marginRight: '20px' }}>
          <Select
            options={semesterCodes}
            value={selectedSemesterCode}
            onChange={setSelectedSemesterCode}
            placeholder="Select Semester Code"
          />
        </div>
        <div style={{ width: '250px' }}>
          <Select
            options={departments} // Use the fetched departments
            onChange={(option) => setDepartmentId(option.value)}
            placeholder="Select Department"
          />
        </div>
      </div>
      <FacultyAllocationTable selectedSemesterCode={selectedSemesterCode} courses={courses} />
    </div>
  );
};

export default FacultyAllocation;
