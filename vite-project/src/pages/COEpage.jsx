import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import './COEpage.css';
import axios from 'axios';
import apiHost from '../../config/config.js';
import MultiSelect from '../components/MultiSelect.jsx';
import { useCookies } from 'react-cookie';
const COEpage = (props) => {
    props.setTitle("Create Semester Evaluation")
    const [cookies,setCookies] = useCookies(['auth']);
    const [semesterCode, setSemesterCode] = useState('');
    const [regulation, setRegulation] = useState([]);
    const [year, setYear] = useState([]);
    const [batch, setBatch] = useState([]);
    const [semester, setSemester] = useState([],[]);
    const [loading, setLoading] = useState(false); // New loading state

    const [regulationOptions, setRegulationOptions] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [batchOptions, setBatchOptions] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);
  useEffect(()=>{
    console.log(year)
  },[year])
    useEffect(() => {
        // Prefill semester code
        const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
        const currentYear = new Date().getFullYear().toString().slice(-2);
        setSemesterCode(`SEE${currentMonth}${currentYear}`);

        // Fetch options
        const fetchOptions = async () => {
            try {
                const [regulationsRes, yearsRes, batchesRes, semestersRes] = await Promise.all([
                    axios.get(`${apiHost}/regulations`,{headers:{
                       Auth: cookies.auth
                    }}),
                    axios.get(`${apiHost}/years`,{headers:{
                        Auth: cookies.auth
                     }}),
                    axios.get(`${apiHost}/batches`,{headers:{
                        Auth: cookies.auth
                     }}),
                    axios.get(`${apiHost}/semesters`,{headers:{
                        Auth: cookies.auth
                     }}),
                ]);
                
                setRegulationOptions(regulationsRes.data);
                setYearOptions(yearsRes.data);
                setBatchOptions(batchesRes.data);
                setSemesterOptions(semestersRes.data);
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };

        fetchOptions();
    }, []);

    const isFormValid = regulation && year && batch && semester;
    const handleMultiSelectChange= (set,value)=>{
       if(value==undefined){
          set((prev)=>{
            prev.pop(prev.length-1)
            return([...prev])
          })
       }
       else{
        set((prev)=>([...prev,value]))
       }
    }
    const handleSubmit = async () => {
        if(year.length != semester.length || year.length != batch.length || batch.length != semester.length){
            let errorMessage = "Batch and Semesters options must tally"
            if(year.length != semester.length){
                errorMessage = "Year and Semesters options must tally"
            }
            else if(year.length != batch.length){
                errorMessage = "Year and Batch options must tally"
            }
            else if(year.length != batch.length && year.length !=semester.length){
                errorMessage = "Year,Batch and Semester options must tally"
            }
            toast.error(errorMessage)
            return;
        }
    year.forEach(async(year,i)=>{
        

            const newSemcode = {
                semcode: semesterCode,
                semester: semester[i].value,
                batch: batch[i].value,
                year: year.value,
                regulation: regulation,
                status: '1', // Assuming status is '1' for active
            };
  
        setLoading(true); // Set loading state to true

        try {
            const response = await axios.post(`${apiHost}/api/semcodes`, newSemcode);
            console.log('Submission successful:', response.data);
            toast.success('Submission successful!'); // Success toast
            resetForm();
        } catch (error) {
            console.error("Error submitting data:", error);
            if (error.response && error.response.data && error.response.data.message) {
                // Display the error message from the backend
                toast.error(error.response.data.message);
            } else {
                toast.error('Error submitting data. Please try again.'); // General error toast
            }
        } finally {
            setLoading(false); // Reset loading state
        }
    })
    
    };

    const resetForm = () => {
        setSemesterCode(`SEE${new Date().toLocaleString('default', { month: 'short' }).toUpperCase()}${new Date().getFullYear().toString().slice(-2)}`);
        setRegulation('');
        setYear([]);
        setBatch([]);
        setSemester([]);
    };

    return (
        <div className='coePageContainer'>
             <div style={{padding:"10px"}}>

      </div>
            <ToastContainer /> {/* Toast container */}
            <div className='formContainer' style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px' }}>
                <Box display="flex" flexDirection="row" alignItems="center" flexWrap="wrap">
                    <FormControl sx={{ marginRight: 2, flex: 1 }} required>
                        <InputLabel>Regulation</InputLabel>
                       
                        <Select
                            value={regulation}
                            onChange={(e) => setRegulation(e.target.value)}
                            label="Regulation"
                            sx={{ backgroundColor: 'white', width: '100%' }} // White background and full width for Select
                            disabled={loading} // Disable during loading
                        >
                            {regulationOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.regulation}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ marginRight: 2, flex: 1 }} required>
                    <MultiSelect 
                    label={"Year*"}
                   value={year}
  OnChange={(event, value) => setYear(value)} 
  options={yearOptions.map((data) => ({ value: data.id, label: data.year }))}
/>
{console.log(yearOptions.map((data) => ({ value: data.id, label: data.year })))}
             
                    </FormControl>
                    <FormControl sx={{ marginRight: 2, flex: 1 }} required>
                    <MultiSelect 
                    label={"Batch*"}
                    value={batch}
                    OnChange={(event, value) => setBatch(value)}  
                        options={batchOptions.map((data)=>({value:data.id,label:data.batch}))}/>
                    </FormControl>
                    <FormControl sx={{ flex: 1 }} required>
                    <MultiSelect 
                    label={"Semester*"}

                    value={semester}
                    OnChange={(event, value) => setSemester(value)} 
                        options={semesterOptions.map((data)=>({value:data.id,label:data.semester}))}/>
                    </FormControl>
                </Box>

                <div className='semesterCodeRow' style={{ marginTop: '20px' }}>
                    <TextField
                        placeholder='Enter Semester Code'
                        variant="outlined"
                        value={semesterCode}
                        onChange={(e) => setSemesterCode(e.target.value)}
                        sx={{
                            '& .MuiInputBase-root': {
                                backgroundColor: 'white',
                            },
                            '& .MuiInputBase-input': {
                                color: 'black',
                            },
                            '& .MuiInputLabel-root': {
                                color: 'black',
                            },
                            marginRight: 2,
                            width: '300px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#0d0030',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#0f8000',
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        component="span"
                        onClick={handleSubmit} // Call handleSubmit on button click
                        sx={{
                            backgroundColor: isFormValid ? "#0d0030" : "#ccc",
                            color: isFormValid ? "white" : "#888",
                            '&:hover': {
                                backgroundColor: isFormValid ? '#0f8000' : "#ccc",
                                boxShadow: 'none',
                            },
                            height: '56px',
                        }}
                        disabled={!isFormValid || loading} // Disable button if loading
                    >
                        Submit Semester Data
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default COEpage;
