import { useState } from "react";
import { authService } from "../services/auth.service.js";

export function useAuth() {

    // recuperar sesión al cargar
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    const [loading, setLoading] = useState(false); // loader 
    const [error, setError] = useState(null); // correo ya existente muestra error :p 

    // crear usuario 
    const register = async (formData, role) => { // recibimos la data del form y el rol del user 
        try {
            setLoading(true);
            setError(null);

            // normalizamos datos
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role,
            };

            // capturamos 
            if (role === "store") {
                payload.store = {
                    name: formData.storeName,
                    description: formData.storeDescription,
                    address: formData.storeAddress,
                };
            }

            const response = await authService.register(payload);

            const userData = response.result;

            // enviamos el rol seleccionado
            const normalizedUser = {
                ...userData,
                role: userData.role || role
            };

            // guardar sesión automática
            localStorage.setItem("user", JSON.stringify(normalizedUser));

            setUser(normalizedUser);

            return normalizedUser;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    const login = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.login(data);

            const result = response?.result;

            const userData = result?.user
                ? { ...result.user, auth: result.auth, store: result.store }
                : result;

            // guardar en localStorage
            localStorage.setItem("user", JSON.stringify(userData));

            setUser(userData);

            return userData;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logOut = () => {
    localStorage.removeItem("user");
    setUser(null);
};

    return {
        user,
        loading,
        error,
        register,
        login
    };
}
