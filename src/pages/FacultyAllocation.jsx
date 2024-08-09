import React, { useState } from 'react';
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

const FacultyAllocationTable = ({ selectedSemesterCode }) => {
  const courses = [
    {
      courseName: 'Course 1',
      department: 'Department A',
      faculties: ['Faculty A1', 'Faculty A2', 'Faculty A3', 'Faculty A4', 'Faculty A5'],
    },
    {
      courseName: 'Course 2',
      department: 'Department B',
      faculties: ['Faculty B1', 'Faculty B2', 'Faculty B3', 'Faculty B4', 'Faculty B5'],
    },
    {
      courseName: 'Course 3',
      department: 'Department A',
      faculties: ['Faculty A1', 'Faculty A2', 'Faculty A3', 'Faculty A4', 'Faculty A5'],
    }
  ];

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
          <TableHead>
            <TableRow>
              <TableCell align="center" rowSpan={2} style={{ border: '1px solid black' }}>Course</TableCell>
              <TableCell align="center" rowSpan={2} style={{ border: '1px solid black' }}>Department</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>Faculty</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>Allocation</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentCourse.faculties.map((faculty, i) => (
              <TableRow key={i}>
                {i === 0 && (
                  <>
                    <TableCell rowSpan={5} align="center" style={{ border: '1px solid black' }}>{currentCourse.courseName}</TableCell>
                    <TableCell rowSpan={5} align="center" style={{ border: '1px solid black' }}>{currentCourse.department}</TableCell>
                  </>
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
  const semesterCodes = [
    { value: 'SEEJAN24', label: 'SEEJAN24' },
    { value: 'SEEFEB24', label: 'SEEFEB24' },
    { value: 'SEEMAR24', label: 'SEEMAR24' },
    { value: 'SEEAPR24', label: 'SEEAPR24' },
    { value: 'SEEMAY24', label: 'SEEMAY24' },
    { value: 'SEEJUN24', label: 'SEEJUN24' },
    { value: 'SEEJUL24', label: 'SEEJUL24' },
    { value: 'SEESEP24', label: 'SEESEP24' },
    { value: 'SEEOCT24', label: 'SEEOCT24' },
    { value: 'SEENOV24', label: 'SEENOV24' },
    { value: 'SEEDEC24', label: 'SEEDEC24' }
  ];

  const [selectedSemesterCode, setSelectedSemesterCode] = useState(null);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333', fontWeight: 'bold' }}>Faculty Allocation Request</h1>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '250px' }}>
          <Select
            options={semesterCodes}
            value={selectedSemesterCode}
            onChange={setSelectedSemesterCode}
            placeholder="Select Semester Code"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '4px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                border: '1px solid #ccc',
              }),
            }}
          />
        </div>
      </div>
      <FacultyAllocationTable selectedSemesterCode={selectedSemesterCode} />
    </div>
  );
};

export default FacultyAllocation;
