import { useState } from "react";
import "./AddBatch.css";
import { InputLabel, TextField } from "@mui/material";
import Button from "../../../../components/button/Button";
import { Save } from "@mui/icons-material";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const AddBatch = ({ setIsAdding }) => {
  const [newBatch, setNewBatch] = useState({
    batch: "",
    status: "1",
  });
  const [cookies] = useCookies(["auth"]);

  const handleAddBatch = () => {
    if (newBatch.batch === "") {
      return toast.error("Invalid batch");
    }
    try {
      axios
        .post(`${apiHost}/api/batches`, newBatch, {
          headers: {
            auth: cookies.auth,
          },
        })
        .then((response) => {
          toast.success(response.data.message || "Batch added successfully");
          setNewBatch({
            batch: "",
            status: "1",
          });
          setIsAdding(false);
        })
        .catch((res) => {
          toast.error(res.response.data.error || "Failed to add Batch");
        });
    } catch (error) {
      toast.error(error.message || "Error in Adding Batch");
    }
  };

  return (
    <div className="addYearContainer">
      <div className="addYearFormContainer">
        <div>
          <InputLabel>Batch</InputLabel>
          <TextField
            value={newBatch.batch}
            onChange={(e) => {
              setNewBatch((prev) => {
                const newPrev = { ...prev };
                newPrev.batch = e.target.value.trim();
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
              handleAddBatch();
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

export default AddBatch;
