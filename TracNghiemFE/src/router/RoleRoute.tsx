//src/router/RoleRoute.tsx
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: ("ADMIN" | "TEACHER" | "STUDENT")[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { role } = useAuthStore();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
