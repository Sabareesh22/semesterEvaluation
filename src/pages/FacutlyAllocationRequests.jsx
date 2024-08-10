import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextareaAutosize,
  Modal,
  Box,
  Pagination,
} from '@mui/material';

const FacultyAllocationRequests = () => {
  const requests = [
    { hodName: 'Dr. John Doe', department: 'CSE' },
    { hodName: 'Dr. Jane Smith', department: 'ECE' },
    { hodName: 'Dr. Alice Johnson', department: 'MECH' },
    { hodName: 'Dr. Robert Brown', department: 'CIVIL' },
    { hodName: 'Dr. Emily Davis', department: 'EEE' },
  ];

  const [selectedHOD, setSelectedHOD] = useState(null);
  const [reason, setReason] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 1; // Number of courses to display per page

  const dummyCourses = {
    CSE: [
      {
        courseName: 'Course 1',
        department: 'CSE',
        faculties: ['Faculty C1', 'Faculty C2', 'Faculty C3', 'Faculty C4', 'Faculty C5'],
        allocations: [25, 50, 75, 100, 25],
      },
    ],
    ECE: [
      {
        courseName: 'Course 2',
        department: 'ECE',
        faculties: ['Faculty E1', 'Faculty E2', 'Faculty E3', 'Faculty E4', 'Faculty E5'],
        allocations: [50, 75, 100, 125, 25],
      },
    ],
    MECH: [
      {
        courseName: 'Course 3',
        department: 'MECH',
        faculties: ['Faculty M1', 'Faculty M2', 'Faculty M3', 'Faculty M4', 'Faculty M5'],
        allocations: [75, 100, 125, 150, 25],
      },
    ],
    CIVIL: [
      {
        courseName: 'Course 4',
        department: 'CIVIL',
        faculties: ['Faculty V1', 'Faculty V2', 'Faculty V3', 'Faculty V4', 'Faculty V5'],
        allocations: [100, 125, 150, 175, 25],
      },
    ],
    EEE: [
      {
        courseName: 'Course 5',
        department: 'EEE',
        faculties: ['Faculty E1', 'Faculty E2', 'Faculty E3', 'Faculty E4', 'Faculty E5'],
        allocations: [125, 150, 175, 200, 25],
      },
    ],
  };

  const handleViewClick = (hodName) => {
    setSelectedHOD(hodName);
  };

  const handleApprove = () => {
    alert(`Allocation Approved for ${selectedHOD}`);
    setSelectedHOD(null);
  };

  const handleReject = () => {
    if (reason.trim() === '') {
      alert('Please provide a reason for rejection.');
    } else {
      alert(`Allocation Rejected: ${reason}`);
      setSelectedHOD(null);
      setOpenModal(false);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div style={{ padding: 16 }}>
      {selectedHOD ? (
        <div>
          <Button variant="outlined" color="secondary" onClick={() => setSelectedHOD(null)}>
            Back to Requests
          </Button>
          <Typography variant="h5" style={{ marginTop: 16 }}>
            Faculty Allocation for {selectedHOD} ({requests.find(request => request.hodName === selectedHOD)?.department})
          </Typography>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button variant="contained" color="success" onClick={handleApprove} style={{ marginRight: '10px' }}>
              Approve
            </Button>
            <Button variant="contained" color="error" onClick={handleOpenModal}>
              Reject
            </Button>
          </div>

          <TableContainer component={Paper} style={{ marginTop: '20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <Table style={{ borderCollapse: 'collapse' }}>
              <TableHead sx={{backgroundColor:"#0d0030",color:"white"}}>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Course</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Department</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Faculty</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Allocation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyCourses[requests.find(request => request.hodName === selectedHOD)?.department].slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage).map((course, courseIndex) => (
                  <React.Fragment key={courseIndex}>
                    {course.faculties.map((faculty, i) => (
                      <TableRow key={i}>
                        {i === 0 && (
                          <>
                            <TableCell rowSpan={5} align="center" style={{ border: '1px solid #ccc' }}>{course.courseName}</TableCell>
                            <TableCell rowSpan={5} align="center" style={{ border: '1px solid #ccc' }}>{course.department}</TableCell>
                          </>
                        )}
                        <TableCell align="center" style={{ border: '1px solid #ccc' }}>{faculty}</TableCell>
                        <TableCell align="center" style={{ border: '1px solid #ccc' }}>
                          {course.allocations[i]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={dummyCourses[requests.find(request => request.hodName === selectedHOD)?.department].length}
            page={currentPage}
            onChange={handlePageChange}
            rowsPerPage={coursesPerPage}
            color="primary"
            style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}
          />

          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Box 
              sx={{ 
                width: 400, 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                boxShadow: 24, 
                p: 4, 
                margin: 'auto', 
                marginTop: '20%', 
                textAlign: 'center'
              }}
            >
              <Typography id="modal-title" variant="h6">
                Reason for Rejection
              </Typography>
              <TextareaAutosize
                minRows={3}
                placeholder="Enter reason for rejection"
                style={{ backgroundColor:"white", width: '100%', color:"black", margin: '10px auto', padding: '10px', fontSize: '16px', display: 'block', border: '1px solid #ccc', borderRadius: '4px' }}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button variant="contained" color="error" onClick={handleReject}>
                Submit
              </Button>
            </Box>
          </Modal>
        </div>
      ) : (
        <Grid container spacing={2} direction="row" justifyContent="flex-start">
          {requests.map((request, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card 
                style={{ 
                  maxWidth: '300px', 
                  width: '100%', 
                  height: '150px', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)', 
                  margin: '0 auto', 
                  position: 'relative',
                }}
              >
                <CardContent style={{ padding: '16px', paddingBottom: '50px' }}>
                  <Typography variant="h6">
                    HOD Name: {request.hodName}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Department: {request.department}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleViewClick(request.hodName)} 
                    style={{ 
                      position: 'absolute', 
                      bottom: '10px', 
                      right: '10px' 
                    }}
                  >
                    View
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default FacultyAllocationRequests;
