import { TextField } from "@mui/material";
import Circle from "../../../components/circle/Circle";
import "./foilCardEntryTable.css";
import { useEffect, useState } from "react";

const FoilCardEntryTable = () => {
  const [data, setData] = useState([
    {
      allocationId: 309,
      courseId: 30,
      courseCode: "18CS608",
      faculties: [
        {
          facultyId: 78,
          facultyCode: "CS10907",
          facultyName: "Dr S.S RAJASEKAR",
          paperCount: 100,
        },
        {
          facultyId: 61,
          facultyCode: "CS10025",
          facultyName: "Mr P.S DINESH",
          paperCount: 75,
        },
        {
          facultyId: 57,
          facultyCode: "CS1906",
          facultyName: "Ms R.RAMYA",
          paperCount: 14,
        },
      ],
    },
  ]);

  const [selectedCircleData, setSelectedCircleData] = useState({});

  const [circleActiveState, setCircleActiveState] = useState(() =>
    data.map((eachData) =>
      eachData.faculties.map((faculty) =>
        Array(Math.ceil(faculty.paperCount / 25)).fill(false)
      )
    )
  );

  const [foilCardNumbers, setFoilCardNumbers] = useState(() =>
    data.map((eachData) =>
      eachData.faculties.map((faculty) =>
        Array(Math.ceil(faculty.paperCount / 25)).fill("hi")
      )
    )
  );

  useEffect(() => {
    const updatedState = data.map((eachData) =>
      eachData.faculties.map((faculty) =>
        Array(Math.ceil(faculty.paperCount / 25)).fill(false)
      )
    );
    setCircleActiveState(updatedState);
  }, [data]);

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
    <table className="foilCardEntryTable">
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
          item.faculties.map((faculty, facultyIndex) => (
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
                  <TextField
                    value={
                      foilCardNumbers[index]?.[facultyIndex]?.[
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
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default FoilCardEntryTable;
