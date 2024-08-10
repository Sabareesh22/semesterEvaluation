import React, { useState } from 'react';
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

const FacultyApprovalPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const dummyAllocations = [
    {
      semCode: 'SEEFEB23',
      courses: [
        { courseName: 'Course 1', department: 'CSE', allocatedPapers: 5, approved: true },
        { courseName: 'Course 2', department: 'ECE', allocatedPapers: 4, approved: false },
      ],
    },
    {
      semCode: 'SEEJUL23',
      courses: [
        { courseName: 'Course 3', department: 'MECH', allocatedPapers: 6, approved: true },
        { courseName: 'Course 4', department: 'CIVIL', allocatedPapers: 3, approved: false },
      ],
    },
  ];

  const handleOpenModal = (course) => {
    setSelectedCourse(course);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setReason('');
    setSelectedCourse(null);
  };

  const handleApprove = (course) => {
    alert(`Approved ${course.courseName} with ${course.allocatedPapers} papers.`);
  };

  const handleReject = () => {
    if (reason.trim() === '') {
      alert('Please provide a reason for rejection.');
    } else {
      alert(`Rejected ${selectedCourse.courseName} with ${selectedCourse.allocatedPapers} papers: ${reason}`);
      handleCloseModal();
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h4" gutterBottom>
        Faculty Course Allocations
      </Typography>

      {/* Always visible course allocations table */}
      <div>
        {dummyAllocations.map((allocationGroup, index) => (
          <div key={index} style={{ marginTop: '40px' }}>
            <Typography variant="h5" gutterBottom>
              {allocationGroup.semCode}
            </Typography>
            <TableContainer component={Paper} style={{ marginTop: '20px', width: '100%' }}>
              <Table style={{ borderCollapse: 'collapse' }}>
                <TableHead sx={{color:"white"}}>
                  <TableRow>
                    <TableCell sx={{color:"white"}} align="center" style={{ border: '1px solid black' }}>Course</TableCell>
                    <TableCell sx={{color:"white"}} align="center" style={{ border: '1px solid black' }}>Department</TableCell>
                    <TableCell sx={{color:"white"}} align="center" style={{ border: '1px solid black' }}>Allocated Papers</TableCell>
                    <TableCell sx={{color:"white"}} align="center" style={{ border: '1px solid black' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allocationGroup.courses.map((course, courseIndex) => (
                    <TableRow key={courseIndex}>
                      <TableCell align="center" style={{ border: '1px solid black' }}>{course.courseName}</TableCell>
                      <TableCell align="center" style={{ border: '1px solid black' }}>{course.department}</TableCell>
                      <TableCell align="center" style={{ border: '1px solid black' }}>{course.allocatedPapers}</TableCell>
                      <TableCell align="center" style={{ border: '1px solid black' }}>
                        {course.approved ? (
                          <Typography variant="body2" color="success.main">Approved</Typography>
                        ) : (
                          <>
                            <IconButton color="success" onClick={() => handleApprove(course)}>
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
      </div>

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
            <Button variant="contained" color="error" onClick={handleReject} style={{ width: '48%' }}>
              Confirm Reject
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default FacultyApprovalPage;
