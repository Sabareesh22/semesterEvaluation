
import PageNotFound from "../pages/PageNotFound";
import UnAuthorized from "../pages/UnAuthorized";

export const fallbackRoutes = [
    {
        path:'*',
        element:<PageNotFound />
    },
    {
        path:'/unauthorized',
        element:<UnAuthorized/>
    }
]