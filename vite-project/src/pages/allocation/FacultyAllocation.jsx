import React, { useEffect, useState } from "react";

import Select from "react-select";
import axios, { toFormData } from "axios";
import apiHost from "../../../config/config";
import * as XLSX from "xlsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCookies } from "react-cookie";
import NoData from "../../components/noData/NoData";
import "./FacultyAllocation.css";
import FacultyAllocationTable from "./facultyAllocationTable/FacultyAllocationTable";
import FacultyUploadTable from "./facultyUploadTable/FacultyUploadTable";

const FacultyAllocation = (props) => {
  const [semesterCodes, setSemesterCodes] = useState([]);
  const [selectedSemesterCode, setSelectedSemesterCode] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [year, setYear] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [batch, setBatch] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [courses, setCourses] = useState([]);
  const [uploadData, setUploadData] = useState([]);
  const [showUploadContainer, setShowUploadContainer] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [cookies, setCookie] = useCookies(["auth"]);
  const [roles, setRoles] = useState([]);
  const [hodDetails, setHodDetails] = useState({});

  useEffect(() => {
    props.setTitle("Allocation");
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
        setSemesterCodes(parsedCodes);
      } catch (error) {
        console.error("Error fetching semester codes:", error);
      }
    };

    fetchSemesterCodes();
  }, [batch, year]);

  useEffect(() => {
    try {
      if (roles.includes("hod")) {
        axios
          .get(`${apiHost}/auth/hodDetails`, {
            headers: {
              Auth: cookies.auth,
            },
          })
          .then((res) => {
            setHodDetails(res.data[0]);
            setDepartmentId({ value: res.data[0]?.department });
          });
      }
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  }, [cookies.auth, roles]);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        if (cookies.auth) {
          const response = await axios.get(`${apiHost}/auth/role`, {
            headers: {
              auth: cookies.auth,
            },
          });
          setRoles(response.data.roles);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchRole();
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
  }, []);
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
  }, []);
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
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      if (departmentId && selectedSemesterCode) {
        try {
          const response = await axios.get(
            `${apiHost}/api/courses/${departmentId.value}/${selectedSemesterCode.value}`,
            {
              headers: {
                Auth: cookies.auth,
              },
            }
          );
          console.log("Allocation data : ", response.data.results);
          setCourses(response.data.results);
          setShowUploadContainer(false); // Hide upload container on successful fetch
        } catch (error) {
          if (error.response) {
            if (error.response.status === 404) {
              setUploadData([]); // Clear any previous upload data
              setShowUploadContainer(true); // Show upload container on error
              toast.error(
                error.response.data.message ||
                  "The selected semester code has no eligible faculty."
              );
            } else {
              toast.error(
                "Error fetching courses: " +
                  (error.response.data.message || "Unknown error")
              );
            }
          } else {
            toast.error("Network error. Please try again later.");
          }
        }
      }
    };

    fetchCourses();
  }, [departmentId, selectedSemesterCode]);

  const handleFileUpload = async () => {
    const formattedData = uploadData
      .filter((row) => row.length > 0 && row[0]) // Ensure the row has at least one column and the first column (facultyId) is not empty
      .map((row) => ({
        facultyId: row[0], // Assuming the first column contains facultyId
        semcode: selectedSemesterCode.value, // Use the selected semester code
        department: departmentId.value, // Use the selected department ID
      }));

    if (formattedData.length === 0) {
      toast.error("No valid data to upload.");
      return; // Exit if there's no valid data
    }

    try {
      const response = await axios.post(
        `${apiHost}/api/uploadEligibleFaculty`,
        formattedData,
        {
          headers: {
            Auth: cookies.auth,
          },
        }
      );
      toast.success(response.data.message || "File uploaded successfully.");

      setUploadData([]);
      setHeaders([]);

      const fetchCourses = async () => {
        if (departmentId && selectedSemesterCode) {
          try {
            const courseResponse = await axios.get(
              `${apiHost}/api/courses/${departmentId.value}/${selectedSemesterCode.value}`,
              {
                headers: {
                  Auth: cookies.auth,
                },
              }
            );
            setCourses(courseResponse.data.results);
            setShowUploadContainer(false); // Hide upload container on successful fetch
          } catch (error) {
            toast.error(
              "Error fetching courses after upload: " +
                (error.response?.data?.message || "Unknown error")
            );
          }
        }
      };

      fetchCourses(); // Trigger refetching of courses
    } catch (error) {
      toast.error(
        "Error uploading file: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const handleCancel = () => {
    setShowUploadContainer(true);
    setUploadData([]); // Clear the upload data
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = json[0];
        const newData = json.slice(1);
        setHeaders(headers);
        setUploadData(newData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="allocationMasterContainer">
      
      <div
        className="selectContainer"
        style={{
          margin: "20px 20px",
          padding: "20px",
          borderRadius: "10px",
          display: "flex",
          gap: "10px",
          flex:"1",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: "30%", float: "right" }}>
          <Select
            placeholder="Select Year"
            value={year}
            onChange={(selectedOption) => setYear(selectedOption)}
            options={yearOptions}
            isClearable
          />
        </div>
        <div style={{ width: "30%", float: "right" }}>
          <Select
            placeholder="Select Batch"
            value={batch}
            onChange={(selectedOption) => setBatch(selectedOption)}
            options={batchOptions}
            isClearable
          />
        </div>
        <div style={{ width: "30%", float: "right" }}>
          <Select
            placeholder="Select SemCode"
            value={selectedSemesterCode}
            onChange={(selectedOption) =>
              setSelectedSemesterCode(selectedOption)
            }
            options={semesterCodes}
            isClearable
          />
        </div>
      </div>
      {!courses.length > 0 && !showUploadContainer && <NoData />}
      {courses.length > 0 ? (
        <FacultyAllocationTable
          departmentId={departmentId}
          selectedSemesterCode={selectedSemesterCode}
          courses={courses}
        />
      ) : (
        showUploadContainer &&
        uploadData.length == 0 && (
          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              width: "80%",
              marginLeft: "auto",
              marginRight: "auto",
              border: "2px dashed #ccc",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            <CloudUploadIcon style={{ fontSize: "50px", color: "#888" }} />
            <p style={{ marginTop: "10px" }}>Click to upload Excel file</p>
          </div>
        )
      )}
      {uploadData.length > 0 && (
        <FacultyUploadTable
          headers={headers}
          data={uploadData}
          onCancel={handleCancel}
          onSubmit={handleFileUpload}
        />
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss={false}
        style={{ fontFamily: "Poppins, sans-serif" }}
      />
    </div>
  );
};

export default FacultyAllocation;
