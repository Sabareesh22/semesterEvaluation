import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Box,
  TextareaAutosize,
  IconButton,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiHost from '../../config/config';

const FacultyApprovalPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [replacementRequests, setReplacementRequests] = useState([]);

  // Fetch allocations from API on component mount
  const fetchAllocations = async () => {
    try {
      const response = await axios.get(`${apiHost}/api/allocations/faculty/51`); // Replace '13' with the actual faculty ID
      setAllocations(response.data.results);
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  // Fetch replacement requests from the new API
  const fetchReplacementRequests = async () => {
    try {
      const response = await axios.get(`${apiHost}/api/allocations/new-faculty/51`); // Replace '12' with the actual faculty ID
      setReplacementRequests(response.data.results);
      console.log(response.data.results)
    } catch (error) {
      console.error('Error fetching replacement requests:', error);
    }
  };

  useEffect(() => {
    fetchAllocations();
    fetchReplacementRequests();
  }, []);

  const handleOpenModal = (course) => {
    setSelectedCourse(course);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setReason('');
    setSelectedCourse(null);
  };

  const handleApproveAllocation = async (course) => {
    try {
      await axios.put(`${apiHost}/api/facultyPaperAllocation/status`, {
        facultyId: 51, // Replace with actual faculty ID
        semCode: course.semcode,
        courseId: course.courseId,
        status:1,
      });

      toast.success(`${course.courseName} approved successfully.`);
      // Refetch the allocations after successful approval
      fetchAllocations();
    } catch (error) {
      toast.error('Failed to approve the course.');
    }
  };

  const handleRejectAllocation = async () => {
    if (reason.trim() === '') {
      toast.error('Please provide a reason for rejection.');
    } else {
      try {
        await axios.put(`${apiHost}/api/facultyPaperAllocation/status`, {
          facultyId: 51, // Replace with actual faculty ID
          semCode: selectedCourse.semcode,
          courseId: selectedCourse.courseId,
          status: -1,
          remark: reason, // Optional: send reason to backend
        });
        fetchAllocations();
        toast.success(`${selectedCourse.courseName} rejected successfully.`);
        handleCloseModal();
      } catch (error) {
        toast.error('Failed to reject the course.');
      }
    }
  };

  const handleApproveReplacement = async (course) => {

    console.log(course)
    console.log( {old_faculty: course.old_facutly, // Replace with the actual old faculty ID
      new_faculty:course.new_facutly , // You may need to adjust this depending on your data
      course: course.courseId,
      semcode: course.semcode,
      status: 1})
    try {
      await axios.put(`${apiHost}/api/facultyChangeRequests/status`, {
        old_faculty: course.old_faculty
        , // Replace with the actual old faculty ID
        new_faculty:course.new_faculty , // You may need to adjust this depending on your data
        course: course.courseId,
        semcode: course.semcode,
        status: 1,
      });

      toast.success(`${course.courseName} replacement approved successfully.`);
      // Refetch the replacement requests after successful approval
      fetchReplacementRequests();
    } catch (error) {
      toast.error('Failed to approve the replacement request.');
    }
  };

  const handleRejectReplacement = async () => {
    if (reason.trim() === '') {
      toast.error('Please provide a reason for rejection.');
    } else {
      try {
        await axios.put(`${apiHost}/api/facultyChangeRequests/status`, {
          old_faculty: selectedCourse.old_faculty, // Replace with the actual old faculty ID
          new_faculty: selectedCourse.new_faculty, // You may need to adjust this depending on your data
          course: selectedCourse.courseId,
          semcode: selectedCourse.semcode,
          status: -1,
          remark: reason, // Optional: send reason to backend
        });
        fetchReplacementRequests();
        toast.success(`${selectedCourse.courseName} replacement rejected successfully.`);
        handleCloseModal();
      } catch (error) {
        toast.error('Failed to reject the replacement request.');
      }
    }
  };

  // Group courses by semester code for regular allocations
  const groupedAllocations = allocations.reduce((acc, course) => {
    acc[course.semesterCode] = acc[course.semesterCode] || [];
    acc[course.semesterCode].push(course);
    return acc;
  }, {});

  // Group replacement requests by semester code
  const groupedReplacementRequests = replacementRequests.reduce((acc, course) => {
    acc[course.semesterCode] = acc[course.semesterCode] || [];
    acc[course.semesterCode].push(course);
    return acc;
  }, {});

  return (
    <div style={{ padding: 16 }}>
      <ToastContainer />

      <div style={{padding:"10px"}}>
      <h1>HOD Paper Allocation Requests</h1>
      </div>

      {/* Display grouped allocations */}
      {Object.keys(groupedAllocations).map((semesterCode, index) => (
        <div key={index} style={{ marginTop: '40px' }}>
          <Typography variant="h5" gutterBottom>
            {semesterCode}
          </Typography>
          <TableContainer component={Paper} style={{ marginTop: '20px', width: '100%' }}>
            <Table style={{ borderCollapse: 'collapse' }}>
              <TableHead sx={{ color: "white" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }} align="center" style={{ border: '1px solid black' }}>Course Name</TableCell>
                  <TableCell sx={{ color: "white" }} align="center" style={{ border: '1px solid black' }}>Course Code</TableCell>
                  <TableCell sx={{ color: "white" }} align="center" style={{ border: '1px solid black' }}>Allocated Papers</TableCell>
                  <TableCell sx={{ color: "white" }} align="center" style={{ border: '1px solid black' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedAllocations[semesterCode].map((course, courseIndex) => (
                  <TableRow key={courseIndex}>
                    <TableCell align="center" style={{ border: '1px solid black' }}>{course.courseName}</TableCell>
                    <TableCell align="center" style={{ border: '1px solid black' }}>{course.courseCode}</TableCell>
                    <TableCell align="center" style={{ border: '1px solid black' }}>{course.paperCount}</TableCell>
                    <TableCell align="center" style={{ border: '1px solid black' }}>
                      {course.status === '2' ? (
                        <Typography variant="body2" color="success.main">Approved</Typography>
                      ) : course.status === '1' ? (
                        <Typography variant="body2" color="warning.main">COE approval Pending</Typography>
                      ) : course.status === '-2' ? (
                        <Typography variant="body2" color="error.main">Rejected by COE</Typography>
                      ) : course.status === '-1' ? (
                        <Typography variant="body2" color="error.main">Rejected by You</Typography>
                      ) : (
                        <>
                          <IconButton color="success" onClick={() => handleApproveAllocation(course)}>
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleOpenModal(course)} style={{ marginLeft: '5px' }}>
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}

      {/* Display grouped replacement requests */}
      {Object.values(groupedReplacementRequests)?.length > 0 && (
        <Typography variant="h4" gutterBottom style={{ marginTop: '40px' }}>
          Replacement requests From HOD
        </Typography>
      )}
      
      {Object.keys(groupedReplacementRequests).map((semesterCode, index) => (
        <div key={index} style={{ marginTop: '40px' }}>
          <Typography variant="h5" gutterBottom>
            {semesterCode}
          </Typography>
          <TableContainer component={Paper} style={{ marginTop: '20px', width: '100%' }}>
            <Table style={{ borderCollapse: 'collapse' }}>
              <TableHead sx={{ color: "white" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }} align="center" style={{ border: '1px solid black' }}>Course Name</TableCell>
                  <TableCell sx={{ color: "white" }} align="center" style={{ border: '1px solid black' }}>Course Code</TableCell>
                  <TableCell sx={{ color: "white" }} align="center" style={{ border: '1px solid black' }}>Allocated Papers</TableCell>
                  <TableCell sx={{ color: "white" }} align="center" style={{ border: '1px solid black' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedReplacementRequests[semesterCode].map((course, courseIndex) => (
                  <TableRow key={courseIndex}>
                    <TableCell align="center" style={{ border: '1px solid black' }}>{course.courseName}</TableCell>
                    <TableCell align="center" style={{ border: '1px solid black' }}>{course.courseCode}</TableCell>
                    <TableCell align="center" style={{ border: '1px solid black' }}>{course.paperCount}</TableCell>
                    <TableCell align="center" style={{ border: '1px solid black' }}>
                      {course.status === '2' ? (
                        <Typography variant="body2" color="success.main">Approved</Typography>
                      ) : course.status === '1' ? (
                        <Typography variant="body2" color="warning.main">COE approval Pending</Typography>
                      ) : course.status === '-2' ? (
                        <Typography variant="body2" color="error.main">Rejected by COE</Typography>
                      ) : course.status === '-1' ? (
                        <Typography variant="body2" color="error.main">Rejected by You</Typography>
                      ) : (
                        <>
                          <IconButton color="success" onClick={() => handleApproveReplacement(course)}>
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleOpenModal(course)} style={{ marginLeft: '5px' }}>
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}

      {/* Rejection Reason Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            margin: 'auto',
            marginTop: '20%',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6">
            {selectedCourse && `Reason for rejecting ${selectedCourse.courseName}`}
          </Typography>
          <TextareaAutosize
            minRows={3}
            placeholder="Enter reason for rejection"
            style={{
              width: '100%',
              margin: '10px auto',
              backgroundColor: "white",
              padding: '10px',
              fontSize: '16px',
              display: 'block',
              color: "black",
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Button variant="contained" sx={{ backgroundColor: "blue" }} onClick={handleCloseModal} style={{ width: '48%' }}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={selectedCourse?.old_faculty!==undefined ? handleRejectReplacement : handleRejectAllocation} style={{ width: '48%' }}>
              Confirm Reject
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default FacultyApprovalPage;
