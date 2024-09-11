import { act, useEffect, useState } from "react";
import "./DataCenter.css";
import Card from "../../components/card/Card";
import DataCenterContainer from "./dataCenterContainer/DataCenterContainer";
import Button from "../../components/button/Button";
import Select from "react-select";
const DataCenter = ({ setTitle }) => {
  useEffect(() => {
    setTitle("Data Center");
  }, []);
  const [activeIndex, setActiveIndex] = useState(null);
  const [cardData, setCardsData] = useState([
    { title: "Manage Faculty" },
    { title: "Manage Board" },
    { title: "Manage FCM" },
    { title: "Manage Board Courses" },
    { title: "Manage Faculty" },
    { title: "Manage Board" },
    { title: "Manage FCM" },
    { title: "Manage Board Courses" },
  ]);
  const handleCardClick = (index) => {
    setActiveIndex(index);
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
                    activeIndex === i ? " rgba(139, 135, 255, 0.25)" : "transparent",
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
                  <Card
                    content={
                      <>
                        <div className="dcClickedCloseButtonContainer">
                          <Button
                            onClick={() => setActiveIndex(null)}
                            size={"small"}
                            label={"close"}
                          />
                        </div>
                        <div className="dcSelectContainer">
                          <Select />
                          <Select />
                          <Select />
                          <Select />
                        </div>
                      </>
                    }
                  ></Card>
                </div>
              )}
            </>
          ))}
        </div>
        {activeIndex !== null && (
          <div style={{ width: "100%" }} className="dcCardPageContainer">
            <div className="dcClickedCloseButtonContainer"></div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DataCenter;
