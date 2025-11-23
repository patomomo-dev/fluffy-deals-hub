import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // puede ser un spinner
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};