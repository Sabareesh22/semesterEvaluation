import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import './COEpage.css';
import axios from 'axios';
import apiHost from '../../config/config.js';

const COEpage = () => {
    const [semesterCode, setSemesterCode] = useState('');
    const [regulation, setRegulation] = useState('');
    const [year, setYear] = useState('');
    const [batch, setBatch] = useState('');
    const [semester, setSemester] = useState('');
    const [loading, setLoading] = useState(false); // New loading state

    const [regulationOptions, setRegulationOptions] = useState([]);
    const [yearOptions, setYearOptions] = useState([]);
    const [batchOptions, setBatchOptions] = useState([]);
    const [semesterOptions, setSemesterOptions] = useState([]);

    useEffect(() => {
        // Prefill semester code
        const currentMonth = new Date().toLocaleString('default', { month: 'short' }).toUpperCase();
        const currentYear = new Date().getFullYear().toString().slice(-2);
        setSemesterCode(`SEE${currentMonth}${currentYear}`);

        // Fetch options
        const fetchOptions = async () => {
            try {
                const [regulationsRes, yearsRes, batchesRes, semestersRes] = await Promise.all([
                    axios.get(`${apiHost}/regulations`),
                    axios.get(`${apiHost}/years`),
                    axios.get(`${apiHost}/batches`),
                    axios.get(`${apiHost}/semesters`),
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

    const handleSubmit = async () => {
        const newSemcode = {
            semcode: semesterCode,
            semester: semester,
            batch: batch,
            year: year,
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
    };

    const resetForm = () => {
        setSemesterCode(`SEE${new Date().toLocaleString('default', { month: 'short' }).toUpperCase()}${new Date().getFullYear().toString().slice(-2)}`);
        setRegulation('');
        setYear('');
        setBatch('');
        setSemester('');
    };

    return (
        <div className='coePageContainer'>
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
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            label="Year"
                            sx={{ backgroundColor: 'white', width: '100%' }} // White background and full width for Select
                            disabled={loading} // Disable during loading
                        >
                            {yearOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ marginRight: 2, flex: 1 }} required>
                        <InputLabel>Batch</InputLabel>
                        <Select
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                            label="Batch"
                            sx={{ backgroundColor: 'white', width: '100%' }} // White background and full width for Select
                            disabled={loading} // Disable during loading
                        >
                            {batchOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {`Batch ${option.batch}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ flex: 1 }} required>
                        <InputLabel>Semester</InputLabel>
                        <Select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            label="Semester"
                            sx={{ backgroundColor: 'white', width: '100%' }} // White background and full width for Select
                            disabled={loading} // Disable during loading
                        >
                            {semesterOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {`Semester ${option.semester}`}
                                </MenuItem>
                            ))}
                        </Select>
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
