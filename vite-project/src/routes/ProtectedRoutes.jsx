import apiHost from "../../config/config";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ProtectedRoutes = ({ authorizedRole, children, setLoading }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["auth"]);
  const [role, setRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
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
        } else {
          setRole([]);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        setRole([]);
      } finally {
        const handleStopLoading = () => {
          if (setLoading) {
            setLoading(false);
          }
        };

        const timeout = setTimeout(handleStopLoading, 2000);
      }
    };

    fetchRole();
  }, [cookies.auth]);

  if (role != null && !role?.includes(authorizedRole)) {
    if (setLoading) {
      setLoading(true);
    }

    const navigateOut = () => {
      setLoading(true);
      if (!role?.length > 0) {
        removeCookie("auth", { path: "/" });
      }
      return navigate(role?.length > 0 ? "/unauthorized" : "/login", {
        replace: true,
        state: { from: location },
      });
    };
    const timeout = setTimeout(navigateOut, 1000);
  } else {
    return role != null ? children : null;
  }

  // Render the protected content only when the role is authorized
};

export default ProtectedRoutes;
