import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SimpleProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("dsf-auth") === "true";
    if (!isAuthenticated) {
      navigate("/password");
    }
  }, [navigate]);

  return <>{children}</>;
};

export default SimpleProtectedRoute;