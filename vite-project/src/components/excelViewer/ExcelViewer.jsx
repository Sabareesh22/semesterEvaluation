import { useEffect, useState } from 'react';
import './ExcelViewer.css'
import * as xlsx from 'xlsx'
const ExcelViewer = ({excelFile,setParsedJSONOfExcel})=>{
    const [excelData, setExcelData] = useState([]);

    useEffect(() => {
        if (excelFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
          const workbook = xlsx.read(e.target.result, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const sheetData = xlsx.utils.sheet_to_json(sheet);
          console.log(sheetData);
          setParsedJSONOfExcel(sheetData);
          setExcelData(sheetData);
          }
          
          reader.readAsArrayBuffer(excelFile)
        }
        
      }, [excelFile]);
    
    return(
        <div className="excelViewerContainer">
       {excelData.length>0 && <table>
          <thead>
            <tr>
              {Object.keys(excelData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {excelData.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((value) => (
                  <td key={value}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>}
        </div>
    )
}

export default ExcelViewer;