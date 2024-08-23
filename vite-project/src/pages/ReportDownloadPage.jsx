import React, { useState, useEffect } from 'react';
import { Container, Button, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import apiHost from '../../config/config';
import { useCookies } from 'react-cookie';
import NoData from '../components/NoData';
const ReportDownloadPage = (props) => {
    const [departmentId, setDepartmentId] = useState('');
    const [semcode, setSemcode] = useState('');
    const [departments, setDepartments] = useState([]);
    const [semcodes, setSemcodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [cookies,setCoookie] = useCookies(['auth'])
    useEffect(()=>{
        props.setTitle("Report")
    },[])
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${apiHost}/departments`,{ headers:{
                    Auth: cookies.auth
                 }});
                setDepartments(response.data);
            } catch (error) {
                console.error('Error fetching departments:', error);
                toast.error('Failed to fetch departments.');
            }
        };

        const fetchSemcodes = async () => {
            try {
                const response = await axios.get(`${apiHost}/api/semcodes`,{ headers:{
                    Auth: cookies.auth
                 }});
                setSemcodes(response.data.results);
            } catch (error) {
                console.error('Error fetching semcodes:', error);
                toast.error('Failed to fetch semester codes.');
            }
        };

        fetchDepartments();
        fetchSemcodes();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!departmentId || !semcode) return;

            setLoading(true);

            try {
                const response = await axios.get(`${apiHost}/api/facultyAllocationReport`, {
                    params: { departmentId, semcode },
                    headers:{
                        Auth: cookies.auth
                     }
                });
                setData(response.data.results);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [departmentId, semcode]);

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, 'faculty_report.xlsx');
    };

    // Get the table headers dynamically from the data
    const tableHeaders = data.length > 0 ? Object.keys(data[0]) : [];

    return (
        <Container  >
            <ToastContainer />
            <br />
            <div className='selectContainer' style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                marginBottom: '16px'
            }}>
                <Select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    displayEmpty
                    fullWidth
                >
                    <MenuItem value="" disabled>Select Department</MenuItem>
                    {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                            {dept.department}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    value={semcode}
                    onChange={(e) => setSemcode(e.target.value)}
                    displayEmpty
                    fullWidth
                >
                    <MenuItem value="" disabled>Select Semester Code</MenuItem>
                    {semcodes.map((sem) => (
                        <MenuItem key={sem.id} value={sem.id}>
                            {sem.semcode}
                        </MenuItem>
                    ))}
                </Select>
            </div>
{
    !data?.length>0 && <NoData/>
}

            {loading ? (
                <CircularProgress size={24} />
            ) : data.length > 0 && (
                <>
                    <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }} >
                        <Button

                            variant="outlined"
                            onClick={handleExport}
                            sx={{ marginTop: 2,backgroundColor:"darkblue",color:"white",fontWeight:"bold" ,'&:hover': {
    backgroundColor: 'blue',
    boxShadow: 'none',
  }}}
                        >
                            Export as XLSX
                        </Button>
                    </div>
                    <Container sx={{overflowY:"scroll"}}>
                    <Table sx={{ marginTop: 4 ,width:"100%"}}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{color:"white",fontWeight:"bold"}}>S.No</TableCell>
                                {tableHeaders.map((header) => (
                                    <TableCell align='center' sx={{color:"white",fontWeight:"bold"}} key={header}>{header}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{backgroundColor:"white"}}>
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
                </>
            )}
        </Container>
    );
};

export default ReportDownloadPage;
