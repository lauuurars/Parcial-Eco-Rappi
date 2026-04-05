import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/hooks/useAuth.js";

export default function PrivateLayout() {

    const { user, loading } = useAuth();

    // mientras valida sesión
    if (loading) {
        return <div className="p-6">Cargando...</div>;
    }

    // si no hay usuario redirige login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // si está logueado dejamos pasar
    return (
        <div>
            <Outlet />
        </div>
    );
}