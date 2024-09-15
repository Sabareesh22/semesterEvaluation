import { InputLabel, TextField } from "@mui/material";
import "./AddBoardCourses.css";
import Select from "react-select";
import { useEffect, useState } from "react";
import Button from "../../../../components/button/Button";
import { Save } from "@mui/icons-material";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { toast, ToastContainer } from "react-toastify";
import { useCookies } from "react-cookie";
const AddBoardCourses = ({ setIsAdding }) => {
  const [boardOptions, setBoardOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [semcodeOptions, setSemcodeOptions] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [typeOptions, setTypeOptions] = useState([
    { value: "1", label: "Regular" },
    {
      value: "2",
      label: "Arrear",
    },
  ]);
  const [newBoardCourseMappingDetails, setNewBoardCourseMappingDetails] =
    useState({
      board: null,
      semcode: null,
      course: null,
      batch: null,
      paper_count: 0,
      type: null,
      status: "1",
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
        console.log(response);
        setBatchOptions(
          response.data.map((data) => ({
            value: data.id,
            label: data.batch,
          }))
        );
      });
  };

  useEffect(() => {
    console.log(batchOptions);
  }, [batchOptions]);

  const fetchBoards = () => {
    axios
      .get(`${apiHost}/departments`, {
        headers: {
          Auth: cookies.auth,
        },
      })
      .then((response) => {
        setBoardOptions(
          response.data.map((data) => ({
            value: data.id,
            label: data.department,
          }))
        );
      });
  };
  const fetchCourses = () => {
    axios
      .get(`${apiHost}/api/unmappedCoursesForBCM`, {
        params: {
          semcode: newBoardCourseMappingDetails.semcode.value,
          batch: newBoardCourseMappingDetails.batch.value,
          board: newBoardCourseMappingDetails.board.value,
        },
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        setCourseOptions(
          response.data.map((data) => ({
            value: data.id,
            label: data.course_code,
          }))
        );
      });
  };

  useEffect(() => {
    if (
      newBoardCourseMappingDetails.semcode &&
      newBoardCourseMappingDetails.batch &&
      newBoardCourseMappingDetails.board
    ) {
      fetchCourses();
    }
  }, [newBoardCourseMappingDetails]);

  useEffect(() => {
    fetchBoards();
    fetchSemcodes();
    fetchBatches();
  }, [cookies.auth]);

  const handleAddBoardCourseMapping = () => {
    if (
      newBoardCourseMappingDetails.board &&
      newBoardCourseMappingDetails.batch &&
      newBoardCourseMappingDetails.semcode &&
      newBoardCourseMappingDetails.course &&
       newBoardCourseMappingDetails.paper_count!==null &&
       newBoardCourseMappingDetails.type &&
       newBoardCourseMappingDetails.status
    ) {
      axios.post(
        `${apiHost}/api/boardCourseMapping`,
        {
          department: newBoardCourseMappingDetails.board.value,
          semcode:newBoardCourseMappingDetails.semcode.value,
          batch:newBoardCourseMappingDetails.batch.value,
          course: newBoardCourseMappingDetails.course.value,
          paper_count: newBoardCourseMappingDetails.paper_count,
          type: newBoardCourseMappingDetails.type.value,
          status: newBoardCourseMappingDetails.status,
        },
        {
          headers: {
            Auth: cookies.auth,
          },
        }
      ).then((response)=>{
        if(response.status===201){
          toast.success("Board course mapping added successfully");
          setIsAdding(false);
        }
        else{
          toast.error("Failed to add board course mapping");
        }
      });
    }
    else{
      toast.error("Please fill all required fields");
    }
  };
  return (
    <div className="newBoardCourseMappingMasterContainer">
      <h4>Add New Board Course Mapping</h4>
      <div className="newBoardCourseMappingForm">
        <div>
          <InputLabel>Semcode</InputLabel>
          <Select
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            value={newBoardCourseMappingDetails.batch}
            onChange={(selectedOption) => {
              setNewBoardCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.batch = selectedOption;
                return newPrev;
              });
            }}
            options={batchOptions}
          />
        </div>
        <div>
          <InputLabel>Board</InputLabel>
          <Select
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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
        <div>
          <InputLabel>Paper Count</InputLabel>
          <TextField
            size="small"
            placeholder="paper count"
            sx={{
              backgroundColor: "white",
            }}
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={newBoardCourseMappingDetails.paper_count}
            onChange={(e) => {
              setNewBoardCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.paper_count = Number(e.target.value);
                return newPrev;
              });
            }}
          />
        </div>
        <div>
          <InputLabel>Type</InputLabel>
          <Select
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            value={newBoardCourseMappingDetails.type}
            onChange={(selectedOption) => {
              setNewBoardCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.type = selectedOption;
                return newPrev;
              });
            }}
            options={typeOptions}
          />
        </div>
        <Button
          onClick={handleAddBoardCourseMapping}
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
