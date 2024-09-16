import { useCookies } from "react-cookie";
import "./ManageFaculty.css";
import axios from "axios";
import apiHost from "../../../../config/config";
import { useEffect, useState } from "react";
import Select from "react-select";
import dayjs from "dayjs";
import { TextField } from "@mui/material";
import DatePickerWithRange from "../../../components/datePicker/DatePicker";
import { Cancel, Check, Edit } from "@mui/icons-material";
import { toast } from "react-toastify";
const ManageFaculty = ({ isAdding }) => {
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState(null);
  const [cookies, setCookies] = useCookies(["auth"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState(null);
  const [filteredManageFacultyData, setFilteredManageFacultyData] = useState(
    []
  );
  const [manageFacultyData, setManageFacultyData] = useState([]);
  const [editedFacultyData, setEditedFacultyData] = useState([]);
  const [facultyEditState, setFacultyEditState] = useState([]);
  const [actionOptions, setActionOptions] = useState([
    {
      value: "1",
      label: "Active",
    },
    {
      value: "0",
      label: "Inactive",
    },
  ]);

  // useEffect(()=>{
  //   props.setTitle("Manage Faculty")
  // },[])

  const handleEditFaculty = (data)=>{
        console.log(data);
      try {

        axios.put(`${apiHost}/api/faculty/${data.id}`,data,{
          headers:{
            auth: cookies.auth,
          }
        }).then((response)=>{
          if(response.status===200){
            toast.success(response.data.message||"Faculty Updated Successfully");
            fetchManageFacultyData();
          }
        })
        
      } catch (error) {
         toast.error(error.message||"Unable to Edit");
      }
  }


  useEffect(() => {
    setEditedFacultyData(
      filteredManageFacultyData.map((v, i) => {
        return {
          id: v.id,
          faculty_id: v.faculty_id,
          name: v.name,
          department: v.department,
          email: v.email,
          date_of_joining: dayjs(v.date_of_joining).format('YYYY/MM/DD'),
          experience_in_bit: v.experience_in_bit,
          total_teaching_experience: v.total_teaching_experience,
          status: v.status,
        };
      })
    );
    setFacultyEditState(
      filteredManageFacultyData.map((v, i) => {
        return false;
      })
    );
  }, [filteredManageFacultyData]);

  useEffect(() => {
    console.log(editedFacultyData);
    console.log(facultyEditState);
  }, [editedFacultyData, facultyEditState]);


  const fetchManageFacultyData = ()=>{
    axios
    .get(`${apiHost}/api/faculty`, {
      headers: {
        Auth: cookies.auth,
      },
    })
    .then((response) => {
      console.log(response.data);
      setManageFacultyData(response.data);
    });
  }
  useEffect(() => {
     fetchManageFacultyData();
  }, [cookies.auth, isAdding]);

  const changeFacultyState = (id, status) => {
    axios
      .put(
        `${apiHost}/api/faculty/${id}`,
        {
          status: status,
        },
        {
          headers: {
            Auth: cookies.auth,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        const updatedFacultyData = manageFacultyData.map((faculty) =>
          faculty.id === id ? { ...faculty, status: status } : faculty
        );
        setManageFacultyData(updatedFacultyData);
      });
  };

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
    setFilteredManageFacultyData(
      manageFacultyData?.filter((faculty) => {
        const matchesSearchQuery =
          faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faculty.faculty_id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment =
          departmentId && faculty.department === departmentId.value;

        const matchesState =
          filterState && filterState.value === faculty.status;

        const bothFiltersPresent = departmentId && filterState;

        // If both department and state are present, both must match;
        // otherwise, only one of the present filters must match.
        return (
          matchesSearchQuery &&
          (bothFiltersPresent
            ? matchesDepartment && matchesState
            : matchesDepartment ||
              matchesState ||
              !(departmentId || filterState))
        );
      })
    );
  }, [searchQuery, manageFacultyData, departmentId, filterState]);
  return (
    <div className="manageFacultyMasterContainer">
      <div
        className="selectContainer"
        style={{
          padding: " 15px 10px",
          borderRadius: "5px",
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
          margin: "10px 0px",
        }}
      >
        <div>
          <TextField
            sx={{ backgroundColor: "white" }}
            onChange={(e) => {
              setSearchQuery(e.target.value.trim());
            }}
            size="small"
            placeholder="Search"
          />
        </div>
        <div style={{ width: "30%", float: "right" }}>
          <Select
            placeholder="Select Department"
            value={departmentId}
            onChange={(selectedOption) => setDepartmentId(selectedOption)}
            options={departments}
            isClearable
          />
        </div>
        <div style={{ width: "30%", float: "right" }}>
          <Select
            placeholder="Select State"
            value={filterState}
            onChange={(selectedOption) => setFilterState(selectedOption)}
            options={actionOptions}
            isClearable
          />
        </div>
      </div>
      <div className="facultyManageDataTable">
        <table>
          <thead>
            <tr>
              <th>S.no</th>
              <th>Name</th>
              <th>Register Number</th>
              <th>Department</th>
              <th>Email</th>
              <th>Date of Joining</th>
              <th>Exp in BIT</th>
              <th>Total Experience</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredManageFacultyData.map((faculty, index) =>
              !facultyEditState[index] ? (
                <tr key={index}>
                  <td>
                    <div
                      className="
                  sNoWithEditFaculty"
                    >
                      <p>{index + 1}</p>
                      <div
                        onClick={() => {
                          setFacultyEditState((prev) => {
                            const newPrev = [...prev];
                            newPrev[index] = true;
                            return newPrev;
                          });
                        }}
                        className="EditFacultyIcon"
                      >
                        <Edit />
                      </div>
                    </div>
                  </td>
                  <td>{faculty.name}</td>
                  <td>{faculty.faculty_id}</td>

                  <td>
                    {departments &&
                      departments?.find(
                        (data) => data.value === faculty.department
                      )?.label}
                  </td>

                  <td>{faculty.email}</td>

                  <td>{dayjs(faculty.date_of_joining).format(`DD/MM/YYYY`)}</td>
                  <td>{faculty.experience_in_bit} years</td>
                  <td>{faculty.total_teaching_experience} years</td>
                  <td>
                    <div>
                      <Select
                        value={actionOptions.find(
                          (data) => data.value === faculty.status
                        )}
                        onChange={(value) => {
                          changeFacultyState(faculty.id, value.value);
                        }}
                        options={actionOptions}
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={index}>
                  <td>
                    <div
                      className="
                  sNoWithEditFaculty"
                    >
                      {index + 1}
                      <div className="cancelIconsFaculty">
                        <Cancel onClick={() => {
                          setFacultyEditState((prev) => {
                            const newPrev = [...prev];
                            newPrev[index] = false;
                            return newPrev;
                          });
                        }} />
                        <Check
                        onClick={()=>{handleEditFaculty(editedFacultyData[index])}}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="editFaculyName">
                      <TextField
                        onChange={(e) => {
                          setEditedFacultyData(
                            editedFacultyData.map((item, i) =>
                              i === index
                                ? { ...item, name: e.target.value }
                                : item
                            )
                          );
                        }}
                        style={{
                          width: 200,
                          backgroundColor: "white",
                          borderRadius: "5px",
                        }}
                        fullWidth={true}
                        size="small"
                        value={editedFacultyData[index]?.name}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="editFaculyName">
                      <TextField
                        onClick={(e) => {
                          setEditedFacultyData(
                            editedFacultyData.map((item, i) =>
                              i === index
                                ? { ...item, faculty_id: e.target.value }
                                : item
                            )
                          );
                        }}
                        style={{
                          width: 150,
                          backgroundColor: "white",
                          borderRadius: "5px",
                        }}
                        fullWidth={true}
                        size="small"
                        value={editedFacultyData[index]?.faculty_id}
                      />
                    </div>
                  </td>
                  <td>
                    <Select
                      value={departments?.find(
                        (data) =>
                          data.value === editedFacultyData[index]?.department
                      )}
                      options={departments}
                      onChange={(selectedOption) => {
                        setEditedFacultyData(
                          editedFacultyData.map((item, i) =>
                            i === index
                              ? { ...item, department: selectedOption.value }
                              : item
                          )
                        );
                      }}
                    />
                  </td>
                  <td>
                    <div className="editFaculyName">
                      <TextField
                        onChange={(e) => {
                          setEditedFacultyData(
                            editedFacultyData.map((item, i) =>
                              i === index
                                ? { ...item, email: e.target.value }
                                : item
                            )
                          );
                        }}
                        style={{
                          width: 150,
                          backgroundColor: "white",
                          borderRadius: "5px",
                        }}
                        fullWidth={true}
                        size="small"
                        value={editedFacultyData[index]?.email}
                      />
                    </div>
                  </td>
                  <td>
                    <DatePickerWithRange
                      onChange={(date) => {
                        setEditedFacultyData(
                          editedFacultyData.map((item, i) =>
                            i === index
                              ? { ...item, date_of_joining: dayjs(date).format('YYYY/MM/DD') }
                              : item
                          )
                        );
                      }}
                      value={dayjs(editedFacultyData[index]?.date_of_joining)}
                    />
                  </td>
                  <td>
                    <div className="editFaculyName">
                      <TextField
                        onChange={(e) => {
                          setEditedFacultyData(
                            editedFacultyData.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    experience_in_bit: parseInt(e.target.value),
                                  }
                                : item
                            )
                          );
                        }}
                        style={{
                          width: 150,
                          backgroundColor: "white",
                          borderRadius: "5px",
                        }}
                        fullWidth={true}
                        size="small"
                        type="Number"
                        InputProps={{ inputProps: { min: 0 } }}
                        value={editedFacultyData[index]?.experience_in_bit}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="editFaculyName">
                      <TextField
                        onChange={(e) => {
                          setEditedFacultyData(
                            editedFacultyData.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    total_teaching_experience: parseInt(
                                      e.target.value
                                    ),
                                  }
                                : item
                            )
                          );
                        }}
                        style={{
                          width: 150,
                          backgroundColor: "white",
                          borderRadius: "5px",
                        }}
                        fullWidth={true}
                        size="small"
                        type="Number"
                        InputProps={{ inputProps: { min: 0 } }}
                        value={
                          editedFacultyData[index]?.total_teaching_experience
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div>
                      <Select
                        onChange={(selectedOption) => {
                          changeFacultyState(
                            editedFacultyData[index].id,
                            selectedOption.value
                          );
                        }}
                        value={actionOptions.find(
                          (data) =>
                            data.value === editedFacultyData[index]?.status
                        )}
                        options={actionOptions}
                      />
                    </div>
                  </td>
                </tr>
              )
            )}
            {filteredManageFacultyData.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No faculty found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFaculty;
