import { InputLabel } from "@mui/material";
import "./AddBoardCourses.css";
import Select from "react-select";
import { useEffect, useState } from "react";
import Button from "../../../../components/button/Button";
import { Save } from "@mui/icons-material";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { useCookies } from "react-cookie";
const AddBoardCourses = ({ setIsAdding }) => {
  const [boardOptions, setBoardOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [semcodeOptions, setSemcodeOptions] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [newBoardCourseMappingDetails, setNewBoardCourseMappingDetails] =
    useState({
      board: null,
      semcode: null,
      course: null,
    });
  const fetchSemcodes = () => {
    axios
      .get(`${apiHost}/api/semcodes`, {
        headers: {
          Auth: cookies.auth,
        },
      })
      .then((response) => {
        setSemcodeOptions(
          response.data.results.map((data) => ({
            value: data.id,
            label: data.semcode,
          }))
        );
      });
  };

  const fetchBatches = () => {
    axios
      .get(`${apiHost}/batches`, {
        headers: {
          Auth: cookies.auth,
        },
      })
      .then((response) => {
        setBatchOptions(
          response.data.results.map((data) => ({
            value: data.id,
            label: data.batch,
          }))
        );
      });
  };

  useEffect(()=>{

  },[batchOptions])

  const fetchBoards = () => {
    axios
      .get(`${apiHost}/departments`, {
        headers: {
          Auth: cookies.auth,
        },
      })
      .then((response) => {
        setBoardOptions(
          response.data.results.map((data) => ({
            value: data.id,
            label: data.department,
          }))
        );
      });
  };
  const fetchCourses = () => {};
  useEffect(() => {
    fetchBoards();
    fetchCourses();
    fetchSemcodes();
  }, [cookies.auth]);

  const handleAddBoardCourseMapping = () => {
    if (
      newBoardCourseMappingDetails.board &&
      newBoardCourseMappingDetails.semcode &&
      newBoardCourseMappingDetails.course
    ) {
      axios.post(`${apiHost}/`);
    }
  };
  return (
    <div className="newBoardCourseMappingMasterContainer">
      <h4>Add New Board Course Mapping</h4>
      <div className="newBoardCourseMappingForm">
        <div>
          <InputLabel>Semcode</InputLabel>
          <Select
            value={newBoardCourseMappingDetails.semcode}
            onChange={(selectedOption) => {
              setNewBoardCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.semcode = selectedOption;
                return newPrev;
              });
            }}
            options={semcodeOptions}
          />
        </div>
        <div>
          <InputLabel>Batch</InputLabel>
          <Select
            value={newBoardCourseMappingDetails.semcode}
            onChange={(selectedOption) => {
              setNewBoardCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.semcode = selectedOption;
                return newPrev;
              });
            }}
            options={semcodeOptions}
          />
        </div>
        <div>
          <InputLabel>Board</InputLabel>
          <Select
            value={newBoardCourseMappingDetails.board}
            onChange={(selectedOption) => {
              setNewBoardCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.board = selectedOption;
                return newPrev;
              });
            }}
            isDisabled={newBoardCourseMappingDetails.semcode === null}
            options={boardOptions}
          />
        </div>
        <div>
          <InputLabel>Course</InputLabel>
          <Select
            value={newBoardCourseMappingDetails.course}
            onChange={(selectedOption) => {
              setNewBoardCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.course = selectedOption;
                return newPrev;
              });
            }}
            options={courseOptions}
            isDisabled={newBoardCourseMappingDetails.semcode === null}
          />
        </div>
        <Button
          size={"small"}
          label={
            <div className="saveBoardCourseContainer">
              <Save /> Save
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AddBoardCourses;
