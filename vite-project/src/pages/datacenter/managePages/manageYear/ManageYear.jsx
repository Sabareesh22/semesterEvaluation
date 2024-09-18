import { useEffect, useState } from "react";
import "./ManageYear.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { Cancel, Check, Delete, Edit } from "@mui/icons-material";
import { TextField } from "@mui/material";
import Select from "react-select";
import { toast } from "react-toastify";
const ManageYear = () => {
  const [yearData, setYearData] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [activeOptions, setActiveOptions] = useState([
    { value: "1", label: "Active" },
    { value: "0", label: "InActive" },
  ]);
  const [editYearState, setEditYearState] = useState([]);
  const [editYearData, setEditYearData] = useState([]);
  const fetchYearData = () => {
    try {
      axios
        .get(`${apiHost}/years`, {
          params: {
            allYears: true,
          },
          headers: {
            auth: cookies.auth,
          },
        })
        .then((res) => {
          setYearData(res.data);
        })
        .catch((err) => {
          toast.error("Failed to fetch year data");
        });
    } catch (error) {
      toast.error("Failed to fetch year data");
    }
  };

  const handleEditYear = (data)=>{
    if(data.year === ''){
        return toast.error("Invalid year");
    }
    try {
        axios.put(`${apiHost}/api/years/${data.id}`,data,{
            headers: {
                auth: cookies.auth,
            },
        }).then((response)=>{
            toast.success(response.data.message || 'Year Updated Successfully');
            fetchYearData();
        }).catch((res)=>{
            toast.error(res.response.data.message || 'Error in Updating Year');
        })
    } catch (error) {
        toast.error(error.message || 'Error in Editing Year');
    }
  }

  const handleDeleteYear = (data)=>{
    try {
        axios.delete(`${apiHost}/api/years/${data.id}`,{headers: {auth: cookies.auth}
        }).then((response)=>{
            toast.success(response.data.message || 'Year Deleted Successfully');
            fetchYearData();
        }).catch((res)=>{
            toast.error(res.response.data.message || 'Error in deleting Year');
        })
    } catch (error) {
        toast.error(error.message || 'Error in deleting Year');
    }
  }

  useEffect(() => {
    setEditYearData(yearData);
    setEditYearState(yearData.map((_, i) => false));
  }, [yearData]);

  useEffect(() => {
    fetchYearData();
  }, [cookies.auth]);

  return (
    <div className="manageYearMasterContainer">
      <div className="manageYearSelectContainer"></div>
      <div className="manageYearTableContainer">
        <table>
          <thead>
            <th>S.no</th>
            <th>Year</th>
            <th>Action</th>
          </thead>
          <tbody>
            {yearData.map((data, index) =>
              !editYearState[index] ? (
                <tr key={index}>
                  <td>
                    <div className="snoAndEditYear">
                      <p>{index + 1}</p>
                      <div className="editAndDeleteYear">
                        <Edit onClick={
                            () => {
                              setEditYearState((prev) => {
                                const newPrev = [...prev];
                                newPrev[index] = true;
                                return newPrev;
                              });
                            }}
                         />
                        <Delete 
                        onClick={
                            ()=>{
                                handleDeleteYear(data);
                            }
                        }
                        />
                      </div>
                    </div>
                  </td>
                  <td>{data.year}</td>
                  <td>
                    {
                      activeOptions.find((opt) => opt.value === data.status)
                        .label
                    }
                  </td>
                </tr>
              ) : (
                <tr key={index}>
                <td>
                  <div>
                    <div >
                      <Cancel 
                      onClick={
                        () => {
                          setEditYearState((prev) => {
                            const newPrev = [...prev];
                            newPrev[index] = false;
                            return newPrev;
                          });
                        }}
                      
                      />
                      <Check
                      onClick={
                        ()=>{
                            handleEditYear(editYearData[index]);
                         
                        }
                      }
                      />
                    </div>
                  </div>
                </td>
                <td>
                    <TextField
                    size="small"
                    style={
                       { maxWidth: 200,
                        backgroundColor: "white",
                        borderRadius:'5px'
                      }
                    }
                     value={editYearData[index].year}
                     onChange={(e)=>{
                        setEditYearData((prevData) => {
                          const newPrev = [...prevData];
                          newPrev[index].year = e.target.value.trim();
                          return newPrev;
                        });
                     }}
                    />
                </td>
                <td>
                    <Select
                    onChange={
                        (selectedOption) => {
                          setEditYearData((prevData) => {
                            const newPrev = [...prevData];
                            newPrev[index].status = selectedOption.value;
                            return newPrev;
                          });
                        }}
                      size="small"
                    
                    value={activeOptions.find((opt) => opt.value === editYearData[index].status)}
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


export default ManageYear;