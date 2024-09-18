import { useEffect, useState } from "react";
import "./ManageBatch.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { Cancel, Check, Delete, Edit } from "@mui/icons-material";
import { TextField } from "@mui/material";
import Select from "react-select";
import { toast } from "react-toastify";

const ManageBatch = () => {
  const [batchData, setBatchData] = useState([]);
  const [cookies] = useCookies(["auth"]);
  const [activeOptions] = useState([
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
  ]);
  const [editBatchState, setEditBatchState] = useState([]);
  const [editBatchData, setEditBatchData] = useState([]);

  const fetchBatchData = () => {
    try {
      axios
        .get(`${apiHost}/api/batches`, {
        
          headers: {
            auth: cookies.auth,
          },
        })
        .then((res) => {
            console.log(res.data)
          setBatchData(res.data);
        })
        .catch((err) => {
          toast.error("Failed to fetch batch data");
        });
    } catch (error) {
      toast.error("Failed to fetch batch data");
    }
  };

  const handleEditBatch = (data) => {
    if (data.batch === "") {
      return toast.error("Invalid batch");
    }
    try {
      axios
        .put(`${apiHost}/api/batches/${data.id}`, data, {
          headers: {
            auth: cookies.auth,
          },
        })
        .then((response) => {
          toast.success(response.data.message || "Batch updated successfully");
          fetchBatchData();
        })
        .catch((res) => {
          toast.error(res.response.data.message || "Error in updating batch");
        });
    } catch (error) {
      toast.error(error.message || "Error in editing batch");
    }
  };

  const handleDeleteBatch = (data) => {
    try {
      axios
        .delete(`${apiHost}/api/batches/${data.id}`, {
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          toast.success(response.data.message || "Batch deleted successfully");
          fetchBatchData();
        })
        .catch((res) => {
          toast.error(res.response.data.message || "Error in deleting batch");
        });
    } catch (error) {
      toast.error(error.message || "Error in deleting batch");
    }
  };

  useEffect(() => {
    setEditBatchData(batchData);
    setEditBatchState(batchData.map((_, i) => false));
  }, [batchData]);

  useEffect(() => {
    fetchBatchData();
  }, [cookies.auth]);

  return (
    <div className="manageBatchMasterContainer">
      <div className="manageBatchTableContainer">
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Batch</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {batchData.map((data, index) =>
              !editBatchState[index] ? (
                <tr key={index}>
                  <td>
                    <div className="snoAndEditYear">
                      <p>{index + 1}</p>
                      <div className="editAndDeleteYear">
                        <Edit
                          onClick={() => {
                            setEditBatchState((prev) => {
                              const newPrev = [...prev];
                              newPrev[index] = true;
                              return newPrev;
                            });
                          }}
                        />
                        <Delete
                          onClick={() => {
                            handleDeleteBatch(data);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{data.batch}</td>
                  <td>
                    {activeOptions.find((opt) => opt.value === data.status)
                      ?.label}
                  </td>
                </tr>
              ) : (
                <tr key={index}>
                  <td>
                    <div>
                      <div>
                        <Cancel
                          onClick={() => {
                            setEditBatchState((prev) => {
                              const newPrev = [...prev];
                              newPrev[index] = false;
                              return newPrev;
                            });
                          }}
                        />
                        <Check
                          onClick={() => {
                            handleEditBatch(editBatchData[index]);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <TextField
                      value={editBatchData[index].batch}
                      onChange={(e) => {
                        setEditBatchData((prev) => {
                          const newPrev = [...prev];
                          newPrev[index].batch = e.target.value;
                          return newPrev;
                        });
                      }}
                      size={"small"}
                    />
                  </td>
                  <td>
                    <Select
                      value={activeOptions.find(
                        (opt) => opt.value === editBatchData[index].status
                      )}
                      options={activeOptions}
                      onChange={(e) => {
                        setEditBatchData((prev) => {
                          const newPrev = [...prev];
                          newPrev[index].status = e.value;
                          return newPrev;
                        });
                      }}
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

export default ManageBatch;
