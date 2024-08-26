
import PageNotFound from "../pages/notFound/PageNotFound";
import UnAuthorized from "../pages/unAuthorized/UnAuthorized";

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