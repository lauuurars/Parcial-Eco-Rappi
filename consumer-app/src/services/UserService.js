const DATA = import.meta.env.VITE_API_URL;

// --- métodos de usuarios :p ----

// 1. obtenemos un usuario en específico
export const getUserById = async (id) => {
    try {
        const res = await fetch(`${DATA}/users/${id}`);

        if (!res.ok) {
            throw new Error(`Error ${res.status}: Could't get the user :( `);
        }

        return await res.json(); // respuesta en objeto JS
    } catch (error) {
        console.error("getUserById:", error.message);
        throw error;
    }
};

// 2. creando nuevo userr
export const createUser = async (body) => {
    try {
        const res = await fetch(`${DATA}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`Error ${res.status}: Couldn't create the user :( `);
        }

        return await res.json();
    } catch (error) {
        console.error("createUser:", error.message);
        throw error;
    }
};

// --- métodos para ordenes /orders :pp ----

// 1. creando nueva orden
export const createOrder = async (body) => {
    try {
        const res = await fetch(`${DATA}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`Error ${res.status}: Couldn't create the order :( `);
        }

        return await res.json();
    } catch (error) {
        console.error("createOrder:", error.message);
        throw error;
    }
};

// 2. mostrando ordenes de un usuario en específico
export const getOrdersByUserId = async (userId) => {
    try {
        const res = await fetch(`${DATA}/orders/user/${userId}`);

        if (!res.ok) {
            throw new Error(`Error ${res.status}: Couldn't get the orders :c`);
        }

        return await res.json();
    } catch (error) {
        console.error("getOrdersByUserId:", error.message);
        throw error;
    }
};

// --- métodos para tiendas :pp ---------

// 1. mostrando todas las tiendas
export const getStores = async () => {
    try {
        const res = await fetch(`${DATA}/stores`);

        if (!res.ok) {
            throw new Error(`Error ${res.status}: Couldn't get the stores :c`);
        }

        return await res.json();
    } catch (error) {
        console.error("getStores:", error.message);
        throw error;
    }
};

// 2. detalle de una tienda en específico lol
export const getStoreById = async (id) => {
    try {
        const res = await fetch(`${DATA}/stores/${id}`);

        if (!res.ok) {
            throw new Error(`Error ${res.status}: Couldn't get the store :( `);
        }

        return await res.json();
    } catch (error) {
        console.error("getStoreById:", error.message);
        throw error;
    }
};

// 3. mostrando los productos de una tienda
export const getProductsByStoreId = async (id) => {
    try {
        const res = await fetch(`${DATA}/stores/${id}/products`);

        if (!res.ok) {
            throw new Error(`Error ${res.status}: Couldn't get the products :(`);
        }

        return await res.json();
    } catch (error) {
        console.error("getProductsByStoreId:", error.message);
        throw error;
    }
};