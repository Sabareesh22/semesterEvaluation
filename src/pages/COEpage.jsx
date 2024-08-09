import React, { useState } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { read, utils } from 'xlsx';
import './COEpage.css';

const COEpage = () => {
    const [data, setData] = useState([]);
    const [semesterCode, setSemesterCode] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binaryStr = e.target.result;
                const workbook = read(binaryStr, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = utils.sheet_to_json(worksheet);
                setData(jsonData);
            };
            reader.readAsBinaryString(file);
        }
    };

    return (
        <div className='coePageContainer'>
            <div className='optionsRow'>
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
                <input
                    accept=".xlsx"
                    style={{ display: 'none' }}
                    id="upload-xlsx"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="upload-xlsx">
                    <Button
                        variant="contained"
                        component="span"
                        sx={{
                            backgroundColor: "#0d0030",
                            color: "white",
                            '&:hover': {
                                backgroundColor: '#0f8000',
                                boxShadow: 'none',
                            },
                            height: '56px',
                        }}
                    >
                        Upload Excel
                    </Button>
                </label>
            </div>

            <div className='coeTableContainer'>
                {data.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {Object.keys(data[0]).map((key) => (
                                        <TableCell key={key}>{key}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        {Object.values(row).map((value, idx) => (
                                            <TableCell key={idx}>{value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <div className="uploadPrompt">
                        <h3>...Upload your XLSX file of Semester Data...</h3>
                    </div>
                )}
            </div>

            <div className="submitButtonContainer">
                {data.length > 0 && (
                    <Button
                        variant="contained"
                        component="span"
                        sx={{
                            backgroundColor: "#0d0030",
                            color: "white",
                            '&:hover': {
                                backgroundColor: '#0f8000',
                                boxShadow: 'none',
                            },
                            height: '56px',
                        }}
                    >
                        Submit Semester Data
                    </Button>
                )}
            </div>
        </div>
    );
}

export default COEpage;
