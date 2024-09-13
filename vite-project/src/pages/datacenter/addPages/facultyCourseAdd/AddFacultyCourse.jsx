import { useEffect, useState } from "react";
import "./AddFacultyCourse.css";
import Select from "react-select";
import { InputLabel } from "@mui/material";
import Button from "../../../../components/button/Button";
import { Save } from "@mui/icons-material";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { toast } from "react-toastify";
const AddFacultyCourse = ({ setIsAdding }) => {
  const [cookies, setCookie] = useCookies(["auth"]);
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [newCourseMappingDetails, setNewCourseMappingDetails] = useState({
    faculty: null,
    course: null,
  });
  useEffect(() => {
    axios
      .get(`${apiHost}/api/faculty`, {
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        setFacultyOptions(
          response.data.map((faculty) => {
            return {
              value: faculty.id,
              label: faculty.faculty_id,
            };
          })
        );
      });
  }, [cookies.auth]);

  const addFacultyCourseMapping = () => {
    if (
      newCourseMappingDetails.course === null ||
      newCourseMappingDetails.faculty === null
    ) {
      toast.error("Please fill all fields");
      return;
    }
    axios.post(`${apiHost}/api/facultyCourseMapping`, {
      faculty: newCourseMappingDetails.faculty.value,
      course: newCourseMappingDetails.course.value,
      status:'1'
    },{
      headers:{
        auth:cookies.auth
      }
    }).then((response)=>{
      if(response.status===201){
        toast.success(response.data.message || "Faculty Course Mapping added successfully");
        setIsAdding(false);
      }
    });
  };

  useEffect(() => {
    if (newCourseMappingDetails.faculty !== null) {
      axios
        .get(
          `${apiHost}/api/facultyCoursesMappingNotMapped/${newCourseMappingDetails.faculty.value}`,
          {
            headers: {
              auth: cookies.auth,
            },
          }
        )
        .then((response) => {
          setCourseOptions(
            response.data.map((data) => {
              return {
                value: data.courseId,
                label: data.courseCode,
              };
            })
          );
        });
    }
  }, [newCourseMappingDetails.faculty]);

  return (
    <div className="addFacultyCourseFormMasterContainer">
      <h4>Add New Faculty Course Mapping</h4>
      <div className="addFacultyCourseForm">
        <div>
          <InputLabel>Faculty</InputLabel>
          <Select
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            value={newCourseMappingDetails.faculty}
            onChange={(selectedOption) => {
              setNewCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.faculty = selectedOption;
                return newPrev;
              });
            }}
            options={facultyOptions}
          />
        </div>
        <div>
          <InputLabel>Course</InputLabel>
          <Select
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            value={newCourseMappingDetails.course}
            onChange={(selectedOption) => {
              setNewCourseMappingDetails((prev) => {
                const newPrev = { ...prev };
                newPrev.course = selectedOption;
                return newPrev;
              });
            }}
            options={courseOptions}
          />
        </div>
        <div>
          <Button
            size={"small"}
            label={
              <div onClick={addFacultyCourseMapping} className="saveNewFCMButton">
                <Save />
                Save
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AddFacultyCourse;
