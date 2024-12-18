import { useCallback, useEffect, useRef, useState } from "react";
import "./DataCenter.css";
import Card from "../../components/card/Card";
import DataCenterContainer from "./dataCenterContainer/DataCenterContainer";
import Button from "../../components/button/Button";
import Select from "react-select";
import ManageFaculty from "./managePages/manageFaculty/ManageFaculty";
import { AddReaction, Cancel, Check, Close, Upload } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ManageBoard from "./managePages/manageBoard/ManageBoard";
import ManageFCM from "./managePages/manageFCM/ManageFCM";
import * as xlsx from "xlsx";
import ManageBoardCourses from "./managePages/manageBoardCourses/ManageBoardCourses";
import { toast, ToastContainer } from "react-toastify";
import ExcelViewer from "../../components/excelViewer/ExcelViewer";
import AddFaculty from "./addPages/facultyAdd/AddFaculty";
import AddFacultyCourse from "./addPages/facultyCourseAdd/AddFacultyCourse";
import AddBoardCourses from "./addPages/boardCourseAdd/AddBoardCourses";
import dayjs from "dayjs";
import axios from "axios";
import apiHost from "../../../config/config";
import { useCookies } from "react-cookie";
import ManageCourses from "./managePages/manageCourses/ManageCourses";
import AddCourses from "./addPages/courseAdd/AddCourses";
import ManageSemcodes from "./managePages/manageSemcodes/ManageSemcodes"
import COEpage from "../coePage/COEpage";
import ManageCOE from "./managePages/manageCOE/ManageCOE";
import AddCOE from "./addPages/coeAdd/AddCOE";
import ManageHOD from "./managePages/manageHOD/ManageHOD";
import AddHOD from "./addPages/hodAdd/AddHOD";
import ManageRegualtion from "./managePages/manageRegulation/ManageRegulation";
import AddRegulation from "./addPages/regulationAdd/AddRegulation";
import ManageYear from "./managePages/manageYear/ManageYear";
import AddYear from "./addPages/yearAdd/AddYear";
import ManageSemester from "./managePages/manageSemester/ManageSemester";
import AddSemester from "./addPages/semesterAdd/AddSemester";
import ManageBatch from "./managePages/manageBatch/ManageBatch";
import AddBatch from "./addPages/batchAdd/AddBatch";
const DataCenter = ({ setTitle }) => {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["auth"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedJSONOfExcel, setParsedJSONOfExcel] = useState([]);
  const uploadIconRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  useEffect(() => {
    if(setTitle){
      setTitle("Data Center");

    }
  }, [setTitle]);

  useEffect(() => {
    const index = searchParams.get("activeIndex");
    setActiveIndex(index ? parseInt(index, 10) : null);
  }, [searchParams]);


  const uploadFacultyCourseMapping = async(jsonExcelValue) =>{
    // excel RawJSON 
    // [{
    //   "Faculty Id": "7376221CS262",
    //   "Course Code": "19IS206"
    // }]
    const modifiedJSON = jsonExcelValue.map(async(data)=>{
      let facultyId;
      let courseId;
      await axios.get(`${apiHost}/api/courses`,{
        params:{
          course_code: data["Course Code"]
        },
        headers:{
          auth: cookies.auth
        }
      }).then((response)=>{
        console.log(response)
        courseId = response.data[0].id;
      })

      await axios.get(`${apiHost}/api/faculty`,{
        params:{
          facultyId: data["Faculty Id"]
        },
        headers:{
          auth: cookies.auth
        }
      }).then((response)=>{
        console.log(response)
        facultyId = response.data[0].id;
      })
      return(
        {
          faculty:facultyId,
          course:courseId
        }
      )

    })
    Promise.all(modifiedJSON).then((array)=>{
      array.map((data)=>{
 
        axios.post(`${apiHost}/api/facultyCourseMapping`, {
          ...data,
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

      })
      
  })

}


  const uploadBoardCourseMapping = async (jsonExcelValue) => {
    //excel RawJSON
    // [
    //   {
    //     "Board": "CSE",
    //     "Course Code": "19CB403",
    //     "Semcode": "SEEAUG24",
    //     "Batch": "2022-2026",
    //     "Paper Count": 100,
    //     "Type": "Regular"
    //   }
    // ]

    console.log("This is going to be formatted");
    const modifiedJSON = jsonExcelValue.map(async (data) => {
      let course_id;
      let board;
      let semcode;
      let batch;
      let paper_count;
      let type;
      await axios
        .get(`${apiHost}/api/courses`, {
          params: {
            course_code: data["Course Code"],
          },
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          course_id = response.data[0].id;
        });
      await axios
        .get(`${apiHost}/departments`, {
          params: {
            department: data["Board"],
          },
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          board = response.data[0].id;
        });
        await axios
        .get(`${apiHost}/api/semcodes`, {
          params: {
            semcode: data["Semcode"],
          },
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          semcode = response.data.results[0].id;
        });
        await axios
        .get(`${apiHost}/batches`, {
          params: {
            batch: data["Batch"],
          },
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          batch = response.data[0].id;
        });
        const types = [{type:"Regular",value:'1'},{type:"Arrear",value:'2'}]
        type = types.find(item => item.type === data["Type"])?.value
        Promise.resolve()
        return(
          {
            course:course_id,
            department:board,
            semcode,
            batch,
            paper_count: parseInt(data["Paper Count"]),
            type,
            status: "1",
          }
        )
    });
    console.log(modifiedJSON)
    Promise.all(modifiedJSON).then((array)=>{
      array.map((data)=>{
axios.post(
        `${apiHost}/api/boardCourseMapping`,
        data,
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
  
      })
    });
      
    
  };

  const uploadCourseExcel =  async (jsonExcelValue)=>{
    // excelRawJSON:
    // [
    //   {
    //     "Name": "COMPUTER DESIGN",
    //     "Code": "18CS100",
    //     "Department": "CSE",
    //     "Semester": "2 - EVEN",
    //     "Regulation": 2022,
    //     "Status": "Active"
    //   }
    // ]
     const modifiedJSON = jsonExcelValue.map(async(data)=>{
            let department;
            let semester;
            let regulation;
            await axios
        .get(`${apiHost}/departments`, {
          params: {
            department: data["Department"],
          },
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          department = response.data[0].id;
        });

        await axios
        .get(`${apiHost}/regulations`, {
          params: {
            regulation: data["Regulation"],
          },
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          regulation = response.data[0].id;
        });

        await axios
        .get(`${apiHost}/semesters`, {
          params: {
            semester: data["Semester"],
          },
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          semester = response.data[0].id;
        });

            return(
              {
                course_name : data["Name"],
                course_code : data["Code"],
                department,
                regulation,
                semester,
                status:'1'
              }
            )
     })
     try{Promise.all(modifiedJSON).then((array)=>{
      array.map((courseData)=>{
           axios.post(`${apiHost}/api/courses`,courseData,{
            headers:{
              auth: cookies.auth
            }
           })
      })

       toast.success("Successfully Added Courses")
       setUploadedFile(null);
       setParsedJSONOfExcel(null);
     })}
     catch(error){
       console.log(error)
       toast.error("Failed to add courses" || error.message)
     }
  }

  const uploadFacultyExcel = async (jsonExcelValue) => {
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
    let departments = null;
    await axios
      .get(`${apiHost}/departments`, {
        headers: { auth: cookies.auth },
      })
      .then((response) => {
        departments = response.data.map((item) => ({
          value: item.id,
          label: item.department,
        }));
      });
    const modifiedJSON = jsonExcelValue.map((data) => {
      const today = dayjs();
      const date_of_joining = dayjs(data["Date Of Joining"]).format(
        "YYYY/MM/DD"
      );
      const experience_in_bit = today.diff(
        dayjs(data["Date Of Joining"]),
        "year"
      );
      const departmentId = departments.find(
        (dept) => dept.label === data["Department"]
      )?.value;
      return {
        name: data["Name"],
        faculty_id: data["Faculty Id"],
        department: departmentId,
        email: data["Email"],
        date_of_joining: date_of_joining,
        experience_in_bit: experience_in_bit,
        total_teaching_experience:
          data["Experience Before BIT"] + experience_in_bit,
        status: "1",
      };
    });
    modifiedJSON.forEach((data) => {
      axios.post(`${apiHost}/api/faculty`, data, {
        headers: {
          auth: cookies.auth,
        },
      });
    });
    console.log(modifiedJSON); // Logs the latest value
  };

  useEffect(() => {
    console.log(parsedJSONOfExcel);
  }, [parsedJSONOfExcel]);

  const [cardData] = useState([
    {
      title: "Faculty",
      component: <ManageFaculty isAdding={isAdding} />,
      addComponent: <AddFaculty setIsAdding={setIsAdding} />,
      uploadExcelFunction: (excelJson) => {
        uploadFacultyExcel(excelJson);
      },
    },
    {
      title: "FCM",
      component: <ManageFCM />,
      addComponent: <AddFacultyCourse setIsAdding={setIsAdding} />,
      uploadExcelFunction: (excelJson) => {
        uploadFacultyCourseMapping(excelJson);
      },
    },
    {
      title: "Board Courses",
      component: <ManageBoardCourses />,
      addComponent: <AddBoardCourses setIsAdding={setIsAdding} />,

      uploadExcelFunction: (exportJson) => {
        uploadBoardCourseMapping(exportJson);
      },
    },
    
    {
      title:"Courses",
      component:<ManageCourses />,
      uploadExcelFunction: (exportJson) => {
          uploadCourseExcel(exportJson);
      },
      addComponent:<AddCourses setIsAdding={setIsAdding}/> 
    },
    {
      title:"Semcodes",
      component:<ManageSemcodes />,
      addComponent:<COEpage setIsAdding={setIsAdding}/>
    },
    {
      title:"COEs",
      component:<ManageCOE/>,
      addComponent:<AddCOE setIsAdding={setIsAdding}/>
    },
    {
      title:"HODs",
      component:<ManageHOD/>,
      addComponent:<AddHOD setIsAdding={setIsAdding}/>
    },
    {
      title:"Regulations",
      component:<ManageRegualtion/>,
      addComponent:<AddRegulation setIsAdding={setIsAdding}/>
    },
    {
      title:"Years",
      component:<ManageYear/>,
      addComponent:<AddYear setIsAdding={setIsAdding}/>
    },
    {
      title:"Semesters",
      component:<ManageSemester/>,
      addComponent:<AddSemester setIsAdding={setIsAdding}/>
    },
    {
      title:"Batches",
      component:<ManageBatch/>,
      addComponent:<AddBatch setIsAdding={setIsAdding}/>
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
                          ) : !isAdding && parsedJSONOfExcel.length > 0 ? (
                            <>
                              <Button
                                size={"small"}
                                label={
                                  <div
                                    onClick={() => {
                                      data.uploadExcelFunction(
                                        parsedJSONOfExcel
                                      );
                                    }}
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
              <div key={isAdding} className="dcPageComponentContainer">
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
