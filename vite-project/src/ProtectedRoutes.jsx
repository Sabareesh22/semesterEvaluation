import apiHost from '../config/config';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoutes = ({ authorizedRole ,children}) => {
    const [cookies] = useCookies(['auth']);
    const [role, setRole] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchRole = async () => {
            try {
                if (cookies.auth) {
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
        return <div>Loading...</div>; // Display a loading message while fetching the role
    }

    if (role.includes(authorizedRole)) {
        return children;
    }

    // Redirect to unauthorized or login based on whether the user has a role or not
    return role.length > 0
        ? <Navigate replace to="/unauthorized" />
        : <Navigate replace to="/login" state={{ from: location }} />;
};

export default ProtectedRoutes;
