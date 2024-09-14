import { useCallback, useEffect, useRef, useState } from "react";
import "./DataCenter.css";
import Card from "../../components/card/Card";
import DataCenterContainer from "./dataCenterContainer/DataCenterContainer";
import Button from "../../components/button/Button";
import Select from "react-select";
import ManageFaculty from "./manageFaculty/ManageFaculty";
import { Cancel, Check, Close, Upload } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ManageBoard from "./manageBoard/ManageBoard";
import ManageFCM from "./manageFCM/ManageFCM";
import * as xlsx from "xlsx";
import ManageBoardCourses from "./manageBoardCourses/ManageBoardCourses";
import { toast, ToastContainer } from "react-toastify";
import ExcelViewer from "../../components/excelViewer/ExcelViewer";
import AddFaculty from "./addPages/facultyAdd/AddFaculty";
import AddFacultyCourse from "./addPages/facultyCourseAdd/AddFacultyCourse";
import AddBoardCourses from "./addPages/boardCourseAdd/AddBoardCourses";
import dayjs from "dayjs";
import axios from "axios";
import apiHost from "../../../config/config";
import { useCookies } from "react-cookie";
const DataCenter = ({ setTitle }) => {
  const navigate = useNavigate();
  const [cookies,setCookie] = useCookies(['auth']);
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedJSONOfExcel, setParsedJSONOfExcel] = useState([]);
  const uploadIconRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  useEffect(() => {
    setTitle("Data Center");
  }, [setTitle]);

  useEffect(() => {
    const index = searchParams.get("activeIndex");
    setActiveIndex(index ? parseInt(index, 10) : null);
  }, [searchParams]);

  const uploadFacultyExcel = async(jsonExcelValue) => {
    // excelRawJSON:
    // {
    //   "Name": "Priyadarshan",
    //   "Faculty Id": "CS1111",
    //   "Department": "CSE",
    //   "Email": "priyadarshan@bitsathy.ac.in",
    //   "Date Of Joining": "10/10/2024",
    //   "Experience Before BIT": 2
    // }
    console.log("This is going to be formatted");
    var departments = null;
   await axios.get(`${apiHost}/departments`,{
      headers:{auth:cookies.auth}
    }).then((response)=>{
      departments = response.data.map((item) => ({
        value: item.id,
        label: item.department,
      }));
    })
    const modifiedJSON = jsonExcelValue.map((data)=>{
      const today = dayjs();
      const date_of_joining  = dayjs(data["Date Of Joining"]).format('YYYY/MM/DD')
      const experience_in_bit = today.diff(dayjs(data["Date Of Joining"]),'year')
      const departmentId = departments.find((dept)=>(dept.label===data["Department"]))?.value;
      return( {
         name : data["Name"],
         faculty_id:data["Faculty Id"],
         department:departmentId,
         email:data["Email"],
         date_of_joining:date_of_joining,
         experience_in_bit:experience_in_bit,
         total_teaching_experience:data["Experience Before BIT"]+experience_in_bit,
         status:'1'
         
       })
     })
    modifiedJSON.forEach((data)=>{
      axios
      .post(`${apiHost}/api/faculty`, data, {
         headers: {
           auth: cookies.auth,
         },
       })
    })
    console.log(modifiedJSON);  // Logs the latest value
};

  
useEffect(()=>{
   console.log(parsedJSONOfExcel);
},[parsedJSONOfExcel])


  const [cardData] = useState([
    {
      title: "Faculty",
      component: <ManageFaculty isAdding={isAdding} />,
      addComponent: <AddFaculty setIsAdding={setIsAdding} />,
      uploadExcelFunction:(excelJson)=>{uploadFacultyExcel(excelJson)},
    },
    {
      title: "FCM",
      component: <ManageFCM />,
      addComponent: <AddFacultyCourse setIsAdding={setIsAdding} />,
    },
    {
      title: "Board Courses",
      component: <ManageBoardCourses />,
      addComponent: <AddBoardCourses setIsAdding={setIsAdding} />,
    },
  ]);

  const handleCardClick = (index) => {
    setSearchParams({ activeIndex: index });
  };

  const handleExcelUpload = (e) => {
    console.log(uploadIconRef.current, e.target);
    if (e.target !== uploadIconRef.current) return;
    inputRef.current.click();
  };

  return (
    <div className="masterDataCenterContainer">
      <ToastContainer />
      <div className="dataCenterContainer">
        <div
          className={`dataCenterGrid${activeIndex !== null ? " active" : ""}`}
        >
          {cardData.map((data, i) => (
            <>
              <div
                onClick={() => handleCardClick(i)}
                style={{
                  zIndex: activeIndex === i ? "10" : "0",
                  display:
                    activeIndex !== null && activeIndex !== i
                      ? "none"
                      : "block",
                  backgroundColor:
                    activeIndex === i
                      ? "rgba(139, 135, 255, 0.25)"
                      : "transparent",
                  borderRadius: "20px 20px 0px 0px",
                }}
                className="grid-item"
              >
                <DataCenterContainer
                  isAdding={isAdding}
                  onAdd={() => {
                    setIsAdding(true);
                  }}
                  onCancel={() => {
                    setIsAdding(false);
                  }}
                  backgroundColor={activeIndex === i ? "white" : ""}
                  title={data.title}
                />
              </div>
              {activeIndex === i && (
                <div
                  style={{
                    borderRadius: "0px 20px 0px 0px",
                    backgroundColor: "transparent",
                  }}
                  className="dcCardPageContainer"
                >
                  <div
                    onClick={() => {
                      setActiveIndex(null);
                      setUploadedFile(null);
                      setIsAdding(false);
                      setSearchParams({});
                    }}
                    className="floatingCloseButton"
                  >
                    <div className="dcUploadExcelContainer">
                      <Button
                        size={"small"}
                        label={
                          <div className="dcIconContainer">
                            <Close /> Close
                          </div>
                        }
                      />
                    </div>
                  </div>
                  <Card
                    content={
                      <div className="dcClickedCloseButtonContainer">
                        <div className="dcUploadExcelContainer">
                          {!uploadedFile && !isAdding ? (
                            <Button
                              size={"small"}
                              label={
                                <div
                                  onClick={(e) => {
                                    handleExcelUpload(e);
                                  }}
                                  ref={uploadIconRef}
                                  id="excelUpload"
                                  className="dcIconContainer"
                                >
                                  <Upload /> Upload Excel
                                </div>
                              }
                            />
                          ) : !isAdding && parsedJSONOfExcel.length>0 ? (
                            <>
                              <Button
                                size={"small"}
                                label={
                                  <div
                                  onClick={()=>{data.uploadExcelFunction(parsedJSONOfExcel)}}
                                    id="excelUpload"
                                    className="dcIconContainer"
                                  >
                                    <Check /> Confirm Upload
                                  </div>
                                }
                              />
                              <Button
                                size={"small"}
                                label={
                                  <div
                                    onClick={() => setUploadedFile(null)}
                                    className="dcIconContainer"
                                  >
                                    <Cancel /> Cancel
                                  </div>
                                }
                              />
                            </>
                          ) : (
                            <div className="dcAddComponentContainer">
                              {cardData[activeIndex].addComponent}
                            </div>
                          )}
                        </div>
                        <input
                          ref={inputRef}
                          id="excelUpload"
                          className="dcUploadInput"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => {
                            setUploadedFile(e.target.files[0]);
                            toast.success("Excel uploaded successfully!");
                          }}
                        ></input>
                      </div>
                    }
                  />
                </div>
              )}
            </>
          ))}
        </div>
        {activeIndex !== null && (
          <div style={{ width: "100%" }} className="dcCardPageContainer">
            <div className="dcClickedCloseButtonContainer"></div>
            {!uploadedFile ? (
              <div className="dcPageComponentContainer">
                {cardData[activeIndex]?.component}
              </div>
            ) : (
              <ExcelViewer
                setParsedJSONOfExcel={setParsedJSONOfExcel}
                excelFile={uploadedFile}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCenter;
