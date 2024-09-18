import { useState } from "react";
import "./AddYear.css";
import { InputLabel, TextField } from "@mui/material";
import Button from "../../../../components/button/Button";
import { Save } from "@mui/icons-material";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
const AddYear = ({ setIsAdding }) => {
  const [newYear, setNewYear] = useState({
    year: "",
    status: "1",
  });
  const [cookies, setCookie] = useCookies(["auth"]);
  const handleAddYear = () => {
    if(newYear.year === ''){
        return toast.error("Invalid year");
    }
   try{ axios
      .post(`${apiHost}/api/years`, newYear, {
        headers: {
          auth: cookies.auth,
        },
      })
      .then((response) => {
        toast.success(response.data.message || "Year added successfully");
        setNewYear({
          year: "",
          status: "1",
        });
        setIsAdding(false);
      })
      .catch((res) => {
        console.log(res)
        toast.error(res.response.data.error || "Failed to add Year");
      });}
      catch(error){
        toast.error(error.message || 'Error in Adding Year');
      }
  };

  return (
    <div className="addYearContainer">
      <div className="addYearFormContainer">
        <div>
          <InputLabel>Year</InputLabel>
          <TextField
            value={newYear.year}
            onChange={(e) => {
              setNewYear((prev) => {
                const newPrev = { ...prev };
                newPrev.year = e.target.value.trim();
                return newPrev;
              });
            }}
            size={"small"}
            style={{
              backgroundColor: "white",
              borderRadius: "5px",
            }}
          />
        </div>
        <div>
          <Button
            onClick={() => {
              handleAddYear();
            }}
            key={"add"}
            size={"small"}
            label={
              <div className="addFSaveButton">
                <Save /> Save
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AddYear;
