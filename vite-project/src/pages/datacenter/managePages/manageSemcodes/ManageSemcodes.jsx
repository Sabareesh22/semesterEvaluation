import axios from "axios";
import "./ManageSemcodes.css";
import apiHost from "../../../../../config/config";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { Cancel, Check, Delete, Edit } from "@mui/icons-material";
import { TextField } from "@mui/material";
import Select from "react-select";
import { toast } from "react-toastify";
import Card from "../../../../components/card/Card";
const ManageSemcodes = () => {
  const [cookies, setCookies] = useCookies(["auth"]);
  const [semcodeData, setSemcodeData] = useState([]);
  const [editSemcodeState, setEditSemcodeState] = useState([]);
  const [editSemcodeData, setEditSemcodeData] = useState([]);
  const [filteredSemcodeData, setFilteredSemcodeData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOptions, setActiveOptions] = useState([
    {
      value: "1",
      label: "Active",
    },
    {
      value: "2",
      label: "InActive",
    },
  ]);

  useEffect(() => {
    setEditSemcodeData(
      filteredSemcodeData.map((data, i) => {
        return data;
      })
    );
    setEditSemcodeState(
      filteredSemcodeData.map((data, i) => {
        return false;
      })
    );
  }, [filteredSemcodeData]);

  useEffect(() => {
    setFilteredSemcodeData(
      semcodeData.filter((data) => {
        return data.semcode.toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [semcodeData, searchQuery]);

  const fetchSemcodes = () => {
    try {
      axios
        .get(`${apiHost}/api/semcodes`, {
          headers: {
            Auth: cookies.auth,
          },
        })
        .then((response) => {
          if (response.data) {
            setSemcodeData(response.data.results);
          }
        });
    } catch (error) {}
  };

  const handleEditSemcode = (data) => {
    name;
    try {
      console.log(data);
      axios
        .put(`${apiHost}/api/semcodes`, data, {
          headers: {
            Auth: cookies.auth,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            toast.success("Semcode updated successfully");
            fetchSemcodes();
          }
        });
    } catch (error) {
      toast.error(error.message || "Error updating");
    }
  };

  const handleDeleteSemcode = (data) => {
    try {
      axios
        .delete(`${apiHost}/api/semcodes/${data.id}`, {
          headers: {
            auth: cookies.auth,
          },
        })
        .then((response) => {
          if (response.status === 200) {
            toast.success("Semcode deleted successfully");
            fetchSemcodes();
          }
        });
    } catch (error) {
      toast.error(error.message || "Error deleting");
    }
  };

  useEffect(() => {
    fetchSemcodes();
  }, [cookies.auth]);
  return (
    <div className="manageSemcodesMasterContainer">
      <Card
        content={
          <div className="manageSemcodeSelectContainer">
            <TextField
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value.trim());
              }}
              placeholder="Search"
              size="small"
              style={{ backgroundColor: "white", borderRadius: "5px" }}
            />
          </div>
        }
      />

      <div className="manageSemcodesTableContainer">
        <table>
          <thead>
            <th>S.no</th>
            <th>Semcode</th>
            <th>Status</th>
          </thead>
          <tbody>
            {filteredSemcodeData.map((data, i) => {
              return !editSemcodeState?.[i] ? (
                <tr key={data.id}>
                  <td>
                    <div className="snoAndEditContainer">
                      <p>{i + 1}</p>
                      <div className="editAndDeleteSemcode">
                        <Edit
                          onClick={() => {
                            setEditSemcodeState((prev) => {
                              const newPrev = [...prev];
                              newPrev[i] = true;
                              return newPrev;
                            });
                          }}
                        />
                        <Delete
                          onClick={() => {
                            handleDeleteSemcode(data);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{data.semcode}</td>
                  <td>
                    {
                      activeOptions.find(
                        (option) => option.value === data.status
                      ).label || "Unknown" // assuming status is 1 for active and 2 for inactive. Replace with actual status check logic.
                    }
                  </td>
                </tr>
              ) : (
                <tr key={data.id}>
                  <td>
                    <div className="snoAndEditContainer">
                      <div>
                        <Cancel
                          onClick={() => {
                            setEditSemcodeState((prev) => {
                              const newPrev = [...prev];
                              newPrev[i] = false;
                              return newPrev;
                            });
                          }}
                        />
                        <Check
                          onClick={() => {
                            handleEditSemcode(editSemcodeData[i]);
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <TextField
                      value={editSemcodeData[i]?.semcode}
                      size="small"
                      style={{
                        width: 150,
                        backgroundColor: "white",
                        borderRadius: "5px",
                      }}
                      onChange={(e) => {
                        setEditSemcodeData((prev) => {
                          const newPrev = [...prev];
                          newPrev[i].semcode = e.target.value;
                          return newPrev;
                        });
                      }}
                    />
                  </td>
                  <td>
                    <Select
                      onChange={(selectedOption) => {
                        setEditSemcodeData((prev) => {
                          const newPrev = [...prev];
                          newPrev[i].status = selectedOption.value;
                          return newPrev;
                        });
                      }}
                      options={activeOptions}
                      value={activeOptions.find(
                        (opt) => opt.value === editSemcodeData[i]?.status
                      )}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ManageSemcodes;
