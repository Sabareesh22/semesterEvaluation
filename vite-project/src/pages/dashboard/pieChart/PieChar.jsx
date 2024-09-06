import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import { PieArcLabel } from "@mui/x-charts";
import { useState,useEffect } from "react";
import axios from "axios";
import MuiToolTip from "@mui/material/Tooltip";
import apiHost from "../../../../config/config";
import { useCookies } from "react-cookie";
import { Send } from "@mui/icons-material";
const PieChartContainer = ({semesterCode,departmentId,roles,chiefExaminers,setRoles,setChiefExaminers})=>{
  const [activeIndex, setActiveIndex] = useState(-1);
  const [replace, setReplace] = useState(false);
    const[cookies,setCookie] = useCookies(['auth']);
    const [pendingFacultyApprovalCount, setPendingFacultyApprovalCount] =
    useState(0);
  const [pendingCoursesCount, setPendingCoursesCount] = useState(0);
  const [completedFacultyApprovalCount, setCompletedFacultyApprovalCount] =
    useState(0);
  const [rejectedFacultyApprovalCount, setRejectedFacultyApprovalCount] =
    useState(0);
  const [allocatedCoursesCount, setAllocatedCoursesCount] = useState(0);

    const data = [
        { name: "Allocated", students: allocatedCoursesCount },
        { name: "Pending Allocation", students: pendingCoursesCount },
      ];
    
      const data2 = [
        { name: "Approved", students: completedFacultyApprovalCount },
        { name: "Pending Approvals", students: pendingFacultyApprovalCount },
        { name: "Rejected", students: rejectedFacultyApprovalCount },
      ];
      const COLORS = ["#0d0030", "orangered"];
      const COLORS2 = ["#0d0030", "blue", "orangered"];
    
      const onPieEnter = (_, index) => {
        setActiveIndex(index);
      };

      useEffect(() => {
        try {
          if (roles.includes("hod") && !roles.includes("coe")) {
            axios
              .get(`${apiHost}/auth/hodDetails`, {
                headers: {
                  Auth: cookies.auth,
                },
              })
              .then((res) => {
                console.log(res.data[0]);
                setHodDetails(res.data[0]);
                setDepartmentId({ value: res.data[0]?.department });
              });
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      }, [cookies.auth, roles]);
    

    
      const fetchBoardChiefExaminer = async () => {
        try {
          const response = await axios.get(`${apiHost}/api/boardChiefExaminer`, {
            params: {
              departmentId: departmentId,
              semcode: semesterCode, // Replace with your selected department ID
            },
            headers: {
              Auth: cookies.auth,
            },
          });
          console.log(response.data);
          setChiefExaminers(response.data);
        } catch (error) {
          console.error("Error fetching board chief examiner:", error);
        }
      };
      useEffect(() => {
        if (!departmentId || !semesterCode) {
          return;
        }
    
        fetchBoardChiefExaminer();
      }, [departmentId, semesterCode, cookies.auth]);
    
      useEffect(() => {
        const newReplace = chiefExaminers.map(() => false);
        setReplace(newReplace);
      }, [chiefExaminers]);
    
    
    
      useEffect(() => {
        const fetchPendingAllocationCount = async () => {
          if (!semesterCode || !departmentId) {
            return;
          }
          try {
            const response = await axios.get(
              `${apiHost}/api/countPendingFacultyApprovals`,
              {
                params: {
                  semcode: semesterCode.value,
                  department: departmentId.value,
                },
                headers: {
                  Auth: cookies.auth,
                },
              }
            );
            console.log(response.data.record_count);
            setPendingFacultyApprovalCount(response.data.record_count);
          } catch (error) {
            console.error("Error fetching pending allocation count:", error);
          }
        };
        const fetchApprovedAllocationCount = async () => {
          if (!semesterCode || !departmentId) {
            return;
          }
          try {
            const response = await axios.get(
              `${apiHost}/api/countCompletedFacultyApprovals`,
              {
                params: {
                  semcode: semesterCode.value,
                  department: departmentId.value,
                },
                headers: {
                  Auth: cookies.auth,
                },
              }
            );
            console.log(response.data.record_count);
            setCompletedFacultyApprovalCount(response.data.record_count);
          } catch (error) {
            console.error("Error fetching pending allocation count:", error);
          }
        };
        const fetchRejectedAllocationCount = async () => {
          if (!semesterCode || !departmentId) {
            return;
          }
          try {
            const response = await axios.get(
              `${apiHost}/api/countRejectedFacultyApprovals`,
              {
                params: {
                  semcode: semesterCode.value,
                  department: departmentId.value,
                },
                headers: {
                  Auth: cookies.auth,
                },
              }
            );
            console.log(response.data.record_count);
            setRejectedFacultyApprovalCount(response.data.record_count);
          } catch (error) {
            console.error("Error fetching pending allocation count:", error);
          }
        };
        const fetchCourseAllocationCount = async () => {
          if (!semesterCode || !departmentId) {
            return;
          }
          try {
            const response = await axios.get(
              `${apiHost}/api/countAllocatedCourses`,
              {
                params: {
                  semcode: semesterCode.value,
                  department: departmentId.value,
                },
                headers: {
                  Auth: cookies.auth,
                },
              }
            );
            console.log(response.data.record_count);
            setAllocatedCoursesCount(response.data.unique_course_count);
          } catch (error) {
            console.error("Error fetching pending allocation count:", error);
          }
        };
    
        const fetchPendingCourseAllocationCount = async () => {
          if (!semesterCode || !departmentId) {
            return;
          }
          try {
            const response = await axios.get(`${apiHost}/api/pendingAllocations`, {
              params: {
                semcode: semesterCode.value,
                department: departmentId.value,
              },
              headers: {
                Auth: cookies.auth,
              },
            });
            setPendingCoursesCount(response.data.pending_allocations);
          } catch (error) {
            console.error("Error fetching pending allocation count:", error);
          }
        };
    
        fetchPendingAllocationCount();
        fetchApprovedAllocationCount();
        fetchRejectedAllocationCount();
        fetchCourseAllocationCount();
        fetchPendingCourseAllocationCount();
      }, [, cookies.auth]);
    return(
        <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                width: "100%",
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
                height: "50%",
                paddingTop: "20px",
                boxSizing: "border-box",
              }}
            >
              <div className="piechartContainer">
                <div>
                  <PieChart width={250} height={250}>
                    <Pie
                      activeIndex={activeIndex}
                      data={data}
                      dataKey="students"
                      fill="green"
                      onMouseEnter={onPieEnter}
                      style={{ cursor: "pointer", outline: "none" }} // Ensure no outline on focus
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", width: "100%" }}
                      align="left"
                    />
                  </PieChart>
                  <h4 style={{ textAlign: "center" }}>Allocations Report</h4>
                </div>
              </div>

              <div className="piechartContainer">
                <div>
                  <div className="facultyPie">
                    <PieChart width={350} height={250}>
                      <Pie
                        activeIndex={activeIndex}
                        data={data2}
                        dataKey="students"
                        fill="green"
                        onMouseEnter={onPieEnter}
                        style={{ cursor: "pointer", outline: "none" }} // Ensure no outline on focus
                      >
                        {data2.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS2[index % COLORS2.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", width: "100%" }}
                        align="left"
                      />
                    </PieChart>

                    <MuiToolTip title="Send Notfications to Faculty">
                      <div className="sendNotifactionsContainer">
                        <Send />
                      </div>
                    </MuiToolTip>
                  </div>

                  <h4 style={{ textAlign: "center" }}>
                    Faculty Approvals Report
                  </h4>
                </div>
              </div>
            </div>
    )
}

export default PieChartContainer