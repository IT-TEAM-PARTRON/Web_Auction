import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const PrivateRoute = () => {
  const { user, isLoggingOut } = useAuth();
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      if (!isLoggingOut) {
        const message = !user
          ? "You need login to continue!"
          : "You don't have permission!";
        toast.error(message);
      }
      setRedirectPath("/login");
    }
  }, [user]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  if (user && (user.role === "admin" || user.role === "super_admin")) {
    return <Outlet />;
  }

  return null;
};

export default PrivateRoute;
