import React, { useState } from "react";
import { useRoutes } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import { publicRoutes } from "./public";
import { privateRoutes } from "./private";
import { fallbackRoutes } from "./fallback";
import Layout from "../layout/Layout";

export function AppRoutes(props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const parsedRouteObjects = (routes, isPrivate = false) => {
    return routes.map((route) => ({
      path: route.path,
      element: isPrivate ? (
        <ProtectedRoutes
          setLoading={setLoading}
          children={route.element}
          authorizedRole={route.authorizedRole}
        ></ProtectedRoutes>
      ) : (
        route.element
      ),
    }));
  };

  const publicRouteObjects = parsedRouteObjects(publicRoutes(setLoading));
  const privateRouteObjects = parsedRouteObjects(privateRoutes(setTitle), true);
  const fallbackRouteObjects = parsedRouteObjects(fallbackRoutes);

  // Create a separate ProtectedRoutes wrapper for Layout
  const layoutWrapper = {
    path: "/paperallocation",
    element: (
      <ProtectedRoutes setLoading={setLoading} authorizedRole={"faculty"}>
        <Layout
          setLoading={setLoading}
          loading={loading}
          title={title}
          userDetails={props.userDetails}
        />
      </ProtectedRoutes>
    ),
    children: [...privateRouteObjects],
  };

  const allRoutes = useRoutes([
    ...fallbackRouteObjects,
    ...publicRouteObjects,
    layoutWrapper,
  ]);

  return <React.Fragment>{allRoutes}</React.Fragment>;
}
