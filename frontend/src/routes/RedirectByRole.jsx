import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/hooks/useAuth.js";

export default function RedirectByRole() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.role) return;

        console.log("REDIRIGIENDO A:", user.role);

        switch (user.role) {
            case "consumer":
                navigate("/rappi-app/consumer", { replace: true });
                break;
            case "delivery":
                navigate("/rappi-app/delivery", { replace: true });
                break;
            case "store":
                navigate("/rappi-app/store", { replace: true });
                break;
            default:
                navigate("/", { replace: true });
        }
    }, [user?.role, navigate]);
    
    return null;
}
