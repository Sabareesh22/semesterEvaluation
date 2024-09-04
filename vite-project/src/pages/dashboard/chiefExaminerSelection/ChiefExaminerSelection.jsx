import { useEffect, useState } from "react";
import "./ChiefExaminerSelection.css";
import Label from "../../../components/label/Label";
import { Add, Cancel, Check } from "@mui/icons-material";
import DatePickerWithRange from "../../../components/datePicker/DatePicker";
import dayjs from "dayjs";
import Select from "react-select";
import axios from "axios";
import apiHost from "../../../../config/config";
import Button from "../../../components/button/Button";
import { ToastContainer, toast } from "react-toastify";
import { useCookies } from "react-cookie";
const ChiefExaminerSelection = ({ isEditable, departmentId, semcode }) => {
  const [chiefExaminerSelectionTableData, setChiefExaminerSelectionTableData] =
    useState([]);

  const colorsForIndexes = [
    "#A5DD9B",
    "#92C7CF",
    "#FFFBDA",
    "#D0A2F7",
    "#F9B572",
  ];
  const [isAddingFaculty, setIsAddingFaculty] = useState([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [newCourseData, setNewCourseData] = useState({
    course_id: "",
    semester: semcode,
    department_id: departmentId,
    paper_count: 0,
    in_charge: null,
    start_date: null,
    end_date: null,
  });
  const [newFacultySuggestion, setNewFacultySuggestion] = useState([]);
  const [newCourseSuggestion, setNewCourseSuggestion] = useState([]);
  const fetchChiefExaminerSelectionTableData = () => {
    axios
      .get(`${apiHost}/api/getCourseMappingData`, {
        params: {
          departmentId,
          semcode,
        },
        headers: {
          auth: cookies.auth,
        },
      })
      .then((res) => {
        console.log(res.data);
        if (res.data) {
          setChiefExaminerSelectionTableData(res.data);
        }
      });
  };

  useEffect(() => {
    fetchChiefExaminerSelectionTableData();
  }, [cookies.auth]);

  const fetchNewCourseSuggestion = () => {
    console.log("Fetching new course suggestion");
    axios
      .get(`${apiHost}/api/courses-with-null-fields`, {
        params: {
          department: departmentId,
          semcode: semcode,
        },
        headers: {
          auth: cookies.auth,
        },
      })
      .then((res) => {
        console.log("new Courses Data : ", res.data);
        if (res.data) {
          const modifiedCourseSuggestions = res.data.map((data) => {
            return {
              value: data.id,
              label: data.course_code,
              count: data.paper_count,
            };
          });
          setNewCourseSuggestion(modifiedCourseSuggestions || []);
        }
      });
  };

  const fetchNewFacultySuggestion = () => {
    console.log("Fetching new course suggestion");
    axios
      .get(`${apiHost}/api/free-faculties`, {
        params: {
          departmentId,
          startDate:newCourseData.start_date,
          endDate: newCourseData.end_date,
          semcode,
        },
        headers: {
          auth: cookies.auth,
        },
      })
      .then((res) => {
        console.log("new Faculty Data : ", res.data);
        if (res.data) {
          const modifiedFacultySuggestions = res.data.map((data) => {
            return {
              value: data.id,
              label: data.faculty_name_code,
            };
          });
          setNewFacultySuggestion(modifiedFacultySuggestions || []);
        }
      });
  };


  useEffect(() => {
    if (isAddingCourse) {
      fetchNewCourseSuggestion();
    }
    else{
      setNewCourseData({
        course_id: "",
        semester: semcode,
        department_id: departmentId,
        paper_count: 0,
        in_charge: null,
        start_date: null,
        end_date: null,
      })
      setNewCourseSuggestion([]);
      setNewFacultySuggestion([]);
    }
  }, [isAddingCourse]);

  const handleRemoveCourse = (id) => {
    axios
      .put(
        `${apiHost}/api/board-course-mapping/${id}`,
        {
          start_date: null,
          end_date: null,
          in_charge: null,
          status: "0",
        },
        {
          headers: {
            auth: cookies.auth,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        if (res.data) {
          toast.success(res.data.message);
          fetchChiefExaminerSelectionTableData();
        }
      });
  };

  useEffect(() => {
    if(newCourseData.end_date && newCourseData.start_date) {
      if(dayjs(newCourseData.end_date).isBefore(dayjs(newCourseData.start_date))){
        toast.error("End date must be on/after start date")
        setNewCourseData((prev) => {
          const newState = { ...prev };
          newState.start_date = null;
          newState.end_date = null;
          console.log(newState);
          return newState;
        });
      }
      else{
        fetchNewFacultySuggestion()
      }
    }
  },[newCourseData])

  const handleChangeDate = (startDate, endDate, id) => {
    console.log("Date changed", startDate, endDate, id);

    // Properly format the startDate and endDate using dayjs
    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");
    console.log(dayjs(formattedStartDate).isAfter(formattedEndDate));
    if (dayjs(formattedStartDate).isAfter(formattedEndDate)) {
      fetchChiefExaminerSelectionTableData();
      return toast.error("endDate must be on/after startDate");
    }
    axios
      .put(
        `${apiHost}/api/board-course-mapping/${id}`,
        {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        },
        {
          headers: {
            auth: cookies.auth,
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        if (res.data) {
          toast.success(res.data.message);
          fetchChiefExaminerSelectionTableData();
        }
      });
  };

  const toggleAddFaculty = (index) => {
    setIsAddingFaculty((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const toggleAddCourse = (index) => {
    setIsAddingCourse((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const renderTableRow = (data, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>
        <DatePickerWithRange
          onChange={(val) => {
            handleChangeDate(
              dayjs(val).format("YYYY-MM-DD"),
              dayjs(chiefExaminerSelectionTableData[index].end_date).format(
                "YYYY-MM-DD"
              ),
              chiefExaminerSelectionTableData[index].mapping_id
            );
          }}
          isDisabled={!isEditable}
          value={dayjs(chiefExaminerSelectionTableData[index].start_date)}
          label="Start Date"
          startDate={dayjs("2020-09-1")}
          endDate={dayjs("2025-09-4")}
        />
        <DatePickerWithRange
          onChange={(val) => {
            handleChangeDate(
              dayjs(chiefExaminerSelectionTableData[index].start_date).format(
                "YYYY-MM-DD"
              ),
              dayjs(val).format("YYYY-MM-DD"),
              chiefExaminerSelectionTableData[index].mapping_id
            );
          }}
          isDisabled={!isEditable}
          value={dayjs(chiefExaminerSelectionTableData[index].end_date)}
          label="End Date"
          startDate={dayjs("2020-09-1")}
          endDate={dayjs("2025-09-4")}
        />
      </td>
      <td>{renderCourseData(data, index)}</td>
      <td>{renderTotalCountData(data.totalCount)}</td>
      <td>{renderChiefExaminerData(data.chiefExaminer, index)}</td>
    </tr>
  );

  const renderCourseData = (data, index) => (
    <DataSection
      items={data.course}
      mappingId={data.mapping_id}
      index={index}
      toggleAdd={toggleAddCourse}
      addButtonLabel={"Add Course"}
      colors={colorsForIndexes}
    />
  );

  const renderTotalCountData = (counts) => (
    <div className="courseDataBc">
      {counts.map((count, i) => (
        <Label
          key={i}
          isClosable={false}
          backgroundColor={colorsForIndexes[i]}
          content={count}
        />
      ))}
    </div>
  );

  const renderChiefExaminerData = (examiners, index) => (
    <DataSection
      items={examiners}
      index={index}
      isAdding={isAddingFaculty}
      toggleAdd={toggleAddFaculty}
      colors={colorsForIndexes}
    />
  );

  const DataSection = ({
    items,
    index,
    mappingId,
    toggleAdd,
    colors,
    addButtonLabel,
  }) => (
    <div className="courseDataBc">
      {items.map((item, i) => (
        <Label
          onClose={() => {
            handleRemoveCourse(mappingId);
          }}
          key={i}
          isClosable={isEditable}
          backgroundColor={colors[i]}
          content={item}
        />
      ))}
    </div>
  );

  const AddButton = ({ onClick, label }) => (
    <div className="addIconButtonContainer">
      <Label
        content={
          <div onClick={onClick} className="addIconButton">
            <Add /> {label}
          </div>
        }
      />
    </div>
  );

  const SelectOptions = ({ onCancel }) => (
    <div className="ceSelectContainer">
      <Select />
      <Cancel onClick={onCancel} />
      <Check />
    </div>
  );

  return (
    <div className="ceSelection">
      {isEditable && (
        <div className="addIconButtonContainerTag">
          {isAddingCourse && (
            <Button
              onClick={() => {
                setIsAddingCourse(false);
              }}
              size={"small"}
              label={
                <p className="addIconButton">
                  {" "}
                  <Cancel /> Cancel
                </p>
              }
            />
          )}
          <Button
            onClick={() => {
              setIsAddingCourse(true);
            }}
            size={"small"}
            label={
              <p className="addIconButton">
                {" "}
                <Add /> Add Courses
              </p>
            }
          />
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>S.no</th>
            <th>Date</th>
            <th>Course</th>
            <th>Total Count</th>
            <th>Chief Examiner</th>
          </tr>
        </thead>
        <tbody>
          {isAddingCourse && (
            <>
              <td></td>
              <td>
                <DatePickerWithRange
                  onChange={(val) => {
                    setNewCourseData((prev) => {
                      const newState = { ...prev };
                      newState.start_date = dayjs(val).format('YYYY-MM-DD');
                      console.log(newState);
                      return newState;
                    });
                  }}
                />
                <DatePickerWithRange
                  onChange={(val) => {
                    setNewCourseData((prev) => {
                      const newState = { ...prev };
                      newState.end_date = dayjs(val).format('YYYY-MM-DD')
                      console.log(newState);
                      return newState;
                    });
                  }}
                />
              </td>
              <td>
                <Select
                  onChange={(val) => {
                    setNewCourseData((prev) => {
                      const newState = { ...prev };
                      newState.course_id = val.value;
                      newState.paper_count = val.count;
                      console.log(newState);
                      return newState;
                    });
                  }}
                  options={newCourseSuggestion}
                />
              </td>
              <td key={newCourseData.course_id}>{newCourseData.paper_count}</td>
              <td>
                <Select
                  isDisabled={
                    !(newCourseData.end_date && newCourseData.start_date)
                  }
                  options={newFacultySuggestion}
                  onChange={(val) => {
                    setNewCourseData((prev) => {
                      const newState = { ...prev };
                      newState.in_charge = val.id;
                      console.log(newState);
                      return newState;
                    });
                  }}
                />
                {!(newCourseData.end_date && newCourseData.start_date) && (
                  <p style={{ color: "red" }}>
                    Select the date range to see available Chief Examiners
                  </p>
                )}
              </td>
            </>
          )}
          {chiefExaminerSelectionTableData.map((data, index) =>
            renderTableRow(data, index)
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChiefExaminerSelection;
