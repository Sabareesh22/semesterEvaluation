import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import PageNotFound from "../pages/PageNotFound";
import UnAuthorized from "../pages/UnAuthorized";

export const publicRoutes =(setLoading)=> [
    {
        path:'/login',
        element:<Login setLoading={setLoading} />
    },

]