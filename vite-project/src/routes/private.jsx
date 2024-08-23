import FacultyAllocation from "../pages/FacultyAllocation";
import FacultyAllocationRequests from "../pages/FacutlyAllocationRequests";
import FacultyApprovalPage from "../pages/FacultyApprovalPage";
import FacultyChangeRequests from "../pages/FacultyChangeRequests";
import Dashboard from "../pages/Dashboard";
import COEpage from "../pages/COEpage";
import ReportDownloadPage from "../pages/ReportDownloadPage"
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