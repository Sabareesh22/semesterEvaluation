import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import apiHost from '../../config/config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FacultyAllocationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedHOD, setSelectedHOD] = useState(null);
  const [reason, setReason] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const coursesPerPage = 1; // Display one course per page
  
  const fetchRequests = async () => {
    console.log('Fetching faculty allocation requests...');
    try {
      const response = await axios.get(`${apiHost}/api/facultyPaperAllocationRequests`);
      console.log('API Response:', response.data); // Log the entire response
      setRequests(response.data.results); // Update state with fetched results
    } catch (error) {
      console.error('Error fetching faculty allocation requests:', error);
    }
  };
  
  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewClick = (request) => {
    console.log(`Viewing allocation for HOD: ${request.hodName}`);
    setSelectedHOD(request.hodName);
    setSelectedRequest(request); // Set the selected request for approval/rejection
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    const { facultyInfo, courseInfo } = selectedRequest;

    try {
      for (let i = 0; i < facultyInfo.length; i++) {
        const facultyId = facultyInfo[i].id; // Use facultyId directly
        const courseId = courseInfo[i].id;
        console.log(selectedRequest);
        await axios.put(`${apiHost}/api/facultyPaperAllocation/status`, {
          facultyId,
          courseId,
          semCode: selectedRequest.semCode,
          status: 2, // Status for approval
        });
      }
      fetchRequests();
      toast.success('Allocations approved successfully!');
      setSelectedHOD(null);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving allocations:', error);
      toast.error('Failed to approve allocations. Please try again.');
    }
  };

  const handleReject = async () => {
    if (reason.trim() === '') {
      alert('Please provide a reason for rejection.');
      return;
    }

    if (!selectedRequest) return;

    const { facultyInfo, courseInfo } = selectedRequest;

    try {
      for (let i = 0; i < facultyInfo.length; i++) {
        const facultyId = facultyInfo[i].facultyId; // Use facultyId directly
        const courseId = courseInfo[i].id;
        
        await axios.put(`${apiHost}/api/facultyPaperAllocation/status`, {
          facultyId,
          courseId,
          status: '-2', // Status for rejection
          reason, // Include the reason for rejection
        });
      }
      toast.success('Allocations rejected successfully!');
      setSelectedHOD(null);
      setReason('');
      setOpenModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting allocations:', error);
      toast.error('Failed to reject allocations. Please try again.');
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handlePageChange = (event, value) => {
    console.log(`Changing page to: ${value}`);
    setCurrentPage(value);
  };

  // Get the current course for the current page
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = requests.slice(indexOfFirstCourse, indexOfLastCourse);

  return (
    <div style={{ padding: 16 }}>
       <div style={{padding:"10px"}}>
      <h1>Faculty Allocation Requests</h1>
      </div>
      <ToastContainer />
      {selectedHOD ? (
        <div>
          <Button variant="outlined" color="secondary" onClick={() => setSelectedHOD(null)}>
            Back to Requests
          </Button>
          <Typography variant="h5" style={{ marginTop: 16 }}>
            Faculty Allocation for {selectedHOD}
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
              <TableHead sx={{ backgroundColor: "#0d0030", color: "white" }}>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Course Name</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Course Code</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Faculty Name</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Paper Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentCourses.map((request) => {
                  const courseMapping = {};

                  // Map courses to faculties
                  request.courseInfo.forEach((course, index) => {
                    const courseId = course.id;
                    const courseName = course.name;
                    const courseCode = course.code;

                    // Initialize course details if not already done
                    if (!courseMapping[courseName]) {
                      courseMapping[courseName] = {
                        code: courseCode,
                        faculties: [],
                      };
                    }

                    // Add corresponding faculty for this course
                    if (request.facultyInfo[index]) {
                      const faculty = request.facultyInfo[index];
                      courseMapping[courseName].faculties.push({
                        name: faculty.name,
                        paperCount: faculty.paperCount,
                        facultyId: faculty.facultyId, // Include facultyId for approval/rejection
                      });
                    }
                  });

                  return Object.entries(courseMapping).map(([courseName, courseDetails]) => {
                    const { code, faculties } = courseDetails;
                    const rowSpan = faculties.length;

                    return (
                      <React.Fragment key={courseName}>
                        <TableRow>
                          <TableCell rowSpan={rowSpan} align="center">{courseName}</TableCell>
                          <TableCell rowSpan={rowSpan} align="center">{code}</TableCell>
                          <TableCell align="center">{faculties[0].name}</TableCell>
                          <TableCell align="center">{faculties[0].paperCount}</TableCell>
                        </TableRow>
                        {faculties.slice(1).map((faculty, facultyIndex) => (
                          <TableRow key={`${courseName}-${facultyIndex}`}>
                            <TableCell align="center">{faculty.name}</TableCell>
                            <TableCell align="center">{faculty.paperCount}</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={Math.ceil(requests.length / coursesPerPage)} // Update this count based on actual data length
            page={currentPage}
            onChange={handlePageChange}
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
                style={{ backgroundColor: "white", width: '100%', color: "black", margin: '10px auto', padding: '10px', fontSize: '16px', display: 'block', border: '1px solid #ccc', borderRadius: '4px' }}
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
          {requests.length > 0 ? (
            requests.map((request, index) => (
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
                      Department: {request.department} {/* Update based on your data structure */}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleViewClick(request)} // Pass the entire request object
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
            ))
          ) : (
            <Typography variant="h6" style={{ textAlign: 'center', width: '100%', marginTop: '20px' }}>
              No requests yet...
            </Typography>
          )}
        </Grid>
      )}
    </div>
  );
};

export default FacultyAllocationRequests;
