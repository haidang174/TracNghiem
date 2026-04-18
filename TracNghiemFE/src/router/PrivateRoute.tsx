//src/router/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
