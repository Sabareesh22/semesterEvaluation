import { useEffect, useState } from "react";
import "./ManageCOE.css";
import { useCookies } from "react-cookie";
import axios from "axios";
import apiHost from "../../../../../config/config";
import { TextField } from "@mui/material";
import Card from "../../../../components/card/Card";
import { Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
const ManageCOE = () => {
  const [coeData, setCoeData] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [filteredCoeData, setFilteredCoeData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchCoeData = () => {
    try {
      axios
        .get(`${apiHost}/api/coe`, {
          headers: {
            Auth: cookies.auth,
          },
        })
        .then((response) => {
          console.log(response);
          if (response.data) {
            setCoeData(response.data);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setFilteredCoeData(
      coeData.filter((data) => {
        return (
          data.facultyInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          data.facultyInfo.faculty_id.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    );
  }, [coeData,searchQuery]);

  useEffect(() => {
    fetchCoeData();
  }, [cookies.auth]);

  const handleDeleteCOE = (data)=>{
     try {
        axios.delete(`${apiHost}/api/coe/${data.id}`,{
            headers: {
              Auth: cookies.auth,
            },
  
        }).then((response)=>{
            toast.success(response.data.message || 'Successfully deleted COE')
            fetchCoeData()
        })
     } catch (error) {
        toast.error(error.message || 'Error deleting COE')
     }
  }

  return (
    <div className="manageCOEMasterContainer">
    <Card  content={
 <div className="manageCOESelectContainer">
 <TextField
   placeholder="Search"
   size="small"
   style={{
     backgroundColor: "white",
     borderRadius: "5px",
   }}
   value={searchQuery}
   onChange={(e)=>{
     setSearchQuery(e.target.value.trim());
   }}
 />
</div>
    }/>
     
      <div className="manageCOETableContainer">
        <table>
          <thead>
            <th>S.no</th>
            <th>Name</th>
            <th>Faculty ID</th>
          </thead>
          <tbody>
            {filteredCoeData.map((data, index) => (
              <tr key={index}>
                <td><div className="snoAndDeleteCOE"><p>{index + 1}</p>
                   <div className="deleteCOEIcon"><Delete onClick={()=>{handleDeleteCOE(data)}}/></div>
                </div></td>
                <td>{data.facultyInfo.name}</td>
                <td>{data.facultyInfo.faculty_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCOE;
