import { useEffect, useState } from "react";
import "./ManageCourses.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import Select from "react-select";
import { TextField } from "@mui/material";
import Card from "../../../../components/card/Card";
import { Cancel, Check, Delete, Edit } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
const ManageCourses = () => {
  const [cookies, setCookie] = useCookies(["auth"]);
  const [courseData, setCourseData] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [regulationOptions, setRegulationOptions] = useState([]);
  const [filteredCoursesData, setFilteredCourses] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editCourseState, setEditCourseState] = useState([]);
  const [editCourseData, setEditCourseData] = useState([]);
  const [filters, setFilters] = useState({
    department: null,
    regulation: null,
    semester: null,
    status: null,
  });
  const [activeOptions, setActiveOptions] = useState([
    { value: "0", label: "InActive" },
    { value: "1", label: "Active" },
  ]);
  const fetchCourses = (query) => {
    axios
      .get(`${apiHost}/api/courses`, {
        params: {
          ...query,
        },
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        if (response.data) {
          setCourseData(response.data);
        }
      });
  };

  const fetchDepartments = () => {
    axios
      .get(`${apiHost}/departments`, {
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        setDepartmentOptions(
          response.data.map((data) => {
            return { value: data.id, label: data.department };
          })
        );
      });
  };

  const fetchRegulations = () => {
    axios
      .get(`${apiHost}/regulations`, {
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        setRegulationOptions(
          response.data.map((data) => {
            return { value: data.id, label: data.regulation };
          })
        );
      });
  };

  const fetchSemesters = () => {
    axios
      .get(`${apiHost}/semesters`, {
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        setSemesterOptions(
          response.data.map((data) => {
            return { value: data.id, label: data.semester };
          })
        );
      });
  };
  const filterCoursesData = () => {
    const lowercasedQuery = searchQuery.toLowerCase();

    setFilteredCourses(
      courseData.filter((course) => {
        return (
          course.course_name.toLowerCase().includes(lowercasedQuery) ||
          course.course_code.toLowerCase().includes(lowercasedQuery)
        );
      })
    );
  };

  useEffect(()=>{
     setEditCourseState(filteredCoursesData.map((_,i)=>{
        return(false);
     }))
     setEditCourseData(
      [...filteredCoursesData]
     )
  },[filteredCoursesData])

  useEffect(()=>{
     console.log(editCourseData)
  },[editCourseData])

  useEffect(() => {
    filterCoursesData();
  }, [courseData, searchQuery]);
  useEffect(() => {
    fetchCourses(filters);
    fetchDepartments();
    fetchRegulations();
    fetchSemesters();
  }, [cookies.auth, filters]);

  const handleEditCourse = (data)=>{
    try {

        axios.put(`${apiHost}/api/courses/${data.id}`, {...data}, {
          headers: {
            auth: cookies.auth,
          },
        }).then((response)=>{
          if(response.status===200){
            toast.success("Course edited successfully");
            fetchCourses();
          }
        });
       
    } catch (error) {
      

        toast.error("Failed to edit course" || error.message);

    }
  }
  
  const handleDeleteCourse = (data)=>{
         try {

          axios.delete(`${apiHost}/api/courses/${data.id}`, {
            headers: {
              auth: cookies.auth,
            },
          }).then((response)=>{
            if(response.status===200){
              toast.success("Course deleted successfully");
              fetchCourses();
            }
          })
          
         } catch (error) {
           toast.error("Failed to delete course" || error.message);
         }
  } 

  return (
    <div className="manageCoursesMasterContainer">
      <div className="manageCoursesSelectsContainerMaster">
        <Card
          content={
            <div className="manageCoursesSelectsContainer">
              <TextField
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value.trim());
                }}
                size="small"
                style={{
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
                placeholder="Search"
              />
              <Select
                isClearable
                value={departmentOptions.find(
                  (dept) => dept.id === filters.department
                )}
                onChange={(selectedOption) => {
                  setFilters((prev) => {
                    const newPrev = { ...prev };
                    newPrev.department = selectedOption?.value || null;
                    return newPrev;
                  });
                }}
                options={departmentOptions}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                placeholder="Department"
              />
              <Select
                isClearable
                values={regulationOptions.find(
                  (reg) => reg.id === filters.regulation
                )}
                onChange={(selectedOption) => {
                  setFilters((prev) => {
                    const newPrev = { ...prev };
                    newPrev.regulation = selectedOption?.value || null;
                    return newPrev;
                  });
                }}
                options={regulationOptions}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                placeholder="Regulation"
              />
              <Select
                isClearable
                options={semesterOptions}
                value={semesterOptions.find(
                  (sem) => sem.id === filters.semester
                )}
                onChange={(selectedOption) => {
                  setFilters((prev) => {
                    const newPrev = { ...prev };
                    newPrev.semester = selectedOption?.value || null;
                    return newPrev;
                  });
                }}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                placeholder="Semester"
              />
              <Select
                isClearable
                value={activeOptions.find(
                  (option) => option.id === filters.status
                )}
                options={activeOptions}
                menuPortalTarget={document.body}
                onChange={(selectedOption) => {
                  setFilters((prev) => {
                    const newPrev = { ...prev };
                    newPrev.status = selectedOption?.value || null;
                    return newPrev;
                  });
                }}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                placeholder="Status"
              />
            </div>
          }
        />
      </div>
      <div className="manageCoursesTableContainer">
        <table>
          <thead>
            <th>S.no</th>
            <th>Name</th>
            <th>Code</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Regulation</th>
            <th>Status</th>
          </thead>
          <tbody>
            {filteredCoursesData.map((data, index) => {
              return (
                !editCourseState?.[index]?
                <tr key={index}>
                  <td>
                    <div className="manageCoursesEditAndSNo">
                      <p>{index + 1}</p>
                      <div className="manageCoursesEditContainer">
                        <Edit  onClick={()=>{
                         setEditCourseState((prev) => {
                           const newPrev = [...prev];
                           newPrev[index] = true;
                           return newPrev;
                         });
                       }}  />
                        
                        <Delete 
                          onClick={()=>{
                            handleDeleteCourse(data);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{data.course_name}</td>
                  <td>{data.course_code}</td>
                  <td>
                    {
                      departmentOptions?.find(
                        (dept) => data.department === dept.value
                      )?.label
                    }
                  </td>
                  <td>
                    {
                      semesterOptions?.find(
                        (sem) => data.semester === sem.value
                      )?.label
                    }
                  </td>
                  <td>
                    {
                      regulationOptions?.find(
                        (reg) => data.regulation === reg.value
                      )?.label
                    }
                  </td>
                  <td>
                    {
                      activeOptions?.find(
                        (status) => data.status === status.value
                      )?.label
                    }
                  </td>
                </tr>:
                 <tr key={index}>
                 <td>
                   <div className="manageCoursesEditAndSNo">
                     <div className="manageCoursesCancelEditContainer">
                       <Cancel onClick={()=>{
                         setEditCourseState((prev) => {
                           const newPrev = [...prev];
                           newPrev[index] = false;
                           return newPrev;
                         });
                       }} />
                       <Check 
                       onClick={()=>{
                        handleEditCourse(editCourseData[index])
                       }}
                       />
                     </div>
                   </div>
                 </td>

                 <td>
                 <div className="editFaculyName">
                      <TextField
                         
                        style={{
                          maxWidth:200,
                          backgroundColor: "white",
                          borderRadius: "5px",
                        }}

                        
                        fullWidth={true}
                        size="small"
                        onChange={(e)=>{
                          setEditCourseData((prev) => {
                            const newPrev = [...prev];
                            newPrev[index] = {...prev[index], course_name: e.target.value };
                            return newPrev;
                          });
                        }}
                        value={editCourseData?.[index]?.course_name}
                      />
                    </div>
                 </td>
                 <td>
                 <div style={{width:"100%"}} className="editFaculyName">
                      <TextField
                       
                        style={{
                        maxWidth:200,
                          backgroundColor: "white",
                          borderRadius: "5px",
                        }}
                        fullWidth={true}
                        size="small"
                        onChange={(e)=>{
                          setEditCourseData((prev) => {
                            const newPrev = [...prev];
                            newPrev[index] = {...prev[index], course_code: e.target.value };
                            return newPrev;
                          });
                        }}
                        value={editCourseData?.[index]?.course_code}
                      />
                    </div>
                 </td>
                 <td>
                   <Select
                   value={departmentOptions.find((dept)=>(dept.value===editCourseData?.[index]?.department))}
                   placeholder="Department"
                   onChange={(selectedOption)=>{
                    setEditCourseData(
                      (prev) => {
                        const newPrev = [...prev];
                        newPrev[index] = {...prev[index], department: selectedOption.value };
                        return newPrev;
                      });
                    }}
                   options={departmentOptions}
                   />
                 </td>
                 <td>
                   <Select
                   value={semesterOptions.find((sem)=>(sem.value===editCourseData?.[index]?.semester))}
                   placeholder="Semester"
                   options={semesterOptions}
                   onChange={(selectedOption)=>{
                    setEditCourseData(
                      (prev) => {
                        const newPrev = [...prev];
                        newPrev[index] = {...prev[index], semester: selectedOption.value };
                        return newPrev;
                      });
                    }}
                   />
                 </td>
                 <td>
                   <Select
                   value={regulationOptions.find((reg)=>(reg.value===editCourseData?.[index]?.regulation))}
                   placeholder="Regulation"
                   options={regulationOptions}
                   onChange={(selectedOption)=>{
                    setEditCourseData(
                      (prev) => {
                        const newPrev = [...prev];
                        newPrev[index] = {...prev[index], regulation: selectedOption.value };
                        return newPrev;
                      });
                    }}
                   />
                 </td>
                 <td>
                   <Select
                   value={activeOptions.find((status)=>(status.value===editCourseData?.[index]?.status))}
                   placeholder="Status"
                   options={activeOptions}
                   onChange={(selectedOption)=>{
                    setEditCourseData(
                      (prev) => {
                        const newPrev = [...prev];
                        newPrev[index] = {...prev[index], status: selectedOption.value };
                        return newPrev;
                      });
                    }}
                   />
                 </td>
               </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;
