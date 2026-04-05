import { useState } from "react";
import { authService } from "../services/auth.service.js";

export function useAuth() {

    // normalizamos el usuario, si llega store_admin convertimos a store
    const normalizeRole = (role) => {
        if (role === "store_admin") return "store";
        return role;
    };

    const normalizeUser = (raw) => {
        if (!raw) return null;

        if (raw.user && raw.auth) {
            const role = normalizeRole(raw.user?.role ?? raw.role);
            return { ...raw.user, auth: raw.auth, store: raw.store ?? null, role };
        }

        const role = normalizeRole(raw.role);
        return { ...raw, role };
    }; 

    // recuperar sesión al cargar
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? normalizeUser(JSON.parse(stored)) : null;
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

            const normalizedUser = normalizeUser({
                auth: userData?.auth,
                user: userData?.user,
                store: userData?.store
            }) ?? { role };

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

            const userData = normalizeUser(result?.user ? { ...result.user, auth: result.auth, store: result.store } : result);

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
        login,
        logOut
    };
}
