import { useEffect, useState } from "react";
import "./ManageSemester.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { Cancel, Check, Delete, Edit } from "@mui/icons-material";
import { TextField } from "@mui/material";
import Select from "react-select";
import { toast } from "react-toastify";

const ManageSemester = () => {
  const [semesterData, setSemesterData] = useState([]);
  const [cookies] = useCookies(["auth"]);
  const [activeOptions, setActiveOptions] = useState([
    { value: "1", label: "Active" },
    { value: "0", label: "InActive" },
  ]);
  const [editSemesterState, setEditSemesterState] = useState([]);
  const [editSemesterData, setEditSemesterData] = useState([]);

  const fetchSemesterData = () => {
    try {
      axios
        .get(`${apiHost}/api/semesters`, {
         
          headers: {
            auth: cookies.auth,
          },
        })
        .then((res) => {
            console.log(res.data)
          setSemesterData(res.data);
        })
        .catch(() => {
          toast.error("Failed to fetch semester data");
        });
    } catch (error) {
      toast.error("Failed to fetch semester data");
    }
  };

  const handleEditSemester = (data) => {
    if (data.semester === '') {
      return toast.error("Invalid semester");
    }
    try {
      axios
        .put(`${apiHost}/api/semesters/${data.id}`, data, {
          headers: {
            auth: cookies.auth,
          },
        })
        .then((response) => {
          toast.success(response.data.message || "Semester Updated Successfully");
          fetchSemesterData();
        })
        .catch((res) => {
          toast.error(res.response.data.message || "Error in Updating Semester");
        });
    } catch (error) {
      toast.error(error.message || "Error in Editing Semester");
    }
  };

  const handleDeleteSemester = (data) => {
    try {
      axios
        .delete(`${apiHost}/api/semesters/${data.id}`, {
          headers: { auth: cookies.auth },
        })
        .then((response) => {
          toast.success(response.data.message || "Semester Deleted Successfully");
          fetchSemesterData();
        })
        .catch((res) => {
          toast.error(res.response.data.message || "Error in deleting Semester");
        });
    } catch (error) {
      toast.error(error.message || "Error in deleting Semester");
    }
  };

  useEffect(() => {
    setEditSemesterData(semesterData);
    setEditSemesterState(semesterData.map(() => false));
  }, [semesterData]);

  useEffect(() => {
    fetchSemesterData();
  }, [cookies.auth]);

  return (
    <div className="manageSemesterMasterContainer">
      <div className="manageSemesterTableContainer">
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Semester</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {semesterData.map((data, index) =>
              !editSemesterState[index] ? (
                <tr key={index}>
                  <td>
                    <div className="snoAndEditYear">
                      <p>{index + 1}</p>
                      <div className="editAndDeleteYear">
                        <Edit
                          onClick={() => {
                            setEditSemesterState((prev) => {
                              const newPrev = [...prev];
                              newPrev[index] = true;
                              return newPrev;
                            });
                          }}
                        />
                        <Delete
                          onClick={() => {
                            handleDeleteSemester(data);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{data.semester}</td>
                  <td>
                    {activeOptions.find((opt) => opt.value === data.status)?.label}
                  </td>
                </tr>
              ) : (
                <tr key={index}>
                  <td>
                    <div>
                      <Cancel
                        onClick={() => {
                          setEditSemesterState((prev) => {
                            const newPrev = [...prev];
                            newPrev[index] = false;
                            return newPrev;
                          });
                        }}
                      />
                      <Check
                        onClick={() => {
                          handleEditSemester(editSemesterData[index]);
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <TextField
                      size="small"
                      style={{
                        maxWidth: 200,
                        backgroundColor: "white",
                        borderRadius: "5px",
                      }}
                      value={editSemesterData[index].semester}
                      onChange={(e) => {
                        setEditSemesterData((prevData) => {
                          const newPrev = [...prevData];
                          newPrev[index].semester = e.target.value.trim();
                          return newPrev;
                        });
                      }}
                    />
                  </td>
                  <td>
                    <Select
                      onChange={(selectedOption) => {
                        setEditSemesterData((prevData) => {
                          const newPrev = [...prevData];
                          newPrev[index].status = selectedOption.value;
                          return newPrev;
                        });
                      }}
                      value={activeOptions.find(
                        (opt) => opt.value === editSemesterData[index].status
                      )}
                      options={activeOptions}
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

export default ManageSemester;
