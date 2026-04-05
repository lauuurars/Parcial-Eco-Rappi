import { useState } from "react";
import { CartContext } from "./CartContext.js";

export const CartProvider = ({ children }) => {

    const [cart, setCart] = useState([]); // iniciando con carrito vacio 

    // agregar producto 
    const addToCart = (product) => {
        setCart([...cart, product]); // actualizamos el estado sin borrar elementos anteriores
    };  

    // eliminar producto con su id 
    const deleteProduct = (id) => {
        const newCart = cart.filter((item) => item.id !== id);
        setCart(newCart); 
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
