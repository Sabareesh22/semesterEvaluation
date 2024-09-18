import { useCookies } from 'react-cookie';
import './ManageHOD.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import apiHost from '../../../../../config/config';
import { Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
const ManageHOD  = ()=>{

    const [hodData,setHODData] = useState([]);
    const [cookies,setCookie] = useCookies(['auth']);

    const handleDeleteHOD = (data)=>{
        try {
            axios.delete(`${apiHost}/api/hod/${data.id}`,{
                headers:{
                    auth:cookies.auth
                }
            }).then((response)=>{
                if(response.status===200){
                    toast.success(response.data.message || 'Successfully deleted Hod');
                    console.log(response.data);
                    fetchHodData();
                }
            })
            
        } catch (error) {
            toast.error(error.message || 'Error deleting Hod');
        }
        
    }

    const fetchHodData = ()=>{
        try {
            axios.get(`${apiHost}/api/hod`,{
                headers:{
                    auth:cookies.auth
                }
            }).then((response) => {
                if(response.data){
                    setHODData(response.data);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{

        fetchHodData();

    },[cookies.auth])

    return(
        <div className='manageHODMasterContainer'>
            <div className='manageHODSelectContainer'>
                
            </div>
            <div className='manageHODTableContainer'>
              <table>
                <thead>
                    <th>S.no</th>
                    <th>Name</th>
                    <th>Faculty ID</th>
                    <th>Department</th>
                </thead>
                <tbody>
                    {
                        hodData.map((hod,index)=>(
                            <tr key={index}>
                                <td><div className='sNoAndDeleteHOD'>
                                    <p>{index+1}</p>
                                    <div onClick={()=>{handleDeleteHOD(hod)}} className='deleteIconHOD'><Delete/></div>
                                </div></td>
                                <td>{hod.faculty_name}</td>
                                <td>{hod.faculty_id}</td>
                                <td>{hod.department_name}</td>
                            </tr>
                        ))
                    }
                </tbody>
             </table>
            </div>
        </div>
    )
}

export default ManageHOD;