import { useState } from "react";
import "./AddSemester.css";
import { InputLabel, TextField } from "@mui/material";
import Button from "../../../../components/button/Button";
import { Save } from "@mui/icons-material";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const AddSemester = ({ setIsAdding }) => {
  const [newSemester, setNewSemester] = useState({
    semester: "",
    status: "1",
  });
  const [cookies] = useCookies(["auth"]);

  const handleAddSemester = () => {
    if (newSemester.semester === "") {
      return toast.error("Invalid semester");
    }
    try {
      axios
        .post(`${apiHost}/api/semesters`, newSemester, {
          headers: {
            auth: cookies.auth,
          },
        })
        .then((response) => {
          toast.success(response.data.message || "Semester added successfully");
          setNewSemester({
            semester: "",
            status: "1",
          });
          setIsAdding(false);
        })
        .catch((res) => {
          console.log(res);
          toast.error(res.response.data.error || "Failed to add Semester");
        });
    } catch (error) {
      toast.error(error.message || "Error in Adding Semester");
    }
  };

  return (
    <div className="addYearContainer">
      <div className="addYearFormContainer">
        <div>
          <InputLabel>Semester</InputLabel>
          <TextField
            value={newSemester.semester}
            onChange={(e) => {
              setNewSemester((prev) => {
                const newPrev = { ...prev };
                newPrev.semester = e.target.value.trim();
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
              handleAddSemester();
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

export default AddSemester;
