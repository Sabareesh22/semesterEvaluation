import React, { useState, useEffect } from "react";
import './ReportDownloadPage.css'
import {
  Container,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import Button from "../../components/button/Button";
import axios from "axios";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import apiHost from "../../../config/config";
import { useCookies } from "react-cookie";
import NoData from "../../components/noData/NoData";

const ReportDownloadPage = (props) => {
  const [departmentId, setDepartmentId] = useState(null);
  const [semcode, setSemcode] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [yearOptions, setYearOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);

    
  const [year, setYear] = useState(null);
  const [batch, setBatch] = useState(null);

  const [semcodes, setSemcodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);


  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get(`${apiHost}/batches`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedBatches = response.data.map((item) => ({
          value: item.id,
          label: item.batch,
        }));
        setBatchOptions(parsedBatches);
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchBatches();
  }, [cookies.auth]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(`${apiHost}/years`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedYears = response.data.map((item) => ({
          value: item.id,
          label: item.year,
        }));
        setYearOptions(parsedYears);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
  }, [cookies.auth]);


  useEffect(() => {
    props.setTitle("Report");
  }, []);


  useEffect(() => {
    const fetchSemesterCodes = async () => {
      if (!batch || !year) {
        return;
      }
      try {
        const response = await axios.get(
          `${apiHost}/api/semcodes?batch=${batch.value}&year=${year.value}`,
          {
            headers: {
              Auth: cookies.auth,
            },
          }
        );
        const parsedCodes = response.data.results.map((item) => ({
          value: item.id,
          label: item.semcode,
        }));
        setSemcodes(parsedCodes);
      } catch (error) {
        console.error("Error fetching semester codes:", error);
      }
    };

    fetchSemesterCodes();
  }, [batch, year, cookies.auth]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${apiHost}/departments`, {
          headers: {
            Auth: cookies.auth,
          },
        });
        const parsedDepartments = response.data.map((item) => ({
          value: item.id,
          label: item.department,
        }));
        setDepartments(parsedDepartments);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [cookies.auth]);

  useEffect(() => {
    const fetchData = async () => {
      if (!departmentId || !semcode || !reportType) return;

      setLoading(true);

      try {
        if(reportType.value == 1){
          const response = await axios.get(
            `${apiHost}/api/facultyAllocationReport`,
            {
              params: { departmentId: departmentId.value, semcode: semcode.value },
              headers: {
                Auth: cookies.auth,
              },
            }
          );
          setData(response.data.results);
        }
        else{
          const response = await axios.get(
            `${apiHost}/api/foilCardReport`,
            {
              params: { department: departmentId.value, semcode: semcode.value ,year:year.value,batch:batch.value},
              headers: {
                Auth: cookies.auth,
              },
            }
          );
          console.log(response.data)
          setData(response.data);
        }
      
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId, semcode,reportType]);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "faculty_report.xlsx");
  };

  // Get the table headers dynamically from the data
  const tableHeaders = data.length > 0 ? Object.keys(data[0]) : [];

  const reportTypeOptions = [
    { value: 1, label: "Paper Allocation Report" },
    { value: 2, label: "Foil Card Report" },
  ];

  return (
    <Container>
      <ToastContainer />
      <br />
      <div
        className="selectContainer"
        style={{
          display: "flex",
          gap: "16px",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          marginBottom: "16px",
          backgroundColor: "white", // Set background color to white
        }}
      >
          <div className="selectContainer">
              <Select
                value={batch}
                options={batchOptions}
                onChange={setBatch}
                placeholder={"Batch"}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 2 }) }}
              />
            </div>
            <div className="selectContainer">
              <Select
                value={year}
                options={yearOptions}
                onChange={setYear}
                placeholder={"Year"}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 2 }) }}
              />
            </div>
        <Select
          value={departmentId}
          onChange={setDepartmentId}
          options={departments}
          placeholder="Department"
          styles={{ container: (base) => ({ ...base, flex: 1 }) }}
        />
        <Select
          value={semcode}
          onChange={setSemcode}
          options={semcodes}
          placeholder="SemCode"
          styles={{ container: (base) => ({ ...base, flex: 1 }) }}
        />
        <Select
          value={reportType}
          onChange={setReportType}
          options={reportTypeOptions}
          placeholder="Report Type"
          styles={{ container: (base) => ({ ...base, flex: 1 }) }}
        />
      </div>
      {!data?.length > 0 && <NoData />}

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        data.length > 0 && (
          reportType.value===1 ?
          <>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                size={"small"}
                onClick={handleExport}
                label={"Export as XLSX"}
              >
              </Button>
            </div>
            <Container sx={{ overflowY: "scroll" }}>
              <Table sx={{ marginTop: 4, width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      S.No
                    </TableCell>
                    {tableHeaders.map((header) => (
                      <TableCell
                        align="center"
                        sx={{ color: "white", fontWeight: "bold" }}
                        key={header}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: "white" }}>
                  {data.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{index + 1}</TableCell>
                      {tableHeaders.map((header) => (
                        <TableCell key={header}>{row[header]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Container>
          </>:
          <>
           <div
           style={{
             width: "100%",
             display: "flex",
             justifyContent: "flex-end",
           }}
         >
           <Button
             size={"small"}
             onClick={handleExport}
             label={"Export as XLSX"}
           >
           </Button>
         </div>
          <TableContainer>
          <Table>
            <TableHead >
              <TableRow style={{color:"white"}}>
                <TableCell >Faculty Name</TableCell>
                <TableCell>Faculty Code</TableCell>
                <TableCell>Semester Code</TableCell>
                <TableCell>Paper Count</TableCell>
                <TableCell>Course Details</TableCell>
                <TableCell>Foil Card Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row['Faculty Name']}</TableCell>
                  <TableCell>{row['Faculty Code']}</TableCell>
                  <TableCell>{row['Semester Code']}</TableCell>
                  <TableCell>{row['Paper Count']}</TableCell>
                  <TableCell>{row['Course Details']}</TableCell>
                  <TableCell>
                    {row['Foil Card Number'].map((foil, i) => (
                      <div key={i}>{foil}</div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </>
        )
      )}
    </Container>
  );
};

export default ReportDownloadPage;
