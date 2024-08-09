import React, { useState } from 'react';
import {
  Button,
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
} from '@mui/material';

const FacultyApprovalPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const dummyAllocations = [
    {
      courseName: 'Course 1',
      department: 'CSE',
      allocatedPapers: 5,
    },
    {
      courseName: 'Course 2',
      department: 'ECE',
      allocatedPapers: 4,
    },
    {
      courseName: 'Course 3',
      department: 'MECH',
      allocatedPapers: 6,
    },
    {
      courseName: 'Course 4',
      department: 'CIVIL',
      allocatedPapers: 3,
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
      <TableContainer component={Paper} style={{ marginTop: '20px', width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
        <Table style={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ border: '1px solid black' }}>Course</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>Department</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>Allocated Papers</TableCell>
              <TableCell align="center" style={{ border: '1px solid black' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyAllocations.map((allocation, index) => (
              <TableRow key={index}>
                <TableCell align="center" style={{ border: '1px solid black' }}>{allocation.courseName}</TableCell>
                <TableCell align="center" style={{ border: '1px solid black' }}>{allocation.department}</TableCell>
                <TableCell align="center" style={{ border: '1px solid black' }}>{allocation.allocatedPapers}</TableCell>
                <TableCell align="center" style={{ border: '1px solid black' }}>
                  <Button variant="contained" color="success" onClick={() => handleApprove(allocation)}>Approve</Button>
                  <Button variant="contained" color="error" onClick={() => handleOpenModal(allocation)} style={{ marginLeft: '10px' }}>
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={handleCloseModal}>
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
          <Typography variant="h6">
            {selectedCourse && `Reason for rejecting ${selectedCourse.courseName}`}
          </Typography>
          <TextareaAutosize
            minRows={3}
            placeholder="Enter reason for rejection"
            style={{
              width: '100%',
              margin: '10px auto',
              backgroundColor:"white",
              padding: '10px',
              fontSize: '16px',
              display: 'block',
              color:"black",
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Button variant="contained" sx={{backgroundColor:"blue"}} onClick={handleCloseModal} style={{ width: '48%' }}>
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
