import { TextField } from "@mui/material";
import "./ManageFCM.css";
import Select from "react-select";
import { useEffect, useState } from "react";
import apiHost from "../../../../../config/config";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Cancel, ChangeCircle, Check, Delete } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
const ManageFCM = () => {
  const [fcmTableData, setFcmTableData] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [filteredFCMTableData, setFilteredFCMTableData] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isReplacingState, setIsReplacingState] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseReplaceOptions, setCourseReplaceOptions] = useState([]);
  const [selectedCourseReplaceOptions, setSelectedCourseReplaceOptions] =
    useState([]);
  const fetchFcmTableData = () => {
    axios
      .get(`${apiHost}/api/facultyCourseMapping`, {
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        setFcmTableData(response.data);
      });
  };

  useEffect(() => {
    fetchFcmTableData();
  }, [cookies.auth]);

  const initializeReplaceStates = () => {
    setIsReplacingState(
      filteredFCMTableData.map((data, i) => {
        return false;
      })
    );
  };

  const initializeCourseReplaceSuggestions = () => {
    setCourseReplaceOptions(
      filteredFCMTableData.map((data, i) => {
        return [];
      })
    );
    setSelectedCourseReplaceOptions(
      filteredFCMTableData.map((data, i) => {
        return {};
      })
    );
  };

  useEffect(() => {
    initializeReplaceStates();
    initializeCourseReplaceSuggestions();
  }, [filteredFCMTableData]);

  useEffect(() => {
    axios
      .get(`${apiHost}/departments`, {
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        setDepartmentOptions(
          response.data.map((data) => {
            return {
              value: data.id,
              label: data.department,
            };
          })
        );
      });
  }, [cookies.auth]);

  const filterData = (searchQuery, checks) => {
    setFilteredFCMTableData(
      fcmTableData.filter((data) => {
        return (
          (checks[0] &&
            data.facultyName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (checks[1] &&
            data.courseCode
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (checks[2] &&
            data.facultyCode
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (checks[3] &&
            data.department.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
    );
  };

  const handleChangeCourse = (mappingId, courseId) => {
    axios
      .put(
        `${apiHost}/api/facultyCourseMapping/${Number(mappingId)}`,
        {
          course: courseId,
        },
        {
          headers: {
            auth: cookies.auth,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          toast.success(response.data.message || "successfully updated course");
          fetchFcmTableData();
        }
      });
  };

  useEffect(() => {
    filterData(searchQuery, [true, true, true, true]);
  }, [searchQuery, fcmTableData]);

  const handleDeleteFCM = (mappingId)=>{
    console.log(mappingId);
    axios.delete(`${apiHost}/api/facultyCourseMapping/${Number(mappingId)}`,{
      headers:{
        auth: cookies.auth,
      }
    }).then((response)=>{
      if(response.status===200){
        toast.success(response.data.message || "Successfully deleted FCM mapping");
        fetchFcmTableData();
      }
    })
  }


  return (
    <div className="fcmPageContainer">
      <div className="fcmSelectContainer">
        <TextField
          size="small"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value.trim());
          }}
          placeholder="Search"
          style={{ backgroundColor: "white", borderRadius: "5px" }}
        />
        <Select
          onChange={(value) => {
            filterData(value.label, [false, false, false, true]);
          }}
          options={departmentOptions}
          placeholder="Department"
        />
      </div>
      <div className="fcmTableContainer">
        <table>
          <thead>
            <th>S.no</th>
            <th>Faculty</th>
            <th>Faculty ID</th>
            <th>Department</th>
            <th>Course</th>
          </thead>
          <tbody>
            {filteredFCMTableData.map((data, i) => {
              return (
                <tr>
                  <td>{i + 1}</td>
                  <td>{data.facultyName}</td>
                  <td>{data.facultyCode}</td>
                  <td>{data.department}</td>
                  <td>
                    <div className="fcmEditCoursesContainer">
                      {isReplacingState[i] ? (
                        <Select options={courseReplaceOptions[i]}
                        onChange={(value)=>{
                          setSelectedCourseReplaceOptions((prev) => {
                              const newPrev = [...prev ];
                              newPrev[i] = value;
                              return newPrev;
                            });
                        }} />
                      ) : (
                        <div>{data.courseCode}</div>
                      )}
                      {
                        <div>
                          {isReplacingState[i] ? (
                            <Cancel
                              onClick={() => {
                                setIsReplacingState((prev) => {
                                  const newPrev = [...prev];
                                  newPrev[i] = false;
                                  return newPrev;
                                });
                              }}
                            />
                          ) : (
                            <ChangeCircle
                              onClick={async () => {
                                await axios
                                  .get(
                                    `${apiHost}/api/facultyCoursesMappingNotMapped/${data.facultyId}`,
                                    {
                                      headers: {
                                        auth: cookies.auth,
                                      },
                                    }
                                  )
                                  .then((response) => {
                                    setCourseReplaceOptions((prevReplace) => {
                                      const newPrevReplace = [...prevReplace];
                                      newPrevReplace[i] = response.data.map(
                                        (data) => {
                                          return {
                                            value: data.courseId,
                                            label: data.courseCode,
                                          };
                                        }
                                      );
                                      return newPrevReplace;
                                    });
                                  });
                                setIsReplacingState((prev) => {
                                  const newPrev = [...prev];
                                  newPrev[i] = true;
                                  return newPrev;
                                });
                              }}
                            />
                          )}

                          {isReplacingState[i] ? (
                            <Check
                              onClick={() => {
                                handleChangeCourse(
                                  data.mappingId,
                                  selectedCourseReplaceOptions[i].value,
                                );
                              }}
                            />
                          ) : (
                            <Delete
                             onClick={
                             ()=>{
                              handleDeleteFCM(data.mappingId);
                             }
                             }
                            
                            />
                          )}
                        </div>
                      }
                    </div>
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

export default ManageFCM;
