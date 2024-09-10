import React, { useState, useEffect } from "react";
import {
  Typography,
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
} from "@mui/material";
import Card from "../../components/card/Card";
import axios from "axios";
import apiHost from "../../../config/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { useCookies } from "react-cookie";
import "./FacutlyAllocationRequests.css";
import NoData from "../../components/noData/NoData";
import Button from "../../components/button/Button";

const FacultyAllocationRequests = (props) => {
  const [requests, setRequests] = useState([]);
  const [selectedHOD, setSelectedHOD] = useState(null);
  const [reason, setReason] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const coursesPerPage = 1; // Display one course per page
  const [semesterCodes, setSemesterCodes] = useState([]);
  const [selectedSemesterCode, setSelectedSemesterCode] = useState("");
  const [cookies] = useCookies(["auth"]);
  const [individualApproval, setIndividualApproval] = useState({});

  useEffect(() => {
    props.setTitle("Requests");
  }, [props]);

  const fetchRequests = async () => {
    console.log("Fetching faculty allocation requests...");
    try {
      const response = await axios.get(
        `${apiHost}/api/facultyPaperAllocationRequests?semcode=${selectedSemesterCode?.value || ''}`,
        {
          headers: {
            Auth: cookies.auth,
          },
        }
      );
      console.log("API Response:", response.data); // Log the entire response
      setRequests(response.data.results); // Update state with fetched results
    } catch (error) {
      console.error("Error fetching faculty allocation requests:", error);
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
        const response = await axios.get(`${apiHost}/api/semcodes`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedCodes = response.data.results.map((item) => ({
          value: item.id,
          label: item.semcode,
        }));
        setSemesterCodes(parsedCodes);
      } catch (error) {
        console.error("Error fetching semester codes:", error);
      }
    };
    fetchSemesterCodes();
  }, [cookies.auth]);

  const handleViewClick = (request) => {
    setSelectedHOD(request.hod);
    setSelectedRequest(request); // Set the selected request for approval/rejection
    setIndividualApproval({}); // Reset individual approval state
  };

  const handleIndividualApprove = async (facultyId, courseId) => {
    console.log(selectedSemesterCode,"is the semcode")
    try {
      await axios.put(
        `${apiHost}/api/facultyPaperAllocation/status`,
        {
          facultyId,
          courseId,
          semCode: selectedSemesterCode.value,
          status: 2, // Status for approval
        },
        {
          headers: {
            Auth: cookies.auth,
          },
        }
      );
      toast.success("Faculty approved successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Error approving faculty:", error);
      toast.error("Failed to approve faculty. Please try again.");
    }
  };

  const handleGroupApprove = async () => {
    // Get selected faculty-course pairs
    const selectedFaculties = Object.entries(individualApproval).filter(
      ([key, isApproved]) => isApproved
    ).map(([key]) => JSON.parse(key)); // Parse the key back to object

    if (selectedFaculties.length === 0) {
      toast.warn("No faculty selected for group approval.");
      return;
    }

    try {
      // Approve each faculty-course pair
      await Promise.all(
        selectedFaculties.map(async ({ facultyId, courseId }) => {
          await handleIndividualApprove(facultyId, courseId);
        })
      );

      // Refetch requests and reset state
      fetchRequests();
      setIndividualApproval({});
    } catch (error) {
      console.error("Error approving faculties:", error);
      toast.error("Failed to approve faculties. Please try again.");
    }
  };

  const handleGroupReject = async () => {
    const selectedFaculties = Object.entries(individualApproval).filter(
      ([key, isApproved]) => isApproved
    ).map(([key]) => JSON.parse(key)); // Parse the key back to object

    if (selectedFaculties.length === 0) {
      toast.warn("No faculty selected for group rejection.");
      return;
    }

    if (reason.trim() === "") {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      await Promise.all(
        selectedFaculties.map(async ({ facultyId, courseId }) => {
          await axios.put(
            `${apiHost}/api/facultyPaperAllocation/status`,
            {
              facultyId,
              courseId,
              semCode: selectedRequest.semCode,
              status: -2, // Status for rejection
              remark: reason, // Include the reason for rejection
            },
            { headers: { Auth: cookies.auth } }
          );

          toast.success(`Faculty ${facultyId} rejected successfully!`);
        })
      );

      fetchRequests();
      setReason("");
      setOpenModal(false);
    } catch (error) {
      console.error("Error rejecting faculties:", error);
      toast.error("Failed to reject faculties. Please try again.");
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Get the current course for the current page
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = selectedRequest?.courses?.slice(indexOfFirstCourse, indexOfLastCourse) || [];

  return (
    <div className="requestContainer">
      <div style={{ width: "100%", position: "relative", zIndex: "1" }}>
        <div style={{ float: "right" }}>
          <Card
            content={
              <Select
                placeholder="Select Semester Code"
                value={selectedSemesterCode}
                onChange={(selectedOption) =>
                  setSelectedSemesterCode(selectedOption)
                }
                options={semesterCodes}
                isClearable
              />
            }
          />
        </div>
      </div>

      {!requests?.length > 0 && <NoData />}

      <ToastContainer />
      {selectedHOD ? (
        <div>
          <Card
            content={
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Button
                    size={"small"}
                    label={"Back"}
                    color="primary"
                    onClick={() => setSelectedHOD(null)}
                  ></Button>
                  <p>HOD: {selectedHOD.name}</p>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    width: "100%",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <Button
                    size={"small"}
                    label={"Approve"}
                    color="success"
                    onClick={handleGroupApprove}
                    style={{ marginRight: "10px" }}
                  ></Button>
                  <Button
                    size={"small"}
                    label={"Reject"}
                    color="error"
                    onClick={handleOpenModal}
                  ></Button>
                </div>
              </>
            }
          />

          <TableContainer>
            <Table style={{ borderCollapse: "collapse" }}>
              <TableHead sx={{ backgroundColor: "#0d0030", color: "white" }}>
                <TableRow>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid #ccc", color: "#FFFFFF" }}>
                    Course Name
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid #ccc", color: "#FFFFFF" }}>
                    Total Paper Count
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid #ccc", color: "#FFFFFF" }}>
                    Course Code
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid #ccc", color: "#FFFFFF" }}>
                    Faculty Name
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid #ccc", color: "#FFFFFF" }}>
                    Paper Count
                  </TableCell>
                  <TableCell align="center" style={{ fontWeight: "bold", border: "1px solid #ccc", color: "#FFFFFF" }}>
                    Select
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentCourses.map((course) => (
                  course.faculties.map((faculty, idx) => (
                    <TableRow key={`${course.id}-${faculty.id}`}>
                      {idx === 0 && (
                        <>
                          <TableCell align="center" rowSpan={course.faculties.length} style={{ border: "1px solid #ccc" }}>
                            {course.name}
                          </TableCell>
                          <TableCell align="center" rowSpan={course.faculties.length} style={{ border: "1px solid #ccc" }}>
                            {course.count}
                          </TableCell>
                          <TableCell align="center" rowSpan={course.faculties.length} style={{ border: "1px solid #ccc" }}>
                            {course.code}
                          </TableCell>
                        </>
                      )}
                      <TableCell align="center" style={{ border: "1px solid #ccc" }}>
                        {faculty.name}
                      </TableCell>
                      <TableCell align="center" style={{ border: "1px solid #ccc" }}>
                        {faculty.paperCount}
                      </TableCell>
                      <TableCell align="center" style={{ border: "1px solid #ccc" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              const facultyId = faculty.id;
                              const courseId = course.id;
                              setIndividualApproval((prev) => {
                                const newApproval = { ...prev };
                                const key = JSON.stringify({ facultyId, courseId });
                                if (e.target.checked) {
                                  newApproval[key] = true;
                                } else {
                                  delete newApproval[key];
                                }
                                return newApproval;
                              });
                            }}
                            style={{
                              width: "20px",
                              height: "20px",
                              marginRight: "8px",
                              cursor: "pointer",
                            }}
                          />
                          <label
                            style={{ fontSize: "16px", cursor: "pointer" }}
                          >
                            {faculty.name}
                          </label>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            count={Math.ceil(selectedRequest?.courses?.length / coursesPerPage) || 1}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            style={{ marginTop: "20px", float: "right" }}
          />
        </div>
      ) : (
        requests?.length > 0 && (
          <div className="requestCardsContainer">
            {requests.map((data) => (
              <Button
                key={data.id}
                label={`${data.department}`}
                onClick={() => {
                  handleViewClick(data);
                }}
              />
            ))}
          </div>
        )
      )}

      <Modal
        className="rejectModal"
        open={openModal}
        onClose={handleCloseModal}
      >
        <Box className="rejectModalContent" sx={{ width: 400 }}>
          <Typography variant="h6">Reject Reason</Typography>
          <TextareaAutosize
            aria-label="reason"
            minRows={8}
            placeholder="Provide a reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%",
              marginTop: 10,
              borderRadius: 4,
              borderColor: "#ccc",
            }}
          />
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              gap: "30px",
            }}
          >
            <Button
              size={"small"}
              label={"Cancel"}
              onClick={handleCloseModal}
              style={{ marginTop: 10 }}
            ></Button>
            <Button
              size={"small"}
              label={"Reject"}
              onClick={handleGroupReject}
              style={{ marginTop: 10 }}
            ></Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default FacultyAllocationRequests;
