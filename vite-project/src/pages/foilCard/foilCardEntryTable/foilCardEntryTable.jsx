import { Pagination, TextField } from "@mui/material";
import Circle from "../../../components/circle/Circle";
import "./foilCardEntryTable.css";
import { useEffect, useState } from "react";
import Button from "../../../components/button/Button";
import axios from "axios";
import apiHost from "../../../../config/config";
import { toast, ToastContainer } from "react-toastify";
import { useCookies } from "react-cookie";
import Label from "./../../../components/label/Label";
import NoData from "../../../components/noData/NoData";
const FoilCardEntryTable = ({ data }) => {
  const [cookies, setCookie] = useCookies(["auth"]);

  const [selectedCircleData, setSelectedCircleData] = useState({});
  const labelColors = ["#D2E0FB", "#F2C18D", "#EFBC9B", "#BED1CF"];
  const [circleActiveState, setCircleActiveState] = useState(() =>
    
    data.map((eachData) =>
      eachData.faculties.map((faculty) =>
        Array(Math.ceil(faculty.paperCount / 25)).fill(false)
      )
    )
  ); 

  const [currentPage, setCurrentPage] = useState(0);
  
  const [foilCardNumbers, setFoilCardNumbers] = useState([]);

  useEffect(() => {
    console.log(data)
    const fetchFoilCardNumbers = async () => {
      const newFoilCardNumbers = await Promise.all(
        data.map(async (eachData) => {
          return Promise.all(
            eachData.faculties.map(async (faculty) => {
              try {
                const response = await axios.get(`${apiHost}/api/foilCardByMappingId`, {
                  params: { mappingId: faculty.allocationId },
                  headers: { Auth: cookies.auth },
                });
  
                let foilCards = response?.data?.data[0]?.foil_card_number.split(',');
                if(!foilCards){
                  foilCards = [];
                }
                console.log(foilCards) 
                let returnArray = Array(Math.ceil(faculty.paperCount / 25));
                for (let index = 0; index < returnArray.length; index++) {
                  returnArray[index] = foilCards[index] || '';
                  console.log(returnArray[index])
                }
                
               return returnArray;
              } catch (error) {
                console.error("Error fetching foil cards:", error);
                return []; // Return an empty array on error
              }
            })
          );
        })
      );
  
      // Flatten the nested arrays (if needed) and set the state
      setFoilCardNumbers(newFoilCardNumbers);
    };
  
    fetchFoilCardNumbers();
  }, [data , cookies.auth]); // Include dependencies like `data` and `cookies.auth`
  
  useEffect(()=>{
   console.log(foilCardNumbers)
  },[foilCardNumbers])

  useEffect(() => {
    const updatedState = data.map((eachData) =>
      eachData.faculties.map((faculty) =>
        Array(Math.ceil(faculty.paperCount / 25)).fill(false)
      )
    );
    setCircleActiveState(updatedState);
  }, [data]);

  const handleFoilCardsPost = (index, facultyIndex) => {
    const allocationId = data[index].faculties[facultyIndex].allocationId;

    let containsEmpty = false;
    foilCardNumbers?.[index]?.[facultyIndex].forEach((card) => {
      if (card.trim() === "") {
        containsEmpty = true;
      }
    });
    if (containsEmpty) {
      toast.error("Please enter all foil card numbers.");
      return;
    }
    const foilCards = foilCardNumbers?.[index]?.[facultyIndex].join(",");
    axios
      .post(
        `${apiHost}/api/addFoilCard`,
        {
          allocationId,
          foilCard: foilCards,
        },
        {
          headers: {
            Auth: cookies.auth,
          },
        }
      )
      .then((response) => {
        toast.success(
          response.data.message || "Foil Cards added successfully."
        );
      });
  };

  const handleCircleClick = (index, facultyIndex, circleIndex) => {
    setCircleActiveState((prevState) => {
      return prevState.map((item, i) =>
        item.map((faculty, j) =>
          j === facultyIndex
            ? faculty.map((_, k) =>
                i === index && k === circleIndex ? !prevState[i][j][k] : false
              )
            : faculty.map((_, k) => false)
        )
      );
    });
    setSelectedCircleData({
      circleIndex: circleIndex,
      facultyIndex: facultyIndex,
      index: index,
    });
  };

  return (
    data?.length>0 ?
    <div  className="foilCardEntryTable">
      <table>
        <thead>
          <tr>
            <th>S. No.</th>
            <th>Course Code</th>
            <th>Faculty Name</th>
            <th>Paper Count</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) =>
           index==currentPage&& item.faculties.map((faculty, facultyIndex) => (
              <tr key={`${index}-${facultyIndex}`}>
                {facultyIndex === 0 && (
                  <>
                    <td rowSpan={item.faculties.length}>{index + 1}</td>
                    <td rowSpan={item.faculties.length}>{item.courseCode}</td>
                  </>
                )}
                <td>{faculty.facultyName}</td>
                <td>{faculty.paperCount}</td>
                <td>
                  <div className="masterEntryContainer">
                    <div className="circlesContainer">
                      {Array.from({
                        length: Math.ceil(faculty.paperCount / 25),
                      }).map((_, i) => (
                        <Circle
                          key={i}
                          onClick={() =>
                            handleCircleClick(index, facultyIndex, i)
                          }
                          color={
                            circleActiveState[index]?.[facultyIndex]?.[i]
                              ? "blue"
                              : "grey"
                          }
                          text={i + 1}
                        />
                      ))}
                    </div>
                    <div className="FoilCardLabelContainer">
                      {foilCardNumbers?.[index]?.[facultyIndex]?.map(
                        (circle, i) => {
                          return (
                            <Label
                              backgroundColor={labelColors[i]}
                              content={circle}
                            ></Label>
                          );
                        }
                      )}
                    </div>
                    <div className="foilNoContainer">
                      <TextField
                        value={
                          foilCardNumbers?.[index]?.[facultyIndex]?.[
                            selectedCircleData.circleIndex
                          ]
                        }
                        onChange={(e) => {
                          setFoilCardNumbers((prevState) => {
                            return prevState.map((item, i) =>
                              item.map((faculty, j) =>
                                j === facultyIndex
                                  ? faculty.map((_, k) =>
                                      i === index &&
                                      k === selectedCircleData.circleIndex
                                        ? e.target.value
                                        : faculty[k]
                                    )
                                  : faculty
                              )
                            );
                          });
                        }}
                        disabled={
                          selectedCircleData.index !== index ||
                          selectedCircleData.facultyIndex !== facultyIndex
                        }
                        size="small"
                      />
                      <Button
                        size={"small"}
                        onClick={() => {
                          handleFoilCardsPost(index, facultyIndex);
                        }}
                        label={"Post"}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tbody>
        <td align="center" colSpan={5}>
          <div className="paginationFoil">
            <Pagination  onChange={(_,page)=>{setCurrentPage(page-1)}} count={data.length} />
          </div>
        </td>
        </tbody>
      </table>
    </div>:<NoData/>
  );
};

export default FoilCardEntryTable;
