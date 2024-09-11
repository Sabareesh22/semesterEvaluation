import { TextField } from "@mui/material";
import "./ManageFCM.css";
import Select from "react-select";
import { useEffect, useState } from "react";
import apiHost from "../../../../config/config";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Cancel, ChangeCircle, Check, Delete } from "@mui/icons-material";
const ManageFCM = () => {
  const [fcmTableData, setFcmTableData] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [filteredFCMTableData, setFilteredFCMTableData] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isReplacingState, setIsReplacingState] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get(`${apiHost}/api/facultyCourseMapping`, {
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        setFcmTableData(response.data);
      });
  }, [cookies.auth]);

  const initializeReplaceStates = () => {
    setIsReplacingState(
      filteredFCMTableData.map((data, i) => {
        return false;
      })
    );
  };

  useEffect(() => {
    initializeReplaceStates();
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

  useEffect(() => {
    filterData(searchQuery, [true, true, true, true]);
  }, [searchQuery, fcmTableData]);

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
                      {isReplacingState[i]?<Select/>:<div>{data.courseCode}</div>}
                      {<div>
                        {isReplacingState[i]?
                        <Cancel
                        onClick ={()=>{
                          setIsReplacingState((prev)=>{
                            const newPrev = [...prev]
                            newPrev[i] = false
                            return newPrev
                          })
                        }}
                        />:
                        <ChangeCircle onClick ={()=>{
                          setIsReplacingState((prev)=>{
                            const newPrev = [...prev]
                            newPrev[i] = true
                            return newPrev
                          })
                        }} />} {
                           isReplacingState[i]?
                           <Check/>:
                          <Delete />
                          }
                      </div>}
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
