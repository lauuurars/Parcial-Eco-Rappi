import { useEffect, useState } from "react";
import { CartContext } from "./CartContext.js";

export const CartProvider = ({ children }) => {

    const storageKey = "rappi_cart";

    const [cart, setCart] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            const parsed = stored ? JSON.parse(stored) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(cart));
    }, [cart, storageKey]);

    // agregar producto 
    const addToCart = (product) => {
        setCart((previousCart) => [...previousCart, product]); // actualizamos el estado sin borrar elementos anteriores
    };  

    // eliminar producto con su id 
    const deleteProduct = (id) => {
        setCart((previousCart) => previousCart.filter((item) => item.id !== id));
    }; 

    // vaciar carrito
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                deleteProduct,
                clearCart,
            }}>
            {children}
        </CartContext.Provider>
    );
};
