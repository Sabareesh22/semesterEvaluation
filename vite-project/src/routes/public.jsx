import Login from "../pages/login/Login";


export const publicRoutes =(setLoading)=> [
    {
        path:'/login',
        element:<Login setLoading={setLoading} />,
    },

]