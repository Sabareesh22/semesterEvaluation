import axios from 'axios';
import './ManageSemcodes.css';
import apiHost from '../../../../../config/config';
import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';

const ManageSemcodes = ()=>{
    const [cookies, setCookies] = useCookies(['auth']);
    const [semcodeData,setSemcodeData] = useState([]);
    const fetchSemcodes  = ()=>{
        try {
            axios.get(`${apiHost}/api/semcodes`,{
                headers:{
                    Auth: cookies.auth
                }
            }).then((response)=>{

                if(response.data){
                    setSemcodeData(response.data.results);
                }

            })
        } catch (error) {
            
        }
    }
    useEffect(()=>{
        fetchSemcodes();
    },[cookies.auth])
    return(
        <div className='manageSemcodesMasterContainer'>
            <div>

            </div>
            <div className='manageSemcodesTableContainer'>
                <table>
                   <thead>
                    <th>S.no</th>
                    <th>Semcode</th>
                    <th>Status</th>
                   </thead>
                   <tbody>
                    {
                        semcodeData.map((data,i)=>{
                            return(
                                <tr key={data.id}>
                                    <td>{i+1}</td>
                                    <td>{data.semcode}</td>
                                    <td>{data.status}</td>
                                </tr>
                            )
                        })
                    }
                   </tbody>
                </table>
            </div>
        </div>
    )
}
export default ManageSemcodes;