import FacultyAllocation from "../pages/allocation/FacultyAllocation";
import FacultyAllocationRequests from "../pages/allocationRequest/FacutlyAllocationRequests";
import FacultyApprovalPage from "../pages/approval/FacultyApprovalPage";
import FacultyChangeRequests from "../pages/changeRequest/FacultyChangeRequests";
import Dashboard from "../pages/dashboard/Dashboard";
import COEpage from "../pages/coePage/COEpage";
import ReportDownloadPage from "../pages/report/ReportDownloadPage"
import FoilCard from "../pages/foilCard/FoilCard";
import ManageFaculty from "../pages/manageFaculty/ManageFaculty";
export const privateRoutes =(setTitle)=> [
    

    {
        path:'',
        element:<Dashboard setTitle={setTitle}/>,
        authorizedRole:"faculty"
    },
    {
        path:'dashboard',
        element:<Dashboard setTitle={setTitle}/>,
        authorizedRole:"faculty"
    },
    {
        path:'allocation',
        element:<FacultyAllocation setTitle={setTitle}/>,
        authorizedRole:"hod"
    },
    {
        path:'allocationrequests',
        element:<FacultyAllocationRequests setTitle={setTitle}/>,
        authorizedRole:"coe"
    },
    {
        path:'foilcardentry',
        element:<FoilCard setTitle={setTitle}/>,
        authorizedRole:"coe"
    },
    {
        path:'report',
        element:<ReportDownloadPage setTitle={setTitle}/>,
        authorizedRole:"coe"
    },
    {
        path:'createsemcode',
        element:<COEpage setTitle={setTitle}/>,
        authorizedRole:"coe"
    },
    {
        path:'managefaculty',
        element:<ManageFaculty setTitle={setTitle}/>,
        authorizedRole:"coe"
    },
    {
        path:'facultyapproval',
        element:<FacultyApprovalPage setTitle={setTitle}/>,
        authorizedRole:"faculty"
    },
    {
        path:'changerequests',
        element:<FacultyChangeRequests setTitle={setTitle}/>,
        authorizedRole:"coe"
    }
]