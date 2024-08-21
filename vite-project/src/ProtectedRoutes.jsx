import apiHost from '../config/config';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoutes = ({ authorizedRole }) => {
    const [cookies] = useCookies(['auth']);
    const [role, setRole] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchRole = async () => {
            try {
                if(cookies.auth){
                    const response = await axios.get(`${apiHost}/auth/role`, {
                        headers: {
                            auth: cookies.auth,
                        },
                    });
                    setRole(response.data.roles);
                }
                
            } catch (error) {
                console.error('Error fetching role:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRole();
    }, [cookies.auth]);

    if (isLoading) {
        return <div>Loading...</div>; // Show a loading indicator while the role is being fetched
    }

    return (
        role.includes(authorizedRole)
            ? <Outlet />
            : <Navigate replace={true} to={'/unAuthorized'} />
    );
};

export default ProtectedRoutes;
