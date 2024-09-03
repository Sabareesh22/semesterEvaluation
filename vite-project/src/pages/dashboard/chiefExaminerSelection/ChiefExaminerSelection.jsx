import { useState } from "react";
import "./ChiefExaminerSelection.css";
import Label from "../../../components/label/Label";
import { Add } from "@mui/icons-material";
import DateRangePickerValue from "../../../components/datePicker/DatePicker";

const ChiefExaminerSelection = () => {
  const [chiefExaminerSelectionTableData, setChiefExaminerSelectionTableData] =
    useState([
      {
        date: "2022-08-01",
        course: [
          "Mathematics",
          "Mathematics",
          "Mathematics",
          "Mathematics",
          "Mathematics",
        ],
        totalCount: [30,30,30,30,30],
        chiefExaminer: [
          "Dr. Kumar Rajendran",
          "Dr. Kumar Rajendran",
          "Dr. Kumar Rajendran",
          "Dr. Kumar Rajendran",
        ],
      },
      {
        date: "2022-08-01",
        course: ["Mathematics"],
        totalCount: [30],
        chiefExaminer: ["Dr. Kumar Rajendran"],
      },
      {
        date: "2022-08-01",
        course: ["Mathematics"],
        totalCount: [30],
        chiefExaminer: ["Dr. Kumar Rajendran"],
      },
    ]);

  const colorsForIndexes = [
    "#A5DD9B",
    "#92C7CF",
    "#FFFBDA",
    "#D0A2F7",
    "#F9B572",
  ];

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
          {chiefExaminerSelectionTableData.map((data, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <DateRangePickerValue/>

              <td>
                <div className="courseDataBc">
                  {data.course.map((data, i) => {
                    return (
                      <div>
                          <Label
                          isClosable={true}
                            backgroundColor={colorsForIndexes[i]}
                            content={data}
                          ></Label>
                         
                      </div>
                    );
                  })}
                  <div className="addIconButtonContainer">
                  <Label content={<div className="addIconButton"><Add/> Add COE</div>}></Label>
                  </div>
                </div>
              </td>

              <td>
                <div className="courseDataBc">
                  {data.totalCount.map((data, i) => {
                    return (
                      <div>
                          <Label
                          isClosable={true}
                            backgroundColor={colorsForIndexes[i]}
                            content={data}
                          ></Label>
                         
                      </div>
                    );
                  })}
                  <div className="addIconButtonContainer">
                  <Label content={<div className="addIconButton"><Add/> Add COE</div>}></Label>
                  </div>
                </div>
              </td>
              <td>
                <div className="courseDataBc">
                  {data.chiefExaminer.map((data, i) => {
                    return (
                      <div>
                        <Label
                        isClosable={true}
                          backgroundColor={colorsForIndexes[i]}
                          content={data}
                        ></Label>
                      </div>
                    );
                  })}
                       <div className="addIconButtonContainer">
                  <Label content={<div className="addIconButton"><Add/> Add COE</div>}></Label>
                  </div>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChiefExaminerSelection;
