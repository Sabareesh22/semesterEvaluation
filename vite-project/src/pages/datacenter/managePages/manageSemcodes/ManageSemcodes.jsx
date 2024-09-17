import axios from "axios";
import "./ManageSemcodes.css";
import apiHost from "../../../../../config/config";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { Cancel, Check, Delete, Edit } from "@mui/icons-material";
import { TextField } from "@mui/material";
import Select from 'react-select';
const ManageSemcodes = () => {
  const [cookies, setCookies] = useCookies(["auth"]);
  const [semcodeData, setSemcodeData] = useState([]);
  const [editSemcodeState, setEditSemcodeState] = useState([]);
  const [editSemcodeData, setEditSemcodeData] = useState([]);
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
      semcodeData.map((data, i) => {
        return data;
      })
    );
    setEditSemcodeState(
      semcodeData.map((data, i) => {
        return false;
      })
    );
  }, [semcodeData]);

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
  useEffect(() => {
    fetchSemcodes();
  }, [cookies.auth]);
  return (
    <div className="manageSemcodesMasterContainer">
      <div></div>
      <div className="manageSemcodesTableContainer">
        <table>
          <thead>
            <th>S.no</th>
            <th>Semcode</th>
            <th>Status</th>
          </thead>
          <tbody>
            {semcodeData.map((data, i) => {
              return !editSemcodeState?.[i] ? (
                <tr key={data.id}>
                  <td>
                    <div className="snoAndEditContainer">
                      <p>{i + 1}</p>
                      <div className="editAndDeleteSemcode">
                        <Edit onClick={
                            ()=>{
                                setEditSemcodeState((prev) => {
                                  const newPrev = [...prev];
                                  newPrev[i] = true;
                                  return newPrev;
                                });
                            }
                        } />
                        <Delete />
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
                        <Cancel onClick={
                            ()=>{
                                setEditSemcodeState((prev) => {
                                  const newPrev = [...prev];
                                  newPrev[i] = false;
                                  return newPrev;
                                });
                            }
                        } />
                        <Check />
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

                      />
                  </td>
                  <td>
                      <Select
                      options={activeOptions}
                      value={activeOptions.find((opt)=>(opt.value === editSemcodeData[i]?.status ))}
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
