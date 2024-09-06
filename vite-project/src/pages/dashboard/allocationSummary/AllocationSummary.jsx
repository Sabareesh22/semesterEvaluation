import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Circle } from "@mui/icons-material";
import apiHost from "../../../../config/config";
import "./AllocationSummary.css";
const AllocationSummary = ({ semesterCode, departmentId }) => {
  const [pendingAllocations, setPendingAllocations] = useState([]);
  const [cookies, setCookies] = useCookies(["auth"]);
  const [facutlySummaryData, setFacultySummaryData] = useState([]);
  
  useEffect(()=>{

       axios.get(`${apiHost}/api/facultyPaperAllocationsFilter`,{
        params:{
          semcode:semesterCode,
          department: departmentId,
        },
        headers:{
          Auth: cookies.auth,
        }
       }).then((response)=>{
        console.log(response.data);
        setFacultySummaryData(response.data);
       })
    
  },[departmentId,semesterCode])

  useEffect(() => {
    const fetchPendingAllocations = async () => {
      if (!semesterCode || !departmentId) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/pendingAllocationsSummary`,
          {
            params: {
              semcode: semesterCode,
              department: departmentId,
            },
            headers: {
              Auth: cookies.auth,
            },
          }
        );
        console.log(
          "Pending Allocations : ",
          response.data.pending_allocations_summary
        );
        setPendingAllocations(response.data.pending_allocations_summary);
      } catch (error) {
        console.error("Error fetching pending allocations:", error);
      }
    };

    fetchPendingAllocations();
  }, [semesterCode, departmentId, cookies.auth]);
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        paddingBottom: "15px",
        flexWrap: "wrap",
      }}
    >
      <div
        className="pendingAllocationsContainer"
        style={{
          flex: "1",
          display: "flex",
          
          gap: "20px",
          maxHeight: "400px",
          minWidth: "400px",
          overflow: "scroll",
          overflowY: "hidden",
          padding: "10px",
          borderRadius: "5px",
          marginTop: "10px",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        }}
      >
        <div className="pendingCoursesMasterContainer">
          <div className="pendingContentHeading">
            <h3>Pending Courses</h3>
          </div>
          <div className="pendingCoursesContent">
            <div className="coursesContainer">
              <h4>Regular Courses</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "scroll", 
                  gap: "10px",
                }}
              >
                {pendingAllocations?.length > 0 &&
                  pendingAllocations
                    .filter((data) => data.type === "1")
                    ?.map((allocation, index) => (
                      <div
                        key={index}
                        className="pendingListOptions"
                        style={{ display: "flex", gap: "5px" ,alignItems:"center"}}
                      >
                        <Circle sx={{height:"15px"}} />

                        <div className="pendingAllocationBullets">
                          <p style={{ flex: "0.35" }}>{allocation.course_code}</p>
                          <p>-</p>
                          <p style={{ flex: "1" }}>{allocation.paper_count}</p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
            <div className="coursesContainer">
              <h4>Arrear Courses</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "scroll",
                  gap: "10px",
                }}
              >
                {pendingAllocations?.length > 0 &&
                  pendingAllocations
                    .filter((data) => data.type === "2")
                    ?.map((allocation, index) => (
                      <div
                        key={index}
                        className="pendingListOptions"
                        style={{ display: "flex", gap: "5px" ,alignItems:"center"}}
                      >
                        <Circle sx={{height:"15px"}} />
                        <div className="pendingAllocationBullets">
                          <p style={{ flex: "0.35" }}>{allocation.course_code}</p>
                          <p>-</p>
                          <p style={{ flex: "1" }}>{allocation.paper_count}</p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
        </div>
         <div
        className="pendingAllocationsContainer"
        style={{
          flex: "1",
          display: "flex",
          
          gap: "20px",
          maxHeight: "400px",
          minWidth: "400px",
          overflow: "scroll",
          overflowY: "hidden",
          padding: "10px",
          borderRadius: "5px",
          marginTop: "10px",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        }}
      >
        <div className="pendingCoursesMasterContainer">
          <div className="pendingContentHeading">
            <h3>Faculty Summary</h3>
          </div>
          <div className="pendingCoursesContent">
            <div className="coursesContainer">
              <h4>Pending</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "scroll", 
                  gap: "10px",
                }}
              >
                {facutlySummaryData?.length > 0 &&
                  facutlySummaryData
                    .filter((data) => data.status === "0")
                    ?.map((allocation, index) => (
                      <div
                        key={index}
                        className="pendingListOptions"
                        style={{ display: "flex", gap: "5px" ,alignItems:"center"}}
                      >
                        <Circle sx={{height:"15px"}} />

                        <div className="pendingAllocationBullets">
                          <p style={{ flex: "0.35" }}>{allocation.faculty_id}</p>
                          {/* <p>-</p>
                          <p style={{ flex: "1" }}>{allocation.name}</p> */}
                        </div>
                      </div>
                    ))}
              </div>
            </div>
            <div className="coursesContainer">
              <h4>Approved</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "scroll",
                  gap: "10px",
                }}
              >
                {facutlySummaryData?.length > 0 &&
                  facutlySummaryData
                    .filter((data) => data.status === "1")
                    ?.map((allocation, index) => (
                      <div
                        key={index}
                        className="pendingListOptions"
                        style={{ display: "flex", gap: "5px" ,alignItems:"center"}}
                      >
                        <Circle sx={{height:"15px"}} />
                        <div className="pendingAllocationBullets">
                          <p style={{ flex: "0.35" }}>{allocation.faculty_id}</p>
                          {/* <p>-</p>
                          <p style={{ flex: "1" }}>{allocation.paper_count}</p> */}
                        </div>
                      </div>
                    ))}
                   
              </div>
            </div>
            <div className="coursesContainer">
              <h4>COE Approved</h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "scroll",
                  gap: "10px",
                }}
              >
                {facutlySummaryData?.length > 0 &&
                  facutlySummaryData
                    .filter((data) => data.status === "2")
                    ?.map((allocation, index) => (
                      <div
                        key={index}
                        className="pendingListOptions"
                        style={{ display: "flex", gap: "5px" ,alignItems:"center"}}
                      >
                        <Circle sx={{height:"15px"}} />
                        <div className="pendingAllocationBullets">
                          <p style={{ flex: "0.35" }}>{allocation.faculty_id}</p>
                          {/* <p>-</p>
                          <p style={{ flex: "1" }}>{allocation.paper_count}</p> */}
                        </div>
                        
                      </div>
                    ))}
                   
              </div>
            </div>
          
           
          </div>
        </div>
      </div> 
    </div>
  );
};

export default AllocationSummary;
