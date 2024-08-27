import React, { useState, useEffect } from "react";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import  MuiToolTip from "@mui/material/Tooltip";
import { PieArcLabel } from "@mui/x-charts";
import { Add, Approval, ArrowBack, Cancel, ChangeCircle, Circle, Done, Edit, Info, NotificationAdd, Send } from "@mui/icons-material";
import { Label } from "recharts";
import "./Dashboard.css";
import axios from "axios";
import Button from "../../components/button/Button";
import apiHost from "../../../config/config";
import Select from "react-select";
import { useCookies } from "react-cookie";
import { Box, Modal, TextareaAutosize, TextField } from "@mui/material";
import NoData from "../../components/noData/NoData";
import StyledModal from "../../components/modal/StyledModal";
import { toast,ToastContainer } from "react-toastify";
const Dashboard = (props) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectData, setSelectData] = useState([]);
  const [semesterCodes, setSemesterCodes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [year, setYear] = useState("");
  const [replace,setReplace] =  useState(false)
  const  [ceSelectionOpen,setCeSelectionOpen] =   useState(false);
  const [yearOptions, setYearOptions] = useState([]);
  const [batch, setBatch] = useState("");
  const [bcModalOpen, setBcModalOpen] = useState(false);
  const [ceModalOpen, setCeModalOpen] = useState(false);
  const [departmentId, setDepartmentId] = useState(null);
  const [selectedSemesterCode, setSelectedSemesterCode] = useState("");
  const [pendingFacultyApprovalCount, setPendingFacultyApprovalCount] =
    useState(0);
  const [pendingCoursesCount, setPendingCoursesCount] = useState(0);
  const [completedFacultyApprovalCount, setCompletedFacultyApprovalCount] =
    useState(0);
  const [pendingAllocations, setPendingAllocations] = useState([]);
  const [rejectedFacultyApprovalCount, setRejectedFacultyApprovalCount] =
    useState(0);
  const [allocatedCoursesCount, setAllocatedCoursesCount] = useState(0);
  const [boardChairman, setBoardChairman] = useState(null);
  const [chiefExaminers, setChiefExaminers] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [roles, setRoles] = useState([]);
  const [hodDetails, setHodDetails] = useState({});

  const [facultyOptions,setFacultyOptions] = useState([])
  const [selectedBcReplacement,setSelectedBcReplacement] = useState(null)
  const [selectedCeReplacement,setSelectedCeReplacement] = useState([])
  const [reason,setReason] = useState("");
  const [selectedCeAddition,setSelectedCeAddition] = useState(null)
  const fetchFacultyOptions = async (excludeId = []) => { 
    try {
        const params = {};
        
        if (excludeId.length > 0) {
            params.excludeId = excludeId; // Pass as an array if there are multiple ids
        }

        const response = await axios.get(`${apiHost}/api/faculty`, {
            params,
            headers: {
                auth: cookies.auth
            }
        });

        const processedFacultyOptions = response.data.map((data) => ({
            value: data.id,
            label: data.faculty_info
        }));

        setFacultyOptions(processedFacultyOptions);
    } catch (error) {
        toast.error("Couldn't Fetch Options");
        console.error("Error fetching faculty options:", error);
    }
};

const updateBoardChiefExaminer = async(mapping_id,faculty_id)=>{
  console.log(faculty_id)
  if(!mapping_id || !faculty_id){
    return toast.error("Couldn't Change CE")
  }
  
  else{
    try {
      await axios.put(`${apiHost}/api/board-chief-examiner`,{
        id:mapping_id,
        faculty:faculty_id
      },{
        headers:{
          auth:cookies.auth
        }
      }).then((res)=>{
        if(res.status ===200){
          toast.success(res.data.message)
          fetchBoardChiefExaminer()
        }
        else{
          toast.error(res.data.error || "Unable to Change CE")
        }
      })
    } catch (error) {
      return toast.error("Unable to Update CE")
    }
  }
}

const sendCeAddRequest = async(mapping_id,old_chief_examiner,new_chief_examiner)=>{

  if(!mapping_id || !old_chief_examiner || !new_chief_examiner){
     return toast.error("Insuffient Data Cannot Request")
  }
  else{
    
  }
}

const addBoardChairman = async(mapping_id,new_board_chairman)=>{
    if(!mapping_id,!new_board_chairman){
      return toast.error("Insufficient Data Cannot Change");
    }
    else{
      try {
         await axios.put(`${apiHost}/api/board-chairman`,{
          id:mapping_id,
          chairman : new_board_chairman
         },{
          headers:{
            auth:cookies.auth
          }
         }).then((res)=>{
          if(res.status === 200){
            toast.success(res.data.message)
            fetchBoardChairman()
            setBcModalOpen(false)
          }
          else{
            toast.error(res.data.message || "Unable to Update BC")
          }
         })
      } catch (error) {
          toast.error(error)
      }
    }
}

useEffect(()=>{
   console.log(facultyOptions)
},[facultyOptions])

useEffect(()=>{
  if(bcModalOpen){
    fetchFacultyOptions([boardChairman[0].faculty_id]);
  }
  else{
    if(selectedBcReplacement){
      setSelectedBcReplacement(null)
    }
  }
},[bcModalOpen])

useEffect(()=>{
  if(ceModalOpen || ceSelectionOpen){
    console.log([...chiefExaminers.map((data)=>(data.faculty_id)),boardChairman[0].faculty_id])
    fetchFacultyOptions([...chiefExaminers.map((data)=>(data.faculty_id)),boardChairman[0].faculty_id]);
  }
  else{
    if(selectedCeReplacement){
      setSelectedCeReplacement([])
    }
    if(selectedCeAddition){
      setSelectedCeAddition(null)
    }
  }
},[ceModalOpen,ceSelectionOpen])


useEffect(()=>{
  console.log(chiefExaminers)
},[chiefExaminers])

  useEffect(() => {
    props.setTitle("Dashboard");
  }, []);
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

  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (cookies.auth) {
          const response = await axios.get(`${apiHost}/auth/role`, {
            headers: {
              auth: cookies.auth,
            },
          });
          setRoles(response.data.roles);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchRole();
  }, [cookies.auth]);

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
  const fetchBoardChiefExaminer = async () => {
    try {
      const response = await axios.get(`${apiHost}/api/boardChiefExaminer`, {
        params: {
          departmentId: departmentId.value,
          semcode: selectedSemesterCode.value, // Replace with your selected department ID
        },
        headers: {
          Auth: cookies.auth,
        },
      });
      setChiefExaminers(response.data);
    } catch (error) {
      console.error("Error fetching board chief examiner:", error);
    }
  };
  useEffect(() => {
    if (!departmentId || !selectedSemesterCode) {
      return;
    }
    

    fetchBoardChiefExaminer();
  }, [departmentId, selectedSemesterCode, cookies.auth]);

