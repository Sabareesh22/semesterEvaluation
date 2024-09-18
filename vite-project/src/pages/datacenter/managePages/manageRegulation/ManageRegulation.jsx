import { useEffect, useState } from "react";
import "./ManageRegulation.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { TextField } from "@mui/material";
import DatePickerWithRange from "../../../../components/datePicker/DatePicker";
import dayjs from "dayjs";
import { Label } from "recharts";
import Select from "react-select";
import { Cancel, Check, Delete, Edit } from "@mui/icons-material";
import { toast } from "react-toastify";
const ManageRegualtion = () => {
  const [regulationData, setRegulationData] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [activeOptions, setActionOptions] = useState([
    { value: "1", label: "Active" },
    { value: "0", label: "InActive" },
  ]);
  const [editRegulationState, setEditRegulationState] = useState([]);
  const [editRegulationData, setEditRegulationData] = useState([]);
  const fetchRegulationData = () => {
    axios
      .get(`${apiHost}/regulations`, {
        headers: { auth: cookies.auth },
      })
      .then((response) => {
        if (response.data) {
          setRegulationData(response.data);
        }
      });
  };

  useEffect(() => {
    setEditRegulationState(
      regulationData.map((_, i) => {
        return false;
      })
    );
    setEditRegulationData(regulationData);
  }, [regulationData]);

  useEffect(() => {
    fetchRegulationData();
  }, [cookies.auth]);

  const handleEditRegulation = (data) => {
    try {
      axios
        .put(`${apiHost}/api/regulation/${data.id}`, data, {
          headers: {
            auth: cookies.auth,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            toast.success(
              response.data.message || "Regulation Updated Successfully"
            );
            fetchRegulationData();
          } else {
            toast.success(
              response.data.message || "Regulation Updated Successfully"
            );
          }
        })
        .catch((exception) => {
          console.log(exception.response.data.message);
          toast.error(
            exception.response.data.message || "Error in Editing Regulation"
          );
        });
    } catch (error) {
      toast.error(error.message || "Error in Editing Regulation");
    }
  };

  const handleDeleteRegulation = (data) => {
    try {
      axios
       .delete(`${apiHost}/api/regulation/${data.id}`, {
          headers: {
            auth: cookies.auth,
          },
        })
       .then((response) => {
          if (response.status === 200) {
            toast.success(
              response.data.message || "Regulation Deleted Successfully"
            );
            fetchRegulationData();
          } else {
            toast.error(
              response.data.message || "Regulation Deleted Successfully"
            );
          }
        })
       .catch((exception) => {
          console.log(exception.response.data.message);
          toast.error(
            exception.response.data.message || "Error in Deleting Regulation"
          );
        });
    } catch (error) {
      toast.error(error.message || "Error in Deleting Regulation");
    }
  }

  return (
    <div className="manageRegulationMasterContainer">
      <div className="manageRegulationSelectContainer"></div>
      <div className="manageRegulationTableContainer">
        <table>
          <thead>
            <th>S.no</th>
            <th>Regulation</th>
            <th>Status</th>
          </thead>
          <tbody>
            {regulationData.map((data, index) =>
              !editRegulationState[index] ? (
                <tr key={index}>
                  <td>
                    <div className="editDeleteRegulationContainer">
                      <p>{index + 1}</p>
                      <div className="editDeleteRegulation">
                        <Edit
                          onClick={() => {
                            setEditRegulationState((prev) => {
                              const newPrev = [...prev];
                              newPrev[index] = true;
                              return newPrev;
                            });
                          }}
                        />
                        <Delete 
                          onClick={() => {
                            handleDeleteRegulation(data);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{data.regulation}</td>
                  <td>
                    {
                      activeOptions.find((opt) => opt.value === data.status)
                        ?.label
                    }
                  </td>
                </tr>
              ) : (
                <tr key={index}>
                  <td>
                    <div className="cancelCheckRegulationContainer">
                      <div className="cancelCheckRegulation">
                        <Cancel
                          onClick={() => {
                            setEditRegulationState((prev) => {
                              const newPrev = [...prev];
                              newPrev[index] = false;
                              return newPrev;
                            });
                          }}
                        />
                        <Check
                          onClick={() => {
                            handleEditRegulation(editRegulationData[index]);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <DatePickerWithRange
                      size={"small"}
                      value={dayjs(editRegulationData[index]?.regulation)}
                      onChange={(date) => {
                        setEditRegulationData((prev) => {
                          const newPrev = { ...prev };
                          newPrev[index].regulation = date.year().toString();
                          return newPrev;
                        });
                      }}
                      views={["year"]}
                    />
                  </td>
                  <td>
                    <Select
                      onChange={(selectedOption) => {
                        setEditRegulationData((prev) => {
                          const newPrev = { ...prev };
                          newPrev[index].status = selectedOption.value;
                          return newPrev;
                        });
                      }}
                      options={activeOptions}
                      value={activeOptions.find(
                        (opt) => opt.value === editRegulationData[index].status
                      )}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRegualtion;
