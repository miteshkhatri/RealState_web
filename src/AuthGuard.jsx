import { isUrlAllowed } from "menu-items";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import { isUrlAllowed } from "./menuItems";

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
// isUrlAllowed
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("users"));

    // login check
    if (!userData || !userData.user_token) {
      navigate("/login");
      return;
    }

    // 🔥 menu-based URL check
    if (!isUrlAllowed(location.pathname)) {
      navigate("/dashboard");
    }
  }, [navigate, location.pathname]);

  return children;
};

export default AuthGuard;
