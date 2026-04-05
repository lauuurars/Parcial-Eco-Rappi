const API_URL = import.meta.env.VITE_API_URL;

export const authService = {

    register: async (data) => {
        const res = await fetch(`${API_URL}/api/auth/sign-up`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.error || json.message || "Error en registro :(");
        }

        return json;
    },

    login: async (data) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.error || json.message || "Error en login :(");
        }

        return json;
    }
};