useEffect(()=>{
    const newReplace = chiefExaminers.map(()=>(false))
    setReplace(newReplace)
},[chiefExaminers])

  useEffect(() => {
    const fetchPendingAllocations = async () => {
      if (!selectedSemesterCode || !departmentId) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/pendingAllocationsSummary`,
          {
            params: {
              semcode: selectedSemesterCode.value,
              department: departmentId.value,
            },
            headers: {
              Auth: cookies.auth,
            },
          }
        );
        console.log(response.data.pending_allocations);
        setPendingAllocations(response.data.pending_allocations_summary);
      } catch (error) {
        console.error("Error fetching pending allocations:", error);
      }
    };

    fetchPendingAllocations();
  }, [selectedSemesterCode, departmentId, cookies.auth]);

  useEffect(() => {
    const fetchPendingAllocationCount = async () => {
      if (!selectedSemesterCode || !departmentId) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/countPendingFacultyApprovals`,
          {
            params: {
              semcode: selectedSemesterCode.value,
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
      if (!selectedSemesterCode || !departmentId) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/countCompletedFacultyApprovals`,
          {
            params: {
              semcode: selectedSemesterCode.value,
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
      if (!selectedSemesterCode || !departmentId) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/countRejectedFacultyApprovals`,
          {
            params: {
              semcode: selectedSemesterCode.value,
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
      if (!selectedSemesterCode || !departmentId) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/countAllocatedCourses`,
          {
            params: {
              semcode: selectedSemesterCode.value,
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
      if (!selectedSemesterCode || !departmentId) {
        return;
      }
      try {
        const response = await axios.get(`${apiHost}/api/pendingAllocations`, {
          params: {
            semcode: selectedSemesterCode.value,
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
  }, [selectedSemesterCode, cookies.auth]);

  const fetchBoardChairman = async () => {
    if (!selectedSemesterCode || !departmentId) {
      return;
    }
    try {
      const response = await axios.get(`${apiHost}/api/boardChairman`, {
        params: {
          semcode: selectedSemesterCode.value,
          departmentId: departmentId.value,
        },
        headers: {
          Auth: cookies.auth,
        },
      });
      setBoardChairman(response.data);
    } catch (error) {
      console.error("Error fetching board chairman:", error);
    }
  };


  useEffect(() => {
    
    fetchBoardChairman();
  }, [selectedSemesterCode, departmentId, cookies.auth]);

  useEffect(() => {
    const fetchSemesterCodes = async () => {
      if (!batch || !year) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/semcodes?batch=${batch.value}&year=${year.value}`,
          {
            headers: {
              Auth: cookies.auth,
            },
          }
        );
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
  }, [batch, year, cookies.auth]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(`${apiHost}/years`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedYears = response.data.map((item) => ({
          value: item.id,
          label: item.year,
        }));
        setYearOptions(parsedYears);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
  }, [cookies.auth]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get(`${apiHost}/batches`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedBatches = response.data.map((item) => ({
          value: item.id,
          label: item.batch,
        }));
        setBatchOptions(parsedBatches);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchBatches();
  }, [cookies.auth]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiHost}/departments`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedDepartments = response.data.map((item) => ({
          value: item.id,
          label: item.department,
        }));
        setDepartments(parsedDepartments);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [cookies.auth]);

  return (
    <div style={{ width: "100%", height: "100%", padding: "10px 15px" }}>
      <ToastContainer/>
      <div
        className="selectContainer"
        style={{
          padding: " 15px 10px",
          borderRadius: "5px",
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
          margin: "10px 0px",
        }}
      >
        {roles.includes("coe") && (
          <div style={{ width: "30%", float: "right" }}>
            <Select
              placeholder="Select Department"
              value={departmentId}
              onChange={(selectedOption) => setDepartmentId(selectedOption)}
              options={departments}
              isClearable
            />
          </div>
        )}

        <div style={{ width: "30%", float: "right" }}>
          <Select
            placeholder="Select Year"
            value={year}
            onChange={(selectedOption) => setYear(selectedOption)}
            options={yearOptions}
            isClearable
          />
        </div>
        <div style={{ width: "30%", float: "right" }}>
          <Select
            placeholder="Select Batch"
            value={batch}
            onChange={(selectedOption) => setBatch(selectedOption)}
            options={batchOptions}
            isClearable
          />
        </div>
        <div style={{ width: "30%", float: "right" }}>
          <Select
            placeholder="Select SemCode"
            value={selectedSemesterCode}
            onChange={(selectedOption) =>
              setSelectedSemesterCode(selectedOption)
            }
            options={semesterCodes}
            isClearable
          />
        </div>
      </div>
      {!selectedSemesterCode && <NoData />}
      {selectedSemesterCode && (
        <>
          <div className="boardDetailsContainer">
            <div className="boardDetailsElement">
              <h2>Board Details</h2>
              {boardChairman && boardChairman.length > 0 ? (
                <ul>
                  <li>
                    Chairman - {boardChairman[0].chairman_name}
                    <div
                      onClick={() => {
                        setBcModalOpen(true);
                      }}
                      className="changeIcon"
                    >
                       <MuiToolTip title="Replace Board Chairman">
                      <ChangeCircle />
                      </MuiToolTip>
                    </div>
                  </li>
                  <li>Department - {boardChairman[0].department_name}</li>
                </ul>
              ) : (
                <p>No board chairman found </p>
              )}
            </div>

            {chiefExaminers && chiefExaminers.length > 0 ? (
              <div className="boardDetailsElement">
                <div className="boardChiefExaminers">
                  <h2>Board Chief Examiners </h2>
                  <MuiToolTip title="Edit Chief Examiners">
                  <Edit
                    onClick={() => {
                      setCeModalOpen(true);
                    }}
                    className="editIcon"
                  />
                  </MuiToolTip>
                </div>
                <ul>
                  {chiefExaminers.map((examiner) => (
                    <li key={examiner.id}>
                      {examiner.examiner_name} - {examiner.examiner_faculty_id}
                    </li>
                  ))}
                </ul>
                {/* Other dashboard content */}
              </div>
            ) : null}
          </div>

          <div className="allocationDashboardContainer">
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
                <Send/>
                </div>
                    
                </MuiToolTip>
                  </div>
               
                  <h4 style={{ textAlign: "center" }}>
                    Faculty Approvals Report
                  </h4>
                </div>
              </div>
            </div>
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
                  maxHeight: "400px",
                  minWidth: "400px",
                  overflowY: "scroll",
                  padding: "10px",
                  borderRadius: "5px",
                  marginTop: "10px",
                  boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
                }}
              >
                <div>
                  <h3>Pending Allocations</h3>
                  <br />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {pendingAllocations?.length > 0 &&
                      pendingAllocations?.map((allocation, index) => (
                        <div
                          key={index}
                          className="pendingListOptions"
                          style={{ display: "flex", gap: "5px" }}
                        >
                          <Circle />
                          {allocation.paper_count}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <StyledModal
  open={bcModalOpen}
  setOpen={setBcModalOpen}
  submitAction={() => {
    addBoardChairman(boardChairman[0].mapping_id,selectedBcReplacement.value);
  }}
  title={"Change Board Chairman"}
  content={
    <div className="bcAllocateModal">
      <Select
        menuPortalTarget={document.body}
        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
        value={selectedBcReplacement}
        onChange={setSelectedBcReplacement}
        options={facultyOptions}
      />
     
    </div>
  }
/>


          <StyledModal 

          open={ceModalOpen}
          
          setOpen={setCeModalOpen}

          title={
            "Modify C.E"
          }
           
          content={
            <div style={{display:"flex",flexDirection:'column',justifyContent:"space-around",gap:"10px"}}>
                 {(chiefExaminers && chiefExaminers.length > 0 && !ceSelectionOpen ) ? (
              <div className="boardDetailsElement">
                <div className="boardChiefExaminers">
                  <h2>Board Chief Examiners </h2>
                 
                </div>
                <ul style={{width:"100%"}}>
                  {chiefExaminers.map((examiner,index) => (
                    <li style={{display:"flex",justifyContent:"space-between",alignItems:"center"}} key={examiner.id}>
                    {replace[index]?
                    <div style={{width:"100%"}}>
                       <Select 
                        menuPortalTarget={document.body} 
                        onChange={(value)=>{setSelectedCeReplacement((prev)=>{
                          let newPrev = [...prev]
                          newPrev[index] = value
                          return(newPrev)

                        })}}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                       value={selectedCeReplacement?selectedCeReplacement[index]:null} options={facultyOptions} /> 
                    </div>
                       :
                        <>{examiner.examiner_name} - {examiner.examiner_faculty_id}</> 
                    }  
                    {
                      !replace[index]? <div className="changeCeIcons">
                      <Cancel onClick={{}}/>
                     <ChangeCircle onClick={()=>{setReplace((prev)=>{
                      let newPrev = [...prev];
                      newPrev[index]=true
                      return(newPrev)
                      })}}/> 
                     </div>:
                     <div className="changeCeIcons">
                     <Cancel onClick={()=>{setReplace((prev)=>{
                      let newPrev = [...prev];
                      newPrev[index]=false
                      return(newPrev)
                      })}}/>
                      <div>
                      <Done onClick={()=>{updateBoardChiefExaminer(examiner.mapping_id,selectedCeReplacement[index].value)}}/>
                      </div>
                     </div>
                    }
                   
                    </li>
                  ))}
                </ul>
                {/* Other dashboard content */}
              </div>
            ) : null}
            {
              ceSelectionOpen && <div style={{display:"flex",flexDirection:"column",gap:"10px"}}> 
                <Select value={selectedCeAddition} onChange={setSelectedCeAddition} options={facultyOptions}/>
                <p>Reason</p>
                <TextareaAutosize value={reason} onChange={(e)=>{setReason(e.value)}} style={{width:"100%"}}  minRows={5}/>
              </div>
            }
           
              <div style={{display:"flex",flexDirection:"column",justifyContent:"space-around",gap:"10px"}}>
                <div >
                  { ceSelectionOpen ?
 <Button onClick={
  ()=>{
    setCeSelectionOpen(false);
    setSelectedCeAddition(null)
  }
} size={"small"} label={
  <p style={{display:"flex",alignItems:"center"}} > <ArrowBack/> Go Back</p>
}>

</Button> :  <Button onClick={
                  ()=>{
                    setCeSelectionOpen(true);
                  }
                } size={"small"} label={
                  <p style={{display:"flex",alignItems:"center"}} > <Add/> Add C.E</p>
                }>
               
                </Button>
                  }
               
              
                    
                </div>
                {
                  ceSelectionOpen && <p style={{color:"orangered",display:"flex"}}>
                  <Info/> adding extra C.Es require COE approval
                  </p>
                }
               
              </div>
            </div>
          }

           />
        </>
      )}
    </div>
  );
};

export default Dashboard;
