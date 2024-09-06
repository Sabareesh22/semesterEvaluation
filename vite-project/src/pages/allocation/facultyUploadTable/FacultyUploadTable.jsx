import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    TablePagination,
    TextField,
  } from "@mui/material";
  import Button from "../../../components/button/Button";
  import { useState } from "react";

const FacultyUploadTable = ({ headers, data, onCancel, onSubmit }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5); // Change this to adjust the number of rows per page
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0); // Reset to the first page on rows per page change
    };
  
    return (
      <div>
        <TableContainer
          style={{
            marginTop: "20px",
            width: "80%",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Table style={{ borderCollapse: "collapse" }}>
            <TableHead
              sx={{
                backgroundColor: "#0d0030",
                color: "white",
                fontWeight: "bold",
              }}
            >
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell
                    key={index}
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="center"
                    style={{ border: "1px solid black" }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        align="center"
                        style={{ border: "1px solid black" }}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Options for rows per page
          component="div"
          count={data.length} // Total number of rows
          rowsPerPage={rowsPerPage} // Current rows per page
          page={page} // Current page
          onPageChange={handleChangePage} // Function to handle page change
          onRowsPerPageChange={handleChangeRowsPerPage} // Function to handle change in rows per page
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={onCancel}
            label={"Cancel"}
            size={
                "small"
            }
            style={{ marginRight: "10px" }}
          >
          </Button>
          <Button label={"Submit"} variant="contained" size={"small"} color="primary" onClick={onSubmit}>
            Submit
          </Button>
        </div>
      </div>
    );
  };

  export default FacultyUploadTable;