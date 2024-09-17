import { useEffect, useState } from "react";
import "./ManageBoardCourses.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import dayjs from "dayjs";
import { TextField } from "@mui/material";
import Select from "react-select";
import NoData from "../../../../components/noData/NoData";
import { Cancel, Check, Delete, Edit } from "@mui/icons-material";
import { toast } from "react-toastify";
const ManageBoardCourses = () => {
  const [departments, setDepartments] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [semCodeOptions, setSemcodeOptions] = useState([]);
  const [boardCoursesData, setBoardCoursesData] = useState([]);
  const [filteredBoardCoursesData, setFilteredBoardCoursesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editBoardCoursesState, setEditBoardCoursesState] = useState([]);
  const [editBoardCoursesData, setEditBoardCoursesData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSemcode, setSelectedSemcode] = useState(null);
  useEffect(() => {
    setFilteredBoardCoursesData(
      boardCoursesData.filter((data) => {
        return (
          data?.department_name
            ?.toLowerCase()
            .includes(searchQuery?.toLowerCase()) ||
          data?.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    );
  }, [boardCoursesData, searchQuery]);
  const handleEditBoardCourseData = (data) => {
    const modifiedData  = {
    paper_count: data.paper_count
    }
    try {
      axios
        .put(`${apiHost}/api/boardCourseMapping/${data.id}`, modifiedData, {
          headers: {
            auth: cookies.auth,
          },
        })
        .then((response) => {
          toast.success(response.data.message ||"Successfully Edited" );
          fetchBoardCourseMapping();
        });
    } catch (error) {
      toast.error(error.message || "Failed to edit");
    }
  };

  const deleteBoardCourseMapping = (data)=>{
    try {
      axios
       .delete(`${apiHost}/api/boardCourseMapping/${data.id}`, {
          headers: {
            auth: cookies.auth,
          },
        })
       .then((response) => {
          toast.success(response.data.message || "Successfully Deleted");
          fetchBoardCourseMapping();
        });
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  }

  useEffect(() => {
    setEditBoardCoursesState(
      filteredBoardCoursesData.map((_, i) => {
        return false;
      })
    );
    setEditBoardCoursesData(
      filteredBoardCoursesData.map((data, i) => {
        return {
          id: data.id,
          department: data.department,
          course: data.course,
          paper_count: data.paper_count,
          semcode: data.semcode,
          batch: data.batch,
          start_date: data.start_date,
          end_date: data.end_date,
          in_charge: data.in_charge,
          time_in_days: data.time_in_days,
          status: data.status,
          course_code: data.course_code,
          department_name: data.department_name,
        };
      })
    );
  }, [filteredBoardCoursesData]);

  useEffect(() => {
    console.log(editBoardCoursesData);
  }, [editBoardCoursesData]);
  const fetchSemcodes = (params) => {
    axios
      .get(`${apiHost}/api/semcodes`, {
        params: {
          params,
        },
        headers: {
          Auth: cookies.auth,
        },
      })
      .then((response) => {
        console.log(response.data.results);
        setSemcodeOptions(
          response.data.results.map((data, index) => ({
            value: data.id,
            label: data.semcode,
          }))
        );
      });
  };

  useEffect(() => {
    fetchSemcodes();
    fetchDepartments();
  }, [cookies.auth]);

  const fetchBoardCourseMapping = (params) => {
    setBoardCoursesData([]);
    axios
      .get(`${apiHost}/api/boardCourseMapping`, {
        params: {
          ...params,
        },
        headers: {
          Auth: cookies.auth,
        },
      })
      .then((response) => {
        console.log(response);
        setBoardCoursesData(response.data);
      });
  };

  useEffect(() => {
    if (selectedDepartment || selectedSemcode) {
      fetchBoardCourseMapping({
        department: selectedDepartment?.value,
        semcode: selectedSemcode?.value,
      });
    }
  }, [selectedDepartment, selectedSemcode]);

  // useEffect(() => {
  //    fetchBoardCourseMapping(); //
  // }, [cookies.auth]);
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

  return (
    <div className="bcPageMasterContainer">
      <div className="bcSelectContainer">
        <TextField
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value.trim());
          }}
          placeholder={"Search"}
          size="small"
          style={{ backgroundColor: "white", borderRadius: "5px" }}
        />
        <Select
          isClearable
          value={selectedSemcode}
          onChange={(value) => {
            setSelectedSemcode(value);
          }}
          options={semCodeOptions}
          placeholder="SemCode"
        />
        <Select
          value={selectedDepartment}
          placeholder="Board"
          onChange={(selectedOption) => {
            setSelectedDepartment(selectedOption);
          }}
          options={departments}
          isClearable
        />
      </div>
      <div>
        {filteredBoardCoursesData.length > 0 ? (
          <table>
            <thead>
              <th>S.no</th>
              <th>Board</th>
              <th>Course Code</th>
              <th>Time (in Days)</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Paper Count</th>
            </thead>
            <tbody>
              {filteredBoardCoursesData.map((data, index) =>
                !editBoardCoursesState[index] ? (
                  <tr key={index}>
                    <td>
                      <div className="sNoPlusEdit">
                        <p>{index + 1}</p>{" "}
                        <div>
                          <Edit
                            onClick={() => {
                              setEditBoardCoursesState((prev) => {
                                const newPrev = [...prev];
                                newPrev[index] = true;
                                return newPrev;
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Delete onClick={()=>{deleteBoardCourseMapping(editBoardCoursesData[index])}} />
                        </div>
                      </div>
                    </td>
                    <td>{data.department_name}</td>
                    <td>{data.course_code}</td>
                    <td>
                      {dayjs(data.end_date).diff(dayjs(data.start_date), "day")}
                    </td>
                    <td>{dayjs(data.start_date).format("DD/MM/YYYY")}</td>
                    <td>{dayjs(data.end_date).format("DD/MM/YYYY")}</td>
                    <td>{data.paper_count}</td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td>
                      <div className="sNoPlusEdit">
                        <p>{index + 1}</p>{" "}
                        <div>
                          <Cancel
                            onClick={() => {
                              setEditBoardCoursesState((prev) => {
                                const newPrev = [...prev];
                                newPrev[index] = false;
                                return newPrev;
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Check
                            onClick={() => {
                              handleEditBoardCourseData(editBoardCoursesData[index]);
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{data.department_name}</td>
                    <td>{data.course_code}</td>
                    <td>
                      {dayjs(data.end_date).diff(dayjs(data.start_date), "day")}
                    </td>
                    <td>{dayjs(data.start_date).format("DD/MM/YYYY")}</td>
                    <td>{dayjs(data.end_date).format("DD/MM/YYYY")}</td>
                    <td>
                      <div className="editFaculyName">
                        <TextField
                          style={{
                            width: 150,
                            backgroundColor: "white",
                            borderRadius: "5px",
                          }}
                          onChange={(e) => {
                            setEditBoardCoursesData((prevData) => {
                              const newPrev = [...prevData];
                              newPrev[index].paper_count = Number(
                                e.target.value
                              );
                              return newPrev;
                            });
                          }}
                          fullWidth={true}
                          size="small"
                          type="Number"
                          InputProps={{ inputProps: { min: 0 } }}
                          value={editBoardCoursesData[index]?.paper_count}
                        />
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        ) : (
          <NoData />
        )}
      </div>
    </div>
  );
};

export default ManageBoardCourses;
