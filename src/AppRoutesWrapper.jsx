// src/RoutesWrapper.js
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import routes, { renderRoutes } from "./routes";

const RoutesWrapper = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state?.auth?.user);
  const localUser = JSON.parse(localStorage.getItem("users") || "null");
  const user = reduxUser || localUser || null;
  const roleId = user?.role_id ?? null;

  // Deep clone routes
  const clonedRoutes = JSON.parse(JSON.stringify(routes));

  useEffect(() => {
    const handleTokenExpired = () => {
      localStorage.clear();
      navigate("/login", { replace: true });
    };

    window.addEventListener("tokenExpired", handleTokenExpired);
    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
    };
  }, [navigate]);

  // Remove create project route for role_id = 4
  if (roleId === 4) {
    clonedRoutes.forEach((route) => {
      if (Array.isArray(route.routes)) {
        route.routes = route.routes.filter(
          (r) => r.path !== "/projects/createproject"
        );
      }
    });
  }

  return renderRoutes(clonedRoutes);
};

export default RoutesWrapper;
