import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Cell,Legend } from 'recharts';
import { Container, Grid, Button, MenuItem } from '@mui/material';
import { PieArcLabel } from '@mui/x-charts';
import { Circle } from '@mui/icons-material';
import { Label } from 'recharts';
import './FacultyAllocationDashboard.css';
import axios from 'axios';
import apiHost from '../../config/config';
import Select from 'react-select';
const FacultyAllocationDashboard = () => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectData, setSelectData] = useState([]);
  const [semesterCodes, setSemesterCodes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [year, setYear] = useState("");
  const [yearOptions, setYearOptions] = useState([]);
  const [batch, setBatch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [selectedSemesterCode, setSelectedSemesterCode] = useState("");
  const [pendingFacultyApprovalCount, setPendingFacultyApprovalCount] = useState(0);
  const [pendingCoursesCount, setPendingCoursesCount] = useState(0);
  const [completedFacultyApprovalCount, setCompletedFacultyApprovalCount] = useState(0);
  const [pendingAllocations, setPendingAllocations] = useState([]);
  const [rejectedFacultyApprovalCount, setRejectedFacultyApprovalCount] = useState(0);
  const [allocatedCoursesCount, setAllocatedCoursesCount] = useState(0);
  const [boardChairman, setBoardChairman] = useState(null);
  const [chiefExaminers, setChiefExaminers] = useState([]);
  const data = [
      { name: 'Allocated', students: allocatedCoursesCount },
      { name: 'Pending Allocation', students: pendingCoursesCount },
  ];

  const data2 = [
      { name: 'Approved', students: completedFacultyApprovalCount},
      { name: 'Pending Approvals', students: pendingFacultyApprovalCount },
      { name: 'Rejected', students: rejectedFacultyApprovalCount },
  ];

  const COLORS = ['#0d0030', 'orangered'];
  const COLORS2 = ['#0d0030','blue','orangered'];

  const onPieEnter = (_, index) => {
      setActiveIndex(index);
  };
  useEffect(() => {
    if(!departmentId || !selectedSemesterCode){
      return;
    }
    const fetchBoardChiefExaminer = async () => {
        try {
            const response = await axios.get(`${apiHost}/api/boardChiefExaminer`, {
                params: {
                    departmentId: departmentId.value, 
                    semcode : selectedSemesterCode.value// Replace with your selected department ID
                },
            });
            setChiefExaminers(response.data);
        } catch (error) {
            console.error('Error fetching board chief examiner:', error);
        }
    };

    fetchBoardChiefExaminer();
}, [departmentId,selectedSemesterCode]);
  useEffect(() => {
    const fetchPendingAllocations = async () => {
        if (!selectedSemesterCode || !departmentId) {
            return;
        }
        try {
            const response = await axios.get(`${apiHost}/api/pendingAllocationsSummary`, {
                params: {
                    semcode: selectedSemesterCode.value,
                    department: departmentId.value
                },
            });
            console.log(response.data.pending_allocations)
            setPendingAllocations(response.data.pending_allocations_summary);
        } catch (error) {
            console.error('Error fetching pending allocations:', error);
        }
    };

    fetchPendingAllocations();
}, [selectedSemesterCode, departmentId]);

  useEffect(() => {
      const fetchPendingAllocationCount = async () => {
          if (!selectedSemesterCode || !departmentId) {
              return;
          }
          try {
              const response = await axios.get(`${apiHost}/api/countPendingFacultyApprovals`, {
                  params: {
                      semcode: selectedSemesterCode.value,
                      department:departmentId.value
                  },
              });
              console.log(response.data.record_count)
              setPendingFacultyApprovalCount(response.data.record_count);
          } catch (error) {
              console.error('Error fetching pending allocation count:', error);
          }
      };
      const fetchApprovedAllocationCount = async () => {
        if (!selectedSemesterCode || !departmentId) {
            return;
        }
        try {
            const response = await axios.get(`${apiHost}/api/countCompletedFacultyApprovals`, {
                params: {
                    semcode: selectedSemesterCode.value,
                    department:departmentId.value
                },
            });
            console.log(response.data.record_count)
            setCompletedFacultyApprovalCount(response.data.record_count);
        } catch (error) {
            console.error('Error fetching pending allocation count:', error);
        }
    };
    const fetchRejectedAllocationCount = async () => {
      if (!selectedSemesterCode || !departmentId) {
          return;
      }
      try {
          const response = await axios.get(`${apiHost}/api/countRejectedFacultyApprovals`, {
              params: {
                  semcode: selectedSemesterCode.value,
                  department:departmentId.value
              },
          });
          console.log(response.data.record_count)
          setRejectedFacultyApprovalCount(response.data.record_count);
      } catch (error) {
          console.error('Error fetching pending allocation count:', error);
      }
  };
  const fetchCourseAllocationCount = async () => {
    if (!selectedSemesterCode || !departmentId) {
        return;
    }
    try {
        const response = await axios.get(`${apiHost}/api/countAllocatedCourses`, {
            params: {
                semcode: selectedSemesterCode.value,
                department:departmentId.value
            },
        });
        console.log(response.data.record_count)
        setAllocatedCoursesCount(response.data.unique_course_count);
    } catch (error) {
        console.error('Error fetching pending allocation count:', error);
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
              department:departmentId.value
          },
      });
      setPendingCoursesCount(response.data.pending_allocations);
  } catch (error) {
      console.error('Error fetching pending allocation count:', error);
  }
};

      fetchPendingAllocationCount();
      fetchApprovedAllocationCount();
      fetchRejectedAllocationCount();
      fetchCourseAllocationCount();
      fetchPendingCourseAllocationCount();
      
  }, [selectedSemesterCode]);
  useEffect(() => {
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
            });
            setBoardChairman(response.data);
        } catch (error) {
            console.error('Error fetching board chairman:', error);
        }
    };

    fetchBoardChairman();
}, [selectedSemesterCode, departmentId]);

  useEffect(() => {
      const fetchSemesterCodes = async () => {
          if(!batch || !year){
              return;
          }
          try {
              const response = await axios.get(`${apiHost}/api/semcodes?batch=${batch.value}&year=${year.value}`);
              const parsedCodes = response.data.results.map(item => ({
                  value: item.id,
                  label: item.semcode,
              }));
              setSemesterCodes(parsedCodes);
          } catch (error) {
              console.error('Error fetching semester codes:', error);
          }
      };

      fetchSemesterCodes();
  }, [batch, year]);

  useEffect(() => {
      const fetchYears = async () => {
          try {
              const response = await axios.get(`${apiHost}/years`);
              const parsedYears = response.data.map(item => ({
                  value: item.id,
                  label: item.year,
              }));
              setYearOptions(parsedYears);
          } catch (error) {
              console.error('Error fetching years:', error);
          }
      };

      fetchYears();
  }, []);

  useEffect(() => {
      const fetchBatches = async () => {
          try {
              const response = await axios.get(`${apiHost}/batches`);
              const parsedBatches = response.data.map(item => ({
                  value: item.id,
                  label: item.batch,
              }));
              setBatchOptions(parsedBatches);
          } catch (error) {
              console.error('Error fetching batches:', error);
          }
      };

      fetchBatches();
  }, []);

  useEffect(() => {
      const fetchDepartments = async () => {
          try {
              const response = await axios.get(`${apiHost}/departments`);
              const parsedDepartments = response.data.map(item => ({
                  value: item.id,
                  label: item.department,
              }));
              setDepartments(parsedDepartments);
          } catch (error) {
              console.error('Error fetching departments:', error);
          }
      };

      fetchDepartments();
  }, []);

  return (
      <div style={{ width: '100%', height: "100%" }}>
          <div style={{ padding: "10px" }}>
              <h1>Faculty Allocation Dashboard</h1>
          </div>
          <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', gap: "10px", justifyContent: 'flex-end', width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
              <div style={{ width: '30%', float: 'right', marginLeft: '20px' }}>
                  <Select
                      placeholder="Select Department"
                      value={departmentId}
                      onChange={(selectedOption) => setDepartmentId(selectedOption)}
                      options={departments}
                      isClearable
                  />
              </div>
              <div style={{ width: '30%', float: 'right' }}>
                  <Select
                      placeholder="Select Year"
                      value={year}
                      onChange={(selectedOption) => setYear(selectedOption)}
                      options={yearOptions}
                      isClearable
                  />
              </div>
              <div style={{ width: '30%', float: 'right' }}>
                  <Select
                      placeholder="Select Batch"
                      value={batch}
                      onChange={(selectedOption) => setBatch(selectedOption)}
                      options={batchOptions}
                      isClearable
                  />
              </div>
              <div style={{ width: '30%', float: 'right' }}>
                  <Select
                      placeholder="Select SemCode"
                      value={selectedSemesterCode}
                      onChange={(selectedOption) => setSelectedSemesterCode(selectedOption)}
                      options={semesterCodes}
                      isClearable
                  />
              </div>
          </div>
          <div style={{ padding: "20px", textAlign: "center" ,display:"flex",justifyContent:"space-between"}}>
            <div>
           
    <h2>Board Details</h2>
    {boardChairman && boardChairman.length > 0 ? (
        <div style={{display:"flex",justifyContent:"center",gap:"20px"}}>
            <p><strong>Chairman:</strong> {boardChairman[0].chairman_name}</p>
            <p><strong>Department:</strong> {boardChairman[0].department_name}</p>
        </div>
    ) : (
        <p>No board chairman found </p>
    )}   
            </div>
    {
      chiefExaminers && chiefExaminers.length>0 ?(    <div>
      <h3>Board Chief Examiners</h3>
      <ul>
          {chiefExaminers.map((examiner) => (
              <li key={examiner.id}>{examiner.examiner_name} - {examiner.examiner_faculty_id}</li>
          ))}
      </ul>
      {/* Other dashboard content */}
  </div>
      ):null
    }
</div>

          <div className='allocationDashboardContainer'>
              <div style={{ display: 'flex', flexWrap: "wrap", width: '100%', gap: "10px", alignItems: 'center', justifyContent: "center", height: "50%", padding: "20px", paddingBottom: "0px", boxSizing: "border-box" }}>
                  <div className='piechartContainer'>
                      <div>
                          <PieChart width={250} height={250}>
                              <Pie
                                  activeIndex={activeIndex}
                                  data={data}
                                  dataKey="students"
                                  fill="green"
                                  onMouseEnter={onPieEnter}
                                  style={{ cursor: 'pointer', outline: 'none' }} // Ensure no outline on focus
                              >
                                  {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                              <Legend  wrapperStyle={{fontSize: "12px",width:"100%"}} align="left" />
                          </PieChart>
                          <h4 style={{ textAlign: "center" }}>Allocations Report</h4>
                      </div>
                  </div>
                  <div className='piechartContainer'>
                      <div>
                          <PieChart width={350} height={250}>
                              <Pie
                                  activeIndex={activeIndex}
                                  data={data2}
                                  dataKey="students"
                                  fill="green"
                                  onMouseEnter={onPieEnter}
                                  style={{ cursor: 'pointer', outline: 'none' }} // Ensure no outline on focus
                              >
                                  {data2.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                              <Legend wrapperStyle={{fontSize: "12px",width:"100%"}} align="left" />
                          </PieChart>
                          <h4 style={{ textAlign: "center" }}>Faculty Approvals Report</h4>
                      </div>
                  </div>
              </div>
              <div style={{display:"flex",gap:"10px",padding:"20px",paddingTop:"0px",flexWrap:"wrap"}}>
              <div style={{ flex:"1", backgroundColor: 'white',maxHeight:"400px",minWidth:"400px",overflowY:"scroll", padding: '10px', borderRadius: '5px', marginTop: "10px", boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}>
                <div>
                  <h3>Pending Allocations</h3>
                  <br />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pendingAllocations?.length>0 && pendingAllocations?.map((allocation, index) => (
                          <div key={index} className='pendingListOptions' style={{ display: 'flex', gap: '5px' }}>
                              <Circle />
                               {allocation.paper_count}
                          </div>
                      ))}
                  </div>
              </div>
              </div> 
            
              {/* <div style={{ flex:"1",backgroundColor: 'white',minWidth:"400px",maxHeight:"400px",overflowY:"scroll", padding: '10px', borderRadius: '5px', marginTop: "10px", boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px" }}>
                  <h3>Pending Allocations</h3>
                  <br />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pendingAllocations.length>0 && pendingAllocations.map((allocation, index) => (
                          <div key={index} className='pendingListOptions' style={{ display: 'flex', gap: '5px' }}>
                              <Circle />
                               {allocation.paper_count}
                          </div>
                      ))}
                  </div>
              </div>
              */}
              </div>
          </div>
      </div>
  );
};

export default FacultyAllocationDashboard;
