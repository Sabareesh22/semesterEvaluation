import { useEffect, useState } from "react";
import "./DataCenter.css";
import Card from "../../components/card/Card";
import DataCenterContainer from "./dataCenterContainer/DataCenterContainer";
import Button from "../../components/button/Button";
import Select from "react-select";
import ManageFaculty from "./manageFaculty/ManageFaculty";
import { Close } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ManageBoard from "./manageBoard/ManageBoard";
import ManageFCM from "./manageFCM/ManageFCM";
import ManageBoardCourses from "./manageBoardCourses/ManageBoardCourses";

const DataCenter = ({ setTitle }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    setTitle("Data Center");
  }, [setTitle]);

  useEffect(() => {
    const index = searchParams.get("activeIndex");
    setActiveIndex(index ? parseInt(index, 10) : null);
  }, [searchParams]);

  const [cardData] = useState([
    { title: "Manage Faculty", component: <ManageFaculty /> },
    { title: "Manage Board" , component:<ManageBoard/> },
    { title: "Manage FCM" ,component:<ManageFCM/>},
    { title: "Manage Board Courses",component:<ManageBoardCourses/> },
  ]);

  const handleCardClick = (index) => {
    setSearchParams({ activeIndex: index });
  };

  return (
    <div className="masterDataCenterContainer">
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
                        <h4>No Actions Selected</h4>
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
            <div className="dcPageComponentContainer">
              {cardData[activeIndex]?.component}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCenter;
