import { useEffect, useState } from "react";
import "./FoilCard.css";
import Card from "../../components/card/Card";
import Select from "react-select";
import Button from "../../components/button/Button";
import { Pagination, TextField } from "@mui/material";
import Circle from "../../components/circle/Circle";
import { useCookies } from "react-cookie";
import axios from "axios";
import NoData from '../../components/noData/NoData'
import apiHost from "../../../config/config";
import {toast,ToastContainer} from 'react-toastify'
export default function FoilCard(props) {
  const [yearOptions, setYearOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [semcodeOptions, setSemcodeOptions] = useState([]);
  
  const [year, setYear] = useState(null);
  const [batch, setBatch] = useState(null);
  const [department, setDepartment] = useState(null);
  const [semcode, setSemcode] = useState(null);
  const [cookies, setCookie] = useCookies(["auth"]);

  const [foilCardTableData, setFoilCardTableData] = useState([]);
  const [paginatedFoilCardTableData,setPaginatedFoilCardTableData] = useState([]);

    // State to track statuses of circles for each course and faculty
    const [circleStatuses, setCircleStatuses] = useState({});
    // State to track foil card numbers for each course and faculty
    const [foilCardNumbers, setFoilCardNumbers] = useState({});
    // State to track the current circle for each row
    const [currentCircle, setCurrentCircle] = useState({});

  const postFoilCard = async(allocationId,foilCards)=>{
    let concatedFoilCard='';
    if(!allocationId || !foilCards){
      return toast.error("Data missing Cannot Perform action")
    }
    let emptyFoilCard = false
    Object.keys(foilCards).forEach(card => {
      if(foilCards[card].trim()==''){
           emptyFoilCard = true;
      }
      if(concatedFoilCard !=='' && card !==null){
        concatedFoilCard = concatedFoilCard +','+ foilCards[card].trim();
      }
      else{
        concatedFoilCard=foilCards[card];
      }
  })
  if(emptyFoilCard){
    return toast.error("Empty FoilCard is not accepted")
  }
 try{ axios.post(`${apiHost}/api/addFoilCard`,{
    allocationId,
    foilCard:concatedFoilCard
  },{headers:{
    auth:cookies.auth
  }}).then((res)=>{
    if(res.status ==200){
      toast.success(res.data?.message);
    }
  })
}
catch(error){
  toast.error(error)
}

}

const handlePageChange = (event,value)=>{
  setPaginatedFoilCardTableData([foilCardTableData[value-1]]);
}


useEffect(()=>{
 
  if(foilCardTableData.length>0){
         setPaginatedFoilCardTableData([foilCardTableData[0]]);
         console.log(paginatedFoilCardTableData)
  } 

},[foilCardTableData])

 useEffect(()=>{
   console.log(foilCardNumbers)
 },[foilCardNumbers])


  useEffect(() => {
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
        setDepartmentOptions(parsedDepartments);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [cookies.auth]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get(`${apiHost}/batches`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedBatches = response.data.map((item) => ({
          value: item.id,
          label: item.batch,
        }));
        setBatchOptions(parsedBatches);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchBatches();
  }, [cookies.auth]);

  useEffect(() => {
    const fetchSemesterCodes = async () => {
      if (!batch || !year) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/semcodes?batch=${batch.value}&year=${year.value}`,
          {
            headers: {
              Auth: cookies.auth,
            },
          }
        );
        const parsedCodes = response.data.results.map((item) => ({
          value: item.id,
          label: item.semcode,
        }));
        setSemcodeOptions(parsedCodes);
      } catch (error) {
        console.error("Error fetching semester codes:", error);
      }
    };

    fetchSemesterCodes();
  }, [batch, year, cookies.auth]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(`${apiHost}/years`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedYears = response.data.map((item) => ({
          value: item.id,
          label: item.year,
        }));
        setYearOptions(parsedYears);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
  }, [cookies.auth]);


  useEffect(()=>{

    if(department && semcode){
        axios.get(`${apiHost}/api/foilCardEntryTableData`,{
            params:{
                department : department.value,
                semcode : semcode.value,
                year:year.value,
                batch:batch.value
            },
            headers:{
                auth:cookies.auth
            }
        }).then((response)=>{
            setFoilCardTableData(response.data.data)
        })
    }

  },[department,semcode])



  useEffect(() => {
    props.setTitle("Foil Card");
  }, [props]);

  const handleCircleClick = (courseCode, facultyIndex, circleIndex) => {
    setCurrentCircle({
      courseCode,
      facultyIndex,
      circleIndex,
    });
  };

  const handleButtonClick = () => {
    const { courseCode, facultyIndex, circleIndex } = currentCircle;
    if(isLastCircle(courseCode,facultyIndex,circleIndex)){
      const allocationId = foilCardTableData.find((data)=>(data.courseCode == courseCode)).allocationId;
      console.log("Post Data : ",allocationId,foilCardNumbers[courseCode][facultyIndex])
      postFoilCard(allocationId,foilCardNumbers[courseCode][facultyIndex])
    }
    if (courseCode && facultyIndex !== undefined && circleIndex !== undefined) {
      setCircleStatuses((prevStatuses) => {
        const newStatuses = { ...prevStatuses };

        if (!newStatuses[courseCode]) {
          newStatuses[courseCode] = {};
        }

        if (!newStatuses[courseCode][facultyIndex]) {
          const numberOfCircles = Math.ceil(
            foilCardTableData.find((course) => course.courseCode === courseCode)
              .faculties[facultyIndex].paperCount / 25
          );
          newStatuses[courseCode][facultyIndex] =
            Array(numberOfCircles).fill("pending");
        }

        // Update statuses for all circles up to the current one
        newStatuses[courseCode][facultyIndex] = newStatuses[courseCode][
          facultyIndex
        ].map((status, index) => {
          if (index < circleIndex) return "completed";
          if (index === circleIndex) return "selected";
          return status;
        });

        // Mark the current circle as completed and move to the next one
        newStatuses[courseCode][facultyIndex] = newStatuses[courseCode][
          facultyIndex
        ].map((status, index) => {
          if (index === circleIndex) return "completed";
          return status;
        });

        // Move to the next circle
        const nextCircleIndex = circleIndex + 1;
        if (nextCircleIndex < newStatuses[courseCode][facultyIndex].length) {
          setCurrentCircle((prev) => ({
            ...prev,
            circleIndex: nextCircleIndex,
          }));
        } else {
          // Set the current circle to null when no more circles are left
          setCurrentCircle((prev) => ({
            ...prev,
            circleIndex: null,
          }));
        }

        return newStatuses;
      });

      setFoilCardNumbers((prevNumbers) => {
        const currentFoilCardNumber = document.getElementById(
          `foil-card-${courseCode}-${facultyIndex}-${circleIndex}`
        ).value;

        return {
          ...prevNumbers,
          [courseCode]: {
            ...prevNumbers[courseCode],
            [facultyIndex]: {
              ...prevNumbers[courseCode]?.[facultyIndex],
              [circleIndex]: currentFoilCardNumber,
            },
          },
        };
      });
    }
  };

  const getColorForStatus = (courseCode, facultyIndex, circleIndex) => {
    if (
      currentCircle.courseCode === courseCode &&
      currentCircle.facultyIndex === facultyIndex &&
      currentCircle.circleIndex === circleIndex
    ) {
      return "blue"; // Current circle
    }
    return circleStatuses[courseCode]?.[facultyIndex]?.[circleIndex] ===
      "completed"
      ? "green"
      : "grey";
  };

  const isLastCircle = (courseCode, facultyIndex, circleIndex) => {
    return (
      circleStatuses[courseCode]?.[facultyIndex] &&
      circleIndex === circleStatuses[courseCode][facultyIndex].length - 1
    );
  };

  return (
    <div className="foilCardPageContainer">
      <ToastContainer/>
      <Card
        content={
          <div className="foilCardTopSelects">
            <div className="selectContainer">
              <Select
                value={department}
                options={departmentOptions}
                onChange={setDepartment}
                placeholder={"Department"}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 2 }) }}
              />
            </div>
            <div className="selectContainer">
              <Select
                value={batch}
                options={batchOptions}
                onChange={setBatch}
                placeholder={"Batch"}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 2 }) }}
              />
            </div>
            <div className="selectContainer">
              <Select
                value={year}
                options={yearOptions}
                onChange={setYear}
                placeholder={"Year"}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 2 }) }}
              />
            </div>
            <div className="selectContainer">
              <Select
                value={semcode}
                options={semcodeOptions}
                onChange={setSemcode}
                placeholder={"Semcode"}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 2 }) }}
              />
            </div>
          </div>
        }
      />
      { paginatedFoilCardTableData.length>0?
        <div className="foilTableContainer">
        <table>
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Faculty</th>
              <th>No. of Sets</th>
              <th>Foil Card</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFoilCardTableData.map((course) =>
              course.faculties.map((faculty, facultyIndex) => (
                <tr key={`${course.courseCode}-${facultyIndex}`}>
                  {facultyIndex === 0 && (
                    <td rowSpan={course.faculties.length} align="center">
                      {course.courseCode}
                    </td>
                  )}
                  <td>{faculty.facultyName}</td>
                  <td>{faculty.paperCount}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", gap: "20px" }}>
                        {[...Array(Math.ceil(faculty.paperCount / 25))].map(
                          (_, circleIndex) => (
                            <div
                              key={circleIndex}
                              onClick={() =>
                                handleCircleClick(
                                  course.courseCode,
                                  facultyIndex,
                                  circleIndex
                                )
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <Circle
                                text={circleIndex + 1}
                                color={getColorForStatus(
                                  course.courseCode,
                                  facultyIndex,
                                  circleIndex
                                )}
                              />
                            </div>
                          )
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <TextField
                          id={`foil-card-${course.courseCode}-${facultyIndex}-${currentCircle.circleIndex}`}
                          fullWidth
                          size="small"
                          placeholder={`Enter foil card no for ${faculty.name}`}
                          sx={{ backgroundColor: "white" }}
                          value={
                            foilCardNumbers[course.courseCode]?.[
                              facultyIndex
                            ]?.[currentCircle.circleIndex] || ""
                          }
                          onChange={(e) => {
                            const newFoilCardNumber = e.target.value;
                            setFoilCardNumbers((prevNumbers) => ({
                              ...prevNumbers,
                              [course.courseCode]: {
                                ...prevNumbers[course.courseCode],
                                [facultyIndex]: {
                                  ...prevNumbers[course.courseCode]?.[
                                    facultyIndex
                                  ],
                                  [currentCircle.circleIndex]:
                                    newFoilCardNumber,
                                },
                              },
                            }));
                          }}
                        />
                        <Button
                          size={"small"}
                          label={
                            isLastCircle(
                              course.courseCode,
                              facultyIndex,
                              currentCircle.circleIndex
                            )
                              ? "Done"
                              : "Next"
                          }
                          onClick={()=>{handleButtonClick()}}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div style={{display:"flex",justifyContent:"center"}}> 
        <Pagination count={foilCardTableData.length} onChange={handlePageChange} color="primary"/>
          </div>
      </div> : <NoData/>
      
      }
      
    </div>
  );
}
