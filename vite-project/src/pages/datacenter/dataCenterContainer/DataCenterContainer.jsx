import { Add, Cancel, Edit, Remove, Upload } from "@mui/icons-material";
import Button from "../../../components/button/Button";
import Card from "../../../components/card/Card";
import "./DataCenterContainer.css";
import { useState } from "react";

const DataCenterContainer = ({title,backgroundColor,onAdd,onCancel,isAdding}) => {
    
  return (
    <div className="dataCenterContainer">
      <Card
      styles={{
        backgroundColor:backgroundColor
      }}
        content={
          <div className="masterDcCard">
            
            <div className="dcContainerHeading">
              <h3>{title}</h3>
            </div>
            <div className="masterDcIconContainer">
            <div className="dcEditAddButtonContainer">
                <Button size={"small"} label={<div className="dcIconContainer"><Edit/> Edit</div>}/>
                <Button size={"small"} onClick={onAdd} label={<div className="dcIconContainer"><Add/> Add</div>}/>
            </div>
            <div className="cancelAddingFaculty">
            {isAdding&&<Button size={"small"} onClick={onCancel} label={<div className="dcIconContainer"><Cancel/> Cancel</div>}/>}
            </div>
            </div>
           
          </div>
        }
      ></Card>
    </div>
  );
};
export default DataCenterContainer;
