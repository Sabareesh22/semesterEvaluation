import { useEffect, useState } from "react";
import "./ManageBoardCourses.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../config/config";
import dayjs from "dayjs";
import { TextField } from "@mui/material";
import Select from "react-select";
import NoData from "../../../components/noData/NoData";
import { Delete, Edit } from "@mui/icons-material";
const ManageBoardCourses = () => {
  const [departments, setDepartments] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [semCodeOptions, setSemcodeOptions] = useState([]);
  const [boardCoursesData, setBoardCoursesData] = useState([]);
  const [filteredBoardCoursesData, setFilteredBoardCoursesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
              {filteredBoardCoursesData.map((data, index) => (
                <tr key={index}>
                  <td>
                    <div className="sNoPlusEdit">
                      <p>{index + 1}</p>{" "}
                      <div>
                        <Edit />
                      </div>
                      <div>
                        <Delete />
                      </div>
                    </div>
                  </td>
                  <td>{data.department_name}</td>
                  <td>{data.course_code}</td>
                  <td>{dayjs(data.end_date).diff(dayjs(data.start_date),'day')}</td>
                  <td>{dayjs(data.start_date).format("DD/MM/YYYY")}</td>
                  <td>{dayjs(data.end_date).format("DD/MM/YYYY")}</td>
                  <td>{data.paper_count}</td>
                </tr>
              ))}
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
