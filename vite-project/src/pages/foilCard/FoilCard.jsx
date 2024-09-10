import { useEffect, useState } from "react";
import "./FoilCard.css";
import Card from "../../components/card/Card";
import Select from "react-select";
import Button from "../../components/button/Button";
import { Pagination, TextField } from "@mui/material";
import Circle from "../../components/circle/Circle";
import { useCookies } from "react-cookie";
import axios from "axios";
import NoData from '../../components/noData/NoData';
import apiHost from "../../../config/config";
import { toast, ToastContainer } from 'react-toastify';
import FoilCardEntryTable from "./foilCardEntryTable/foilCardEntryTable";

export default function FoilCard(props) {
  const [yearOptions, setYearOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [semcodeOptions, setSemcodeOptions] = useState([]);

  const [year, setYear] = useState(null);
  const [batch, setBatch] = useState(null);
  const [department, setDepartment] = useState(null);
  const [semcode, setSemcode] = useState(null);
  const [cookies] = useCookies(["auth"]);

  const [foilCardTableData, setFoilCardTableData] = useState([]);
  const [paginatedFoilCardTableData, setPaginatedFoilCardTableData] = useState([]);

  const [circleStatuses, setCircleStatuses] = useState({});
  const [foilCardNumbers, setFoilCardNumbers] = useState({});
  const [currentCircle, setCurrentCircle] = useState({ courseCode: null, facultyIndex: null, circleIndex: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsRes, batchesRes, yearsRes] = await Promise.all([
          axios.get(`${apiHost}/departments`, { headers: { Auth: cookies.auth } }),
          axios.get(`${apiHost}/batches`, { headers: { Auth: cookies.auth } }),
          axios.get(`${apiHost}/years`, { headers: { Auth: cookies.auth } })
        ]);

        setDepartmentOptions(departmentsRes.data.map(item => ({ value: item.id, label: item.department })));
        setBatchOptions(batchesRes.data.map(item => ({ value: item.id, label: item.batch })));
        setYearOptions(yearsRes.data.map(item => ({ value: item.id, label: item.year })));
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchData();
  }, [cookies.auth]);

  useEffect(() => {
    if (batch && year) {
      axios.get(`${apiHost}/api/semcodes`, {
        params: { batch: batch.value, year: year.value },
        headers: { Auth: cookies.auth }
      })
        .then(response => {
          setSemcodeOptions(response.data.results.map(item => ({ value: item.id, label: item.semcode })));
        })
        .catch(error => console.error("Error fetching semester codes:", error));
    }
  }, [batch, year, cookies.auth]);

  useEffect(() => {
    if (department && semcode) {
      axios.get(`${apiHost}/api/foilCardEntryTableData`, {
        params: { department: department.value, semcode: semcode.value, year: year.value, batch: batch.value },
        headers: { Auth: cookies.auth }
      })
        .then(response => {
          setFoilCardTableData(response.data.data);
        })
        .catch(error => console.error("Error fetching foil card data:", error));
    }
  }, [department, semcode, year, batch, cookies.auth]);

  useEffect(() => { 
    console.log(foilCardTableData)
  },[foilCardTableData])

  useEffect(() => {
    props.setTitle("Foil Card");
  }, [props]);





  return (
    <div className="foilCardPageContainer">
      <ToastContainer />
      <Card
        content={
          <div className="foilCardTopSelects">
            <SelectContainer
              value={department}
              options={departmentOptions}
              onChange={setDepartment}
              placeholder="Department"
            />
            <SelectContainer
              value={batch}
              options={batchOptions}
              onChange={setBatch}
              placeholder="Batch"
            />
            <SelectContainer
              value={year}
              options={yearOptions}
              onChange={setYear}
              placeholder="Year"
            />
            <SelectContainer
              value={semcode}
              options={semcodeOptions}
              onChange={setSemcode}
              placeholder="Semcode"
            />
          </div>
        }
      />
     <div><FoilCardEntryTable/></div>
    </div>
  );
}

// Helper Component for Select Fields
const SelectContainer = ({ value, options, onChange, placeholder }) => (
  <div style={{ marginRight: 10, flex: 1 }}>
    <Select
      menuPortalTarget={document.body} 
      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isClearable
    />
  </div>
);


