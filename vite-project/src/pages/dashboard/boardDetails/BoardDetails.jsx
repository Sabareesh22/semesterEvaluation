import { useState ,useEffect} from "react";
import axios from "axios";
import apiHost from "../../../../config/config";
import MuiToolTip from "@mui/material/Tooltip";
import { Edit } from "@mui/icons-material";
import { useCookies } from "react-cookie";
import ChiefExaminerSelection from "../chiefExaminerSelection/ChiefExaminerSelection";
import { ChangeCircle } from "@mui/icons-material";
import StyledModal from "../../../components/modal/StyledModal";
import { toast,ToastContainer } from "react-toastify";
import Select from 'react-select';
const BoardDetails = ({semesterCode,departmentId,chiefExaminers})=>{
  const [bcModalOpen, setBcModalOpen] = useState(false);
  const [selectedBcReplacement, setSelectedBcReplacement] = useState(null);
  const [selectedCeReplacement, setSelectedCeReplacement] = useState([]);
  const [selectedCeAddition, setSelectedCeAddition] = useState(null);
  const [boardChairman, setBoardChairman] = useState(null);
  const [ceSelectionOpen, setCeSelectionOpen] = useState(false);
  const [ceModalOpen, setCeModalOpen] = useState(false);
  const [facultyOptions, setFacultyOptions] = useState([]);

  const [cookies, setCookies] = useCookies(['auth']);
  const addBoardChairman = async (mapping_id, new_board_chairman) => {
    if ((!mapping_id, !new_board_chairman)) {
      return toast.error("Insufficient Data Cannot Change");
    } else { 
      console.log(new_board_chairman)
      try {
        await axios
          .put(
            `${apiHost}/api/board-chairman`,
            {
              id: mapping_id,
              chairman: new_board_chairman.value,
            },
            {
              headers: {
                auth: cookies.auth,
              },
            }
          )
          .then((res) => {
            if (res.status === 200) {
              toast.success(res.data.message);
              fetchBoardChairman();
              setBcModalOpen(false);
            } else {
              toast.error(res.data.message || "Unable to Update BC");
            }
          });
      } catch (error) {
        toast.error(error);
      }
    }
  };
  const fetchFacultyOptions = async (excludeId = []) => {
    try {
      const params = {};

      if (excludeId.length > 0) {
        params.excludeId = excludeId; // Pass as an array if there are multiple ids
      }

      const response = await axios.get(`${apiHost}/api/faculty`, {
        params,
        headers: {
          auth: cookies.auth,
        },
      });

      const processedFacultyOptions = response.data.map((data) => ({
        value: data.id,
        label: data.faculty_info,
      }));

      setFacultyOptions(processedFacultyOptions);
    } catch (error) {
      toast.error("Couldn't Fetch Options");
      console.error("Error fetching faculty options:", error);
    }
  };

  useEffect(() => {
    fetchBoardChairman();
  }, [semesterCode, departmentId, cookies.auth]);


  const fetchBoardChairman = async () => {
    if (!semesterCode || !departmentId) {
      return;
    }
    try {
      const response = await axios.get(`${apiHost}/api/boardChairman`, {
        params: {
          semcode: semesterCode,
          departmentId: departmentId,
        },
        headers: {
          Auth: cookies.auth,
        },
      });
      setBoardChairman(response.data);
    } catch (error) {
      console.error("Error fetching board chairman:", error);
    }
  };

  useEffect(() => {
    if (ceModalOpen || ceSelectionOpen) {
      console.log([
        ...chiefExaminers.map((data) => data.faculty_id),
        boardChairman[0].faculty_id,
      ]);
      fetchFacultyOptions([
        ...chiefExaminers.map((data) => data.faculty_id),
        boardChairman[0].faculty_id,
      ]);
    } else {
      if (selectedCeReplacement) {
        setSelectedCeReplacement([]);
      }
      if (selectedCeAddition) {
        setSelectedCeAddition(null);
      }
    }
  }, [ceModalOpen, ceSelectionOpen]);

  useEffect(() => {
    if (bcModalOpen) {
      fetchFacultyOptions([boardChairman[0].faculty_id]);
    } else {
      if (selectedBcReplacement) {
        setSelectedBcReplacement(null);
      }
    }
  }, [bcModalOpen]);
    return(
        <div className="boardDetailsContainer">
        <div className="boardDetailsElement">
          <h2>Board Details</h2>
          {boardChairman && boardChairman.length > 0 ? (
            <ul>
              <li>
                Chairman - {boardChairman[0].chairman_name}
                <div
                  onClick={() => {
                    setBcModalOpen(true);
                  }}
                  className="changeIcon"
                >
                  <MuiToolTip title="Replace Board Chairman">
                    <ChangeCircle />
                  </MuiToolTip>
                </div>
              </li>
              <li>Department - {boardChairman[0].department_name}</li>
            </ul>
          ) : (
            <p>No board chairman found </p>
          )}
        </div>

        {chiefExaminers ? (
          <div className="boardDetailsElement">
            <div className="boardChiefExaminers">
              <h2>Board Chief Examiners </h2>
              <MuiToolTip title="Edit Chief Examiners">
                <Edit
                  onClick={() => {
                    setCeModalOpen(true);
                  }}
                  className="editIcon"
                />
              </MuiToolTip>
            </div>
            {!ceModalOpen && (
              <div className="ChiefExaminerSelection">
                <ChiefExaminerSelection
                  departmentId={departmentId}
                  semcode={semesterCode}
                  isEditable={false}
                />
              </div>
            )}
            {/* Other dashboard content */}
          </div>
        ) : null}
         <StyledModal
            open={bcModalOpen}
            setOpen={setBcModalOpen}
            submitAction={() => {
              addBoardChairman(
                boardChairman[0].mapping_id,
                selectedBcReplacement
              );
            }}
            title={"Change Board Chairman"}
            content={
              <div className="bcAllocateModal">
                <Select
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  value={selectedBcReplacement}
                  onChange={setSelectedBcReplacement}
                  options={facultyOptions}
                />
              </div>
            }
          />
              <StyledModal
            submitAction={() => {
              sendCeAddRequest(selectedCeAddition.value);
            }}
            open={ceModalOpen}
            setOpen={setCeModalOpen}
            title={"Modify C.E"}
            content={
              <div>
                <ChiefExaminerSelection
                  departmentId={departmentId}
                  semcode={semesterCode}
                  isEditable={ceModalOpen}
                />
              </div>
            }
          />
      </div>
    )
}

export default BoardDetails;