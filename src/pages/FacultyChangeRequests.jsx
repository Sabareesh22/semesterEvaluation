import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Modal,
  Box,
  TextareaAutosize,
} from '@mui/material';

const FacultyChangeRequests = () => {
  const requests = [
    { 
      requestId: 1, 
      oldFaculty: 'Faculty A', 
      newFaculty: 'Faculty B', 
      course: 'Course 1', 
      hodName: 'Dr. John Doe', 
      remarks: '' 
    },
    { 
      requestId: 2, 
      oldFaculty: 'Faculty C', 
      newFaculty: 'Faculty D', 
      course: 'Course 2', 
      hodName: 'Dr. Jane Smith', 
      remarks: '' 
    },
    { 
      requestId: 3, 
      oldFaculty: 'Faculty E', 
      newFaculty: 'Faculty F', 
      course: 'Course 3', 
      hodName: 'Dr. Alice Johnson', 
      remarks: '' 
    },
  ];

  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reason, setReason] = useState('');

  const handleApprove = (request) => {
    alert(`Change Approved for Request ID: ${request.requestId}`);
  };

  const handleReject = () => {
    if (reason.trim() === '') {
      alert('Please provide a reason for rejection.');
    } else {
      alert(`Change Rejected: ${reason}`);
      setOpenModal(false);
      setReason('');
    }
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  return (
    <div style={{ padding: 16 }}>
      <Grid container spacing={2} direction="column">
        {requests.map((request) => (
          <Grid item xs={12} key={request.requestId}>
            <Card style={{ width: '100%' }}>
              <CardContent style={{ padding: '16px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <Button variant="contained" color="success" onClick={() => handleApprove(request)} style={{ marginRight: '5px' }}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleOpenModal(request)}>
                    Reject
                  </Button>
                </div>
                <Typography variant="h6" style={{ fontSize: '1.1rem' }}>
                  Change Request: {request.oldFaculty} to {request.newFaculty}
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                  Course: {request.course}
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                  HOD: {request.hodName}
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                  Remarks: {request.remarks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
  );
};

export default FacultyChangeRequests;
