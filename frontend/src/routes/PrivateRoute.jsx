// router/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/hooks/useAuth.js";

export default function PrivateRoute({ children, allowedRoles }) {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace/>; // no logueado

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace/>; // rol no permitido
    }

    return children; // si todo esta bien se renderiza la ruta
}