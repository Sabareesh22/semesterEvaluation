import { useEffect, useState } from "react";
import "./ChiefExaminerSelection.css";
import Label from "../../../components/label/Label";
import { Add, Cancel, Check } from "@mui/icons-material";
import DatePickerWithRange from "../../../components/datePicker/DatePicker";
import dayjs from "dayjs";
import Select from "react-select";
import axios from "axios";
import apiHost from "../../../../config/config"
import { useCookies } from "react-cookie";
const ChiefExaminerSelection = ({isEditable,departmentId,semcode}) => {
  const [chiefExaminerSelectionTableData, setChiefExaminerSelectionTableData] = useState([]);

  const colorsForIndexes = ["#A5DD9B", "#92C7CF", "#FFFBDA", "#D0A2F7", "#F9B572"];
  const [isAddingFaculty, setIsAddingFaculty] = useState([]);
  const [isAddingCourse, setIsAddingCourse] = useState([]);
  const [cookies,setCookie] = useCookies(['auth']);
  
  useEffect(() => {
    // Initialize the state arrays with 'false' values based on the number of data entries.
    setIsAddingFaculty(Array(chiefExaminerSelectionTableData.length).fill(false));
    setIsAddingCourse(Array(chiefExaminerSelectionTableData.length).fill(false));
  }, [chiefExaminerSelectionTableData]);


const fetchChiefExaminerSelectionTableData = ()=>{
  axios.get(`${apiHost}/api/getCourseMappingData`,{params:{
    departmentId,
    semcode
 },
   headers:{
     auth:cookies.auth
   }
 }).then((res)=>{
   console.log(res.data)
   if(res.data){
     setChiefExaminerSelectionTableData(res.data)
   }
 })
}

 useEffect(() => {
  
 },[cookies.auth])

 const handleRemoveCourse  = (id)=>{
      axios.put(`${apiHost}/api/board-course-mapping/${id}`,
        {
          start_date:null,
          end_date:null,
          in_charge: null
        }
        ,
        {headers:{
          auth:cookies.auth
        }}
        
      ).then((res)=>{
        console.log(res.data)
        if(res.data.success){
          toast.success(res.data.message);
          fetchChiefExaminerSelectionTableData()
        }
      })
 }

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
        <DatePickerWithRange isDisabled={!isEditable} 
        value={dayjs(chiefExaminerSelectionTableData[index].start_date)} label="Start Date"
         startDate={dayjs("2024-09-1")} endDate={dayjs("2024-09-4")} />
        <DatePickerWithRange isDisabled={!isEditable}
         value={dayjs(chiefExaminerSelectionTableData[index].end_date)}
        label="End Date" startDate={dayjs("2024-09-1")} endDate={dayjs("2024-09-4")} />
      </td>
      <td>{renderCourseData(data.course, index)}</td>
      <td>{renderTotalCountData(data.totalCount)}</td>
      <td>{renderChiefExaminerData(data.chiefExaminer, index)}</td>
    </tr>
  );

  const renderCourseData = (courses, index) => (
    <DataSection
      items={courses}
      index={index}
      isAdding={isAddingCourse}
      toggleAdd={toggleAddCourse}
      addButtonLabel={"Add Course"}
      colors={colorsForIndexes}
    />
  );

  const renderTotalCountData = (counts) => (
    <div className="courseDataBc">
      {counts.map((count, i) => (
        <Label key={i} isClosable={false} backgroundColor={colorsForIndexes[i]} content={count} />
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

  const DataSection = ({ items, index, isAdding, toggleAdd, colors,addButtonLabel}) => (
    <div className="courseDataBc">
      {items.map((item, i) => (
        <Label onClose={()=>{handleRemoveCourse()}} key={i} isClosable={isEditable} backgroundColor={colors[i]} content={item} />
      ))}

      { isEditable &&(
!isAdding[index]  ? (
  addButtonLabel &&
  <AddButton onClick={() => toggleAdd(index)} label={addButtonLabel} />
) : (
  <SelectOptions onCancel={() => toggleAdd(index)} />
)
)
      }
    </div>
  );

  const AddButton = ({ onClick ,label}) => (
    <div className="addIconButtonContainer">
      <Label content={<div onClick={onClick} className="addIconButton"><Add /> {label}</div>} />
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
          {chiefExaminerSelectionTableData.map((data, index) => renderTableRow(data, index))}
        </tbody>
      </table>
    </div>
  );
};

export default ChiefExaminerSelection;
