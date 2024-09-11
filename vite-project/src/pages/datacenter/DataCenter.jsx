import { useEffect, useState } from "react";
import "./DataCenter.css";
import Card from "../../components/card/Card";
import DataCenterContainer from "./dataCenterContainer/DataCenterContainer";
import Button from "../../components/button/Button";

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
    <>
      <div className="dataCenterContainer">
        <div className="dataCenterGrid">
          {cardData.map((data, i) => (
            <>
              <div
                onClick={() => handleCardClick(i)}
                style={
                  { zIndex: activeIndex === i ? "10" : "0" ,
                    display:activeIndex!==null && activeIndex !==i ?'none':'block'
                  }
                }
                className="grid-item"
              >
                <DataCenterContainer title={data.title} />
              </div>
            </>
          ))}
        </div>
      </div>
      {activeIndex !== null && (
        <div className="dcCardPageContainer">
          <div className="dcClickedCloseButtonContainer">
            <Button
              onClick={() => setActiveIndex(null)}
              size={"small"}
              label={"close"}
            />
          </div>
        </div>
      )}
    </>
  );
};
export default DataCenter;
