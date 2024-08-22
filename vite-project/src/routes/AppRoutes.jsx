import React, { useState } from "react";
import ProtectedRoutes from "../ProtectedRoutes";
import { useRoutes } from "react-router-dom";
import { publicRoutes } from "./public";
import { privateRoutes } from "./private";
import { fallbackRoutes } from "./fallback";
import Layout from "../Layout";

export function AppRoutes(props) {
    const [title,setTitle]=useState("")
    const parsedRouteObjects = (routes, isPrivate = false) => {
        return routes.map((route) => ({
            path: route.path,
            element: isPrivate ? (
                <ProtectedRoutes children={route.element} authorizedRole={route.authorizedRole}>
                </ProtectedRoutes>
            ) : (
                route.element
            ),
        }));
    };

    const publicRouteObjects = parsedRouteObjects(publicRoutes);
    const privateRouteObjects = parsedRouteObjects(privateRoutes(setTitle), true);
    const fallbackRouteObjects = parsedRouteObjects(fallbackRoutes);

    const allRoutes = useRoutes([
        ...fallbackRouteObjects,
        ...publicRouteObjects,
        {
            path: '/paperallocation',
            element: <Layout title={title} userDetails={props.userDetails} />,
            children: [...privateRouteObjects],
        },
    ]);

    return <React.Fragment>{allRoutes}</React.Fragment>;
}
