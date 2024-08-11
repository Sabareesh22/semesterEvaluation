import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Modal,
  Box,
  TextareaAutosize,
  IconButton,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import apiHost from '../../config/config';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify

const FacultyChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reason, setReason] = useState('');

  // Fetch faculty change requests from the API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${apiHost}/api/facultyChangeRequests`); // Replace with your API endpoint
        setRequests(response.data.results);
      } catch (error) {
        console.error('Error fetching faculty change requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    try {
      const response = await axios.put(`${apiHost}/api/facultyChangeRequests/status`, {
        old_faculty: request.old_faculty_id, // Adjust these fields according to your request
        new_faculty: request.new_faculty_id, 
        course: request.course_id,
        semcode: request.semcode_id,
        status: 2, // Or whatever status you want to set for approval
      });
      toast.success(`Change request for ${request.new_faculty_name} approved successfully!`); // Detailed success message
      // Optionally refresh requests here
      // fetchRequests(); 
    } catch (error) {
      console.error('Error approving change request:', error);
      toast.error('Failed to approve change request. Please try again later.'); // Detailed error message
    }
  };

  const handleReject = async () => {
    if (reason.trim() === '') {
      toast.warning('Please provide a reason for rejection.'); // Warning message if no reason is provided
    } else {
      try {
        const response = await axios.put(`${apiHost}/api/facultyChangeRequests/status`, {
          old_faculty: selectedRequest.old_faculty_id, 
          new_faculty: selectedRequest.new_faculty_id,// Adjust these fields according to your request
          course: selectedRequest.course_id,
          semcode: selectedRequest.semcode_id,
          status: -2, // Or whatever status you want to set for rejection
          remark: reason,
        });
        toast.success(`Change request for ${selectedRequest.new_faculty_name} rejected successfully! Reason: ${reason}`); // Detailed success message
        setOpenModal(false);
        setReason('');
        // Optionally refresh requests here
        // fetchRequests(); 
      } catch (error) {
        console.error('Error rejecting change request:', error);
        toast.error('Failed to reject change request. Please try again later.'); // Detailed error message
      }
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
      <ToastContainer /> {/* Add ToastContainer for Toastify notifications */}
      <Grid container spacing={2} direction="column">
        {requests.map((request) => (
          <Grid item xs={12} key={request.request_id}>
            <Card style={{ width: '100%' }}>
              <CardContent style={{ padding: '16px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <IconButton 
                    color="success" 
                    onClick={() => handleApprove(request)} 
                    style={{ marginRight: '5px' }}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleOpenModal(request)}
                  >
                    <CancelIcon />
                  </IconButton>
                </div>
                <Typography variant="h6" style={{ fontSize: '1.1rem' }}>
                  Change Request: {request.old_faculty_name} {request.old_faculty_unique_id} to {request.new_faculty_name} {request.new_faculty_unique_id}
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                  Course: {request.course_name}
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                  Course Code: {request.course_code}
                </Typography>
                <Typography variant="subtitle1" style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                  Remark: {request.remark}
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
            style={{ backgroundColor: "white", width: '100%', color: "black", margin: '10px auto', padding: '10px', fontSize: '16px', display: 'block', border: '1px solid #ccc', borderRadius: '4px' }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleReject}
            style={{ marginTop: '10px' }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default FacultyChangeRequests;
