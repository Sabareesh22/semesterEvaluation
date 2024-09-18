import { useCookies } from 'react-cookie';
import './ManageHOD.css';
import axios from 'axios';

const ManageHOD  = ()=>{

    const [hodData,setHODData] = useState([]);
    const [cookies,setCookie] = useCookies(['auth']);


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
                </tbody>
             </table>
            </div>
        </div>
    )
}