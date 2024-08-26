
import NoDataImage from '../../assets/noDataFound.png'
import './NoData.css'
const NoData = ()=>{
    return(
        <div className="noDataContainer">
            <img src={NoDataImage}></img>
            <p>No Data Found</p>
        </div>
    )
}

export default NoData