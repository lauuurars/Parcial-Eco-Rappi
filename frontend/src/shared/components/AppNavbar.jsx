import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth/hooks/useAuth.js";
import RappiLogo from "../../../modules/auth/pages/assets/Rappi_logo.svg.png";
import { CartContext } from "../../context/CartContext.js";

export default function AppNavbar({ title }) {
    const navigate = useNavigate();
    const { user, logOut } = useAuth();
    const { cart, deleteProduct, clearCart } = useContext(CartContext) ?? {};

    const [isCartOpen, setIsCartOpen] = useState(false);

    const isConsumer = user?.role === "consumer";
    const isStore = user?.role === "store" || user?.role === "store_admin";
    const cartItems = isConsumer && Array.isArray(cart) ? cart : [];
    const cartCount = isConsumer ? cartItems.length : 0;

    const toggleCart = () => setIsCartOpen((value) => !value);

    const handleLogout = () => {
        logOut();
        navigate("/login", { replace: true });
    };

    const handleRemoveItem = (productId) => {
        if (!productId) return;
        if (typeof deleteProduct !== "function") return;
        deleteProduct(productId);
    };

    const handleClearCart = () => {
        if (typeof clearCart !== "function") return;
        clearCart();
    };

    const handleGoToOrder = () => {
        if (cartCount === 0) return;
        setIsCartOpen(false);
        navigate("/rappi-app/consumer/makeorder");
    };

    const handleGoToMyOrders = () => {
        setIsCartOpen(false);
        navigate("/rappi-app/consumer/orders");
    };

    const handleGoToStoreDashboard = () => {
        setIsCartOpen(false);
        navigate("/rappi-app/stores");
    };

    const handleGoToStoreOrders = () => {
        setIsCartOpen(false);
        navigate("/rappi-app/stores/orders");
    };

    return (
        <header className="sticky top-0 z-20 border-b border-[#e2ddd8] bg-[#f5f2ee]/85 backdrop-blur-md">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <img src={RappiLogo} alt="Rappi" className="h-10 w-auto object-contain" />
                    <div className="leading-tight">
                        <p className="text-sm font-black tracking-tight text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                            {title}
                        </p>
                        <p className="text-xs text-[#7a7370]">
                            {user?.email ?? "Sesión activa"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative">
                    {isConsumer && (
                        <button
                            type="button"
                            onClick={toggleCart}
                            className="cursor-pointer relative h-10 w-10 rounded-full border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors flex items-center justify-center"
                            aria-label="Abrir carrito"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                    d="M6 7h15l-1.5 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.6L5.4 4.8A1 1 0 0 0 4.4 4H3"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
                                <path d="M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#ff4f00] text-white text-[11px] font-black flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    )}

                    {isConsumer && (
                        <button
                            type="button"
                            onClick={handleGoToMyOrders}
                            className="cursor-pointer px-4 py-2 rounded-full border-[1.5px] border-[#e2ddd8] text-[#111010] text-sm font-bold hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Mis pedidos
                        </button>
                    )}

                    {isStore && (
                        <button
                            type="button"
                            onClick={handleGoToStoreDashboard}
                            className="cursor-pointer px-4 py-2 rounded-full border-[1.5px] border-[#e2ddd8] text-[#111010] text-sm font-bold hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Panel
                        </button>
                    )}

                    {isStore && (
                        <button
                            type="button"
                            onClick={handleGoToStoreOrders}
                            className="cursor-pointer px-4 py-2 rounded-full border-[1.5px] border-[#e2ddd8] text-[#111010] text-sm font-bold hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Órdenes
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="cursor-pointer px-4 py-2 rounded-full border-[1.5px] border-[#e2ddd8] text-[#111010] text-sm font-bold 
                        hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        Cerrar sesión
                    </button>

                    {isConsumer && isCartOpen && (
                        <>
                            <button
                                type="button"
                                aria-label="Cerrar carrito"
                                onClick={() => setIsCartOpen(false)}
                                className="fixed inset-0 z-10 cursor-default"
                            />
                            <div className="absolute right-0 top-12 z-20 w-88 rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white shadow-lg p-5">
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <p className="text-sm font-black tracking-tight text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                            Carrito
                                        </p>
                                        <p className="text-xs text-[#7a7370]">
                                            {cartCount} {cartCount === 1 ? "producto" : "productos"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCartOpen(false)}
                                        className="cursor-pointer h-9 w-9 rounded-full border-[1.5px] border-[#e2ddd8] hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors flex items-center justify-center text-[#111010]"
                                        aria-label="Cerrar"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path
                                                d="M18 6L6 18M6 6l12 12"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {cartCount === 0 ? (
                                    <p className="text-sm text-[#7a7370]">
                                        Tu carrito está vacío por ahora.
                                    </p>
                                ) : (
                                    <div className="max-h-64 overflow-auto pr-1">
                                        <div className="flex flex-col gap-3">
                                            {cartItems.map((item, index) => {
                                                const name = String(item?.product_name ?? item?.name ?? item?.title ?? "Producto");
                                                const price = item?.price;
                                                const productId = item?.id;

                                                return (
                                                    <div key={`${productId ?? name}-${index}`} className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-[#111010] truncate">
                                                                {name}
                                                            </p>
                                                            {price != null && (
                                                                <p className="text-xs text-[#7a7370]">
                                                                    ${price}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(productId)}
                                                            className="cursor-pointer shrink-0 px-3 py-2 rounded-full border-[1.5px] border-[#e2ddd8] text-[#111010] text-xs font-bold hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors disabled:opacity-50 disabled:hover:border-[#e2ddd8] disabled:hover:text-[#111010]"
                                                            disabled={!productId}
                                                        >
                                                            Quitar
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClearCart}
                                        className="cursor-pointer px-4 py-2 rounded-full border-[1.5px] border-[#e2ddd8] text-[#111010] text-sm font-bold hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors disabled:opacity-50 disabled:hover:border-[#e2ddd8] disabled:hover:text-[#111010]"
                                        style={{ fontFamily: "'Syne', sans-serif" }}
                                        disabled={cartCount === 0}
                                    >
                                        Vaciar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGoToOrder}
                                        className="cursor-pointer px-4 py-2 rounded-full bg-[#ff4f00] text-white text-sm font-black hover:bg-[#e44700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ fontFamily: "'Syne', sans-serif" }}
                                        disabled={cartCount === 0}
                                    >
                                        Hacer pedido
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
