import { Navigate } from "react-router-dom";

const RoleGuard = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("users"));

  // login nahi hai
  if (!user || !user.user_token) {
    return <Navigate to="/login" replace />;
  }

  // role allowed nahi
  if (!allowedRoles.includes(user.role_id)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleGuard;
