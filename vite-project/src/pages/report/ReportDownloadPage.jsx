import React, { useState, useEffect } from "react";
import "./ReportDownloadPage.css";
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
  const [cookies] = useCookies(["auth"]);

  const reportTypeOptions = [
    { value: 1, label: "Paper Allocation Report" },
    { value: 2, label: "Foil Card Report" },
  ];

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
  }, [props]);

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
        let response;
        if (reportType.value === 1) {
          response = await axios.get(`${apiHost}/api/facultyAllocationReport`, {
            params: {
              departmentId: departmentId.value,
              semcode: semcode.value,
            },
            headers: {
              Auth: cookies.auth,
            },
          });
          response = response.data.results
        } else {
          response = await axios.get(`${apiHost}/api/foilCardReport`, {
            params: {
              department: departmentId.value,
              semcode: semcode.value,
              year: year.value,
              batch: batch.value,
            },
            headers: {
              Auth: cookies.auth,
            },
          });
          response= response.data;
        }
        console.log(response)
        setData(response);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId, semcode, reportType, year, batch]);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    
    if (reportType.value === 1) {
      // Paper Allocation Report
      const flattenedData = data.flatMap((course) =>
        course.facultyData.map((faculty) => ({
          CourseCode: course.courseCode,
          CourseName: course.courseName,
          FacultyId: faculty.facultyId,
          FacultyName: faculty.facultyName,
          PaperCount: faculty.paperCount,
          Remark: faculty.remark,
          SemesterCode: course.semcode,
        }))
      );
  
      const ws = XLSX.utils.json_to_sheet(flattenedData);
      const wscols = [
        { wpx: 120 }, // Column width for CourseCode
        { wpx: 200 }, // Column width for CourseName
        { wpx: 120 }, // Column width for FacultyId
        { wpx: 200 }, // Column width for FacultyName
        { wpx: 120 }, // Column width for PaperCount
        { wpx: 150 }, // Column width for Remark
        { wpx: 150 }, // Column width for SemesterCode
      ];
  
      const merge = [];
  
      let startRow = 1; // Start from the first row (index 1 for data)
      flattenedData.forEach((row, index) => {
        if (index > 0 && flattenedData[index - 1].CourseCode === row.CourseCode) {
          merge.push({
            s: { r: startRow, c: 0 },
            e: { r: startRow + flattenedData.filter((d) => d.CourseCode === row.CourseCode).length - 1, c: 0 }
          });
          merge.push({
            s: { r: startRow, c: 1 },
            e: { r: startRow + flattenedData.filter((d) => d.CourseCode === row.CourseCode).length - 1, c: 1 }
          });
          startRow += flattenedData.filter((d) => d.CourseCode === row.CourseCode).length;
        } else {
          startRow = index + 1;
        }
      });
  
      ws['!merges'] = merge;
      ws['!cols'] = wscols;
  
      XLSX.utils.book_append_sheet(wb, ws, "Paper Allocation Report");
  
    } else if (reportType.value === 2) {
      // Foil Card Report
      const flattenedData = data.map((item) => ({
        FacultyName: item["Faculty Name"],
        FacultyCode: item["Faculty Code"],
        SemesterCode: item["Semester Code"],
        PaperCount: item["Paper Count"],
        CourseDetails: item["Course Details"],
        FoilCardNumber: item["Foil Card Number"].join(", "), // Join Foil Card Numbers as a single string
      }));
  
      const ws = XLSX.utils.json_to_sheet(flattenedData);
      const wscols = [
        { wpx: 200 }, // Column width for FacultyName
        { wpx: 120 }, // Column width for FacultyCode
        { wpx: 120 }, // Column width for SemesterCode
        { wpx: 120 }, // Column width for PaperCount
        { wpx: 200 }, // Column width for CourseDetails
        { wpx: 200 }, // Column width for FoilCardNumber
      ];
  
      XLSX.utils.book_append_sheet(wb, ws, "Foil Card Report");
    }
  
    XLSX.writeFile(wb, "report.xlsx");
  };

  // Render table columns based on report type
  const renderTableColumns = () => {
    if (reportType.value === 1) {
      return (
        <>
          <TableCell>Course Code</TableCell>
          <TableCell>Course Name</TableCell>
          <TableCell>Faculty ID</TableCell>
          <TableCell>Faculty Name</TableCell>
          <TableCell>Paper Count</TableCell>
          <TableCell>Remark</TableCell>
          <TableCell>Semester Code</TableCell>
        </>
      );
    } else if (reportType.value === 2) {
      return (
        <>
          <TableCell>Faculty Name</TableCell>
          <TableCell>Faculty Code</TableCell>
          <TableCell>Semester Code</TableCell>
          <TableCell>Paper Count</TableCell>
          <TableCell>Course Details</TableCell>
          <TableCell>Foil Card Number</TableCell>
        </>
      );
    }
  };

  // Render table rows based on report type
  const renderTableRows = () => {
    if (reportType.value === 1) {
      return data.map((course) => {
        const { courseCode, courseName, semcode, facultyData } = course;
        return facultyData.map((faculty, index) => (
          <TableRow key={faculty.facultyId}>
            {index === 0 && (
              <>
                <TableCell rowSpan={facultyData.length}>
                  {courseCode}
                </TableCell>
                <TableCell rowSpan={facultyData.length}>
                  {courseName}
                </TableCell>
                <TableCell>{faculty.facultyId}</TableCell>
                <TableCell>{faculty.facultyName}</TableCell>
                <TableCell>{faculty.paperCount}</TableCell>
                <TableCell>{faculty.remark}</TableCell>
                <TableCell rowSpan={facultyData.length}>
                  {semcode}
                </TableCell>
              </>
            )}
            {index > 0 && (
              <>
                <TableCell>{faculty.facultyId}</TableCell>
                <TableCell>{faculty.facultyName}</TableCell>
                <TableCell>{faculty.paperCount}</TableCell>
                <TableCell>{faculty.remark}</TableCell>
              </>
            )}
          </TableRow>
        ));
      });
    } else if (reportType.value === 2) {
      return data.map((item) => (
        <TableRow key={item["Faculty Code"]}>
          <TableCell>{item["Faculty Name"]}</TableCell>
          <TableCell>{item["Faculty Code"]}</TableCell>
          <TableCell>{item["Semester Code"]}</TableCell>
          <TableCell>{item["Paper Count"]}</TableCell>
          <TableCell>{item["Course Details"]}</TableCell>
          <TableCell>{item["Foil Card Number"].join(", ")}</TableCell>
        </TableRow>
      ));
    }
  };

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
          backgroundColor: "white",
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
              />
            </div>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {renderTableColumns()}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderTableRows()}
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
