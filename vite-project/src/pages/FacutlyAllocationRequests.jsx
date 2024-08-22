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
import Select from 'react-select';
import { useCookies } from 'react-cookie';

const FacultyAllocationRequests = (props) => {
  const [requests, setRequests] = useState([]);
  const [selectedHOD, setSelectedHOD] = useState(null);
  const [reason, setReason] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const coursesPerPage = 1; // Display one course per page
  const [semesterCodes, setSemesterCodes] = useState([]);
  const [selectedSemesterCode, setSelectedSemesterCode] = useState("");
  const [cookies,setCookie] = useCookies(['auth'])
  // State to track individual approvals for each faculty in each course
  const [individualApproval, setIndividualApproval] = useState({}); 
  useEffect(()=>{
    props.setTitle("Alloc Requests")
},[])
  const fetchRequests = async () => {
    console.log('Fetching faculty allocation requests...');
    try {
      const response = await axios.get(`${apiHost}/api/facultyPaperAllocationRequests?semcode=${selectedSemesterCode.value}`,
        {
          headers:{
            Auth: cookies.auth
         }
        }
      );
      console.log('API Response:', response.data); // Log the entire response
      setRequests(response.data.results); // Update state with fetched results
    } catch (error) {
      console.error('Error fetching faculty allocation requests:', error);
    }
  };

  useEffect(() => {
    if (selectedSemesterCode) {
      fetchRequests();
    }
  }, [selectedSemesterCode]);

  useEffect(() => {
    const fetchSemesterCodes = async () => {
      try {
        const response = await axios.get(`${apiHost}/api/semcodes`,{ headers:{
          Auth: cookies.auth
       }});
        const parsedCodes = response.data.results.map(item => ({
          value: item.id,
          label: item.semcode,
        }));
        console.log(parsedCodes);
        setSemesterCodes(parsedCodes);
      } catch (error) {
        console.error('Error fetching semester codes:', error);
      }
    };
    fetchSemesterCodes();
  }, []);

  const handleViewClick = (request) => {
    console.log(`Viewing allocation by HOD: ${request.hodName}`);
    setSelectedHOD(request.hodName);
    setSelectedRequest(request); // Set the selected request for approval/rejection
    setIndividualApproval({}); // Reset individual approval state
  };

  const handleIndividualApprove = async (facultyId, courseId) => {
    try {
      console.log(courseId)
      await axios.put(`${apiHost}/api/facultyPaperAllocation/status`, {
        facultyId,
        courseId,
        semCode: selectedRequest.semCode,
        status: 2, // Status for approval
      },{ headers:{
        Auth: cookies.auth
     }});
      toast.success('Faculty approved successfully!');
    } catch (error) {
      console.error('Error approving faculty:', error);
      toast.error('Failed to approve faculty. Please try again.');
    }
  };

  const handleGroupApprove = async () => {
    const selectedFaculties = Object.entries(individualApproval).filter(([facultyId, isApproved]) => isApproved);

    if (selectedFaculties.length === 0) {
      toast.warn('No faculty selected for group approval.');
      return;
    }

    try {
      await Promise.all(selectedFaculties.map(async ([facultyId]) => {
        const facultyIndex = selectedRequest.facultyInfo.findIndex(f => f.id === facultyId);
    
       
          await handleIndividualApprove(facultyId, selectedRequest.courseInfo[facultyIndex].id);
          fetchRequests();
      }));
    } catch (error) {
      console.error('Error approving faculties:', error);
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
        },{ headers:{
          Auth: cookies.auth
       }});
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
      <div style={{ padding: "10px" }}>
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

        {!requests?.length>0 && <div style={{width:"100%",display:"flex",marginTop:"15%",justifyContent:"center"}}><p>**** No requests Available ****</p></div>}

      <ToastContainer />
      {selectedHOD ? (
        <div>
          <Button variant="outlined" color="secondary" onClick={() => setSelectedHOD(null)}>
            Back to Requests
          </Button>
          <Typography variant="h5" style={{ marginTop: 16 }}>
            Faculty Allocation of {selectedHOD}
          </Typography>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Button variant="contained" color="success" onClick={handleGroupApprove} style={{ marginRight: '10px' }}>
              Approve Selected
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
        <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Total Paper Count</TableCell>
        <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Course Code</TableCell>
        <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Faculty Name</TableCell>
        <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Paper Count</TableCell>
        <TableCell align="center" style={{ fontWeight: 'bold', border: '1px solid #ccc', color: '#FFFFFF' }}>Select</TableCell>
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
          const paperCount = course.count;
          // Initialize course details if not already done
          if (!courseMapping[courseName]) {
            courseMapping[courseName] = {
              code: courseCode,
              count: paperCount,
              faculties: [],
            };
          }

          // Add corresponding faculty for this course
          if (request.facultyInfo[index]) {
            const faculty = request.facultyInfo[index];
            courseMapping[courseName].faculties.push({
              name: faculty.name,
              paperCount: faculty.paperCount,
              id: faculty.id,
            });
          }
        });

        return Object.keys(courseMapping).map((courseName) => {
          const course = courseMapping[courseName];
          const facultyCount = course.faculties.length;

          return course.faculties.map((faculty, idx) => (
            <TableRow key={`${courseName}-${faculty.id}`}>
              {idx === 0 && (
                <>
                  <TableCell
                    align="center"
                    rowSpan={facultyCount}
                    style={{ border: '1px solid #ccc' }}
                  >
                    {courseName}
                  </TableCell>
                  <TableCell
                    align="center"
                    rowSpan={facultyCount}
                    style={{ border: '1px solid #ccc' }}
                  >
                    {course.count}
                  </TableCell>
                  <TableCell
                    align="center"
                    rowSpan={facultyCount}
                    style={{ border: '1px solid #ccc' }}
                  >
                    {course.code}
                  </TableCell>
                </>
              )}
              <TableCell align="center" style={{ border: '1px solid #ccc' }}>
                {faculty.name}
              </TableCell>
              <TableCell align="center" style={{ border: '1px solid #ccc' }}>
                {faculty.paperCount}
              </TableCell>
              <TableCell align="center" style={{ border: '1px solid #ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const facultyId = faculty.id;
                      setIndividualApproval((prev) => ({
                        ...prev,
                        [facultyId]: e.target.checked,
                      }));
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '8px',
                      cursor: 'pointer',
                    }}
                  />
                  <label style={{ fontSize: '16px', cursor: 'pointer' }}>{faculty.name}</label>
                </div>
              </TableCell>
            </TableRow>
          ));
        });
      })}
    </TableBody>
  </Table>
</TableContainer>

          <Pagination
            count={Math.ceil(requests.length / coursesPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            style={{ marginTop: '20px', float: 'right' }}
          />
        </div>
      ) : (requests?.length>0 &&
        
        <div>

          <Typography variant="h5" style={{ marginTop: 16 }}>Select a HOD to view requests</Typography>
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#0d0030", color: "white" }}>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: 'bold', color: '#FFFFFF' }}>HOD Name</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Department</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', color: '#FFFFFF' }}>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell align="center">{request.hodName}</TableCell>
                    <TableCell align="center">{request.department}</TableCell>
                    <TableCell align="center">
                      <Button variant="contained" onClick={() => handleViewClick(request)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ width: 400 }}>
          <Typography variant="h6">Reject Reason</Typography>
          <TextareaAutosize
            aria-label="reason"
            minRows={3}
            placeholder="Provide a reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: '100%', marginTop: 10, borderRadius: 4, borderColor: '#ccc' }}
          />
          <Button variant="contained" color="error" onClick={handleReject} style={{ marginTop: 10 }}>
            Reject
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default FacultyAllocationRequests;
