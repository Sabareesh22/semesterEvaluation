import Login from "../pages/login/Login";


export const publicRoutes =(setLoading)=> [
    {
        path:'/',
        element:<Login setLoading={setLoading} />,
    },
    {
        path:'/login',
        element:<Login setLoading={setLoading} />,
    },

]