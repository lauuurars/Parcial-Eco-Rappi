import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../../../src/shared/components/AppNavbar.jsx";
import { CartContext } from "../../../src/context/CartContext.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import BackButton from "../../../src/shared/components/BackButton.jsx";

export default function MakeOrder() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, clearCart } = useContext(CartContext) ?? {};

    const cartItems = useMemo(() => (Array.isArray(cart) ? cart : []), [cart]);
    const cartCount = cartItems.length;

    const storeIds = useMemo(() => Array.from(new Set(cartItems.map((item) => item?.store_id).filter(Boolean))), [cartItems]);
    const storeId = storeIds[0];
    const hasMultipleStores = storeIds.length > 1;

    const groupedItems = useMemo(() => {
        const map = new Map();
        for (const item of cartItems) {
            const id = item?.id;
            if (!id) continue;
            const current = map.get(id);
            if (!current) {
                map.set(id, { product: item, quantity: 1 });
            } else {
                map.set(id, { product: current.product, quantity: current.quantity + 1 });
            }
        }
        return Array.from(map.values());
    }, [cartItems]);

    const total = useMemo(() => {
        return groupedItems.reduce((sum, entry) => sum + Number(entry.product?.price ?? 0) * entry.quantity, 0);
    }, [groupedItems]);

    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("efectivo");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");

        if (cartCount === 0) {
            setErrorMessage("Tu carrito está vacío.");
            return;
        }

        if (hasMultipleStores) {
            setErrorMessage("Por ahora solo puedes hacer pedido de una tienda a la vez :(");
            return;
        }

        const consumerId = user?.id;
        if (!consumerId) {
            setErrorMessage("No se pudo identificar tu usuario, inicia sesión nuevamente :p");
            return;
        }

        const normalizedAddress = address.trim();
        if (!normalizedAddress) {
            setErrorMessage("La dirección es obligatoria.");
            return;
        }

        const normalizedPaymentMethod = paymentMethod.trim();
        if (!normalizedPaymentMethod) {
            setErrorMessage("El método de pago es obligatorio.");
            return;
        }

        if (!storeId) {
            setErrorMessage("No se pudo identificar la tienda del pedido.");
            return;
        }

        const items = groupedItems.map(({ product, quantity }) => ({
            product_id: product.id,
            quantity,
            price: product.price,
        }));

        const normalizedApiBaseUrl = (apiBaseUrl ?? "").trim().replace(/\/+$/, "");
        const orderUrl = normalizedApiBaseUrl ? `${normalizedApiBaseUrl}/orders` : "/orders";

        try {
            setIsSubmitting(true);
            const response = await fetch(orderUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    consumer_id: consumerId,
                    store_id: storeId,
                    address: normalizedAddress,
                    payment_method: normalizedPaymentMethod,
                    total,
                    items,
                }),
            });

            const rawBody = await response.text();
            let json = {};
            if (rawBody) {
                try {
                    json = JSON.parse(rawBody);
                } catch {
                    json = {};
                }
            }
            if (!response.ok) {
                throw new Error(json?.error || json?.message || rawBody || "No se pudo crear el pedido");
            }

            if (typeof clearCart === "function") clearCart();
            window.alert(`Pedido creado: ${json?.order?.id ?? "OK"}`);
            navigate("/rappi-app/consumer", { replace: true });
        } catch (error) {
            const rawMessage = String(error?.message ?? "");
            const isNetworkError = error?.name === "TypeError" || /failed to fetch/i.test(rawMessage);
            if (isNetworkError) {
                const normalizedApiBaseUrl = (apiBaseUrl ?? "").trim().replace(/\/+$/, "");
                const backendHint = normalizedApiBaseUrl || "http://localhost:8080";
                setErrorMessage(`No se pudo conectar con el backend (${backendHint}). Verifica que esté encendido y que el endpoint /orders exista.`);
            } else {
                setErrorMessage(rawMessage || "No se pudo crear el pedido.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f2ee]">
            <AppNavbar title="Hacer pedido" />

            <main className="mx-auto max-w-6xl px-6 py-10">
                <BackButton to="/rappi-app/consumer" />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6">
                        <h1 className="text-2xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Resumen del carrito
                        </h1>
                        <p className="text-sm text-[#7a7370] mb-6">
                            Revisa tus productos antes de confirmar el pedido.
                        </p>

                        {cartCount === 0 ? (
                            <div className="text-sm text-[#7a7370]">
                                Tu carrito está vacío.{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/rappi-app/consumer")}
                                    className="font-bold text-[#ff4f00] hover:underline"
                                >
                                    Ir a tiendas
                                </button>
                            </div>
                        ) : hasMultipleStores ? (
                            <div className="text-sm text-red-500">
                                Tienes productos de varias tiendas. Por ahora solo se permite un pedido por tienda :c
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {groupedItems.map(({ product, quantity }) => (
                                    <div key={product.id} className="flex items-start justify-between gap-4 rounded-2xl border-[1.5px] border-[#e2ddd8] bg-[#f5f2ee] p-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-[#111010] truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                {product.product_name ?? "Producto"}
                                            </p>
                                            <p className="text-xs text-[#7a7370] mt-1">
                                                {quantity} × ${Number(product.price ?? 0).toLocaleString("es-CO")}
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                            ${(Number(product.price ?? 0) * quantity).toLocaleString("es-CO")}
                                        </p>
                                    </div>
                                ))}

                                <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#e2ddd8]">
                                    <p className="text-sm font-bold text-[#7a7370]">Total</p>
                                    <p className="text-lg font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                        ${Number(total).toLocaleString("es-CO")}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6">
                        <h2 className="text-xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Datos del pedido
                        </h2>
                        <p className="text-sm text-[#7a7370] mb-6">
                            Completa la dirección y el método de pago.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">
                                    Dirección
                                </label>
                                <input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    type="text"
                                    placeholder="Cra 123 #45-67"
                                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00] placeholder:text-[#c4bfbb]"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">
                                    Método de pago
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00]"
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="tarjeta">Tarjeta</option>
                                </select>
                            </div>

                            {errorMessage && (
                                <p className="text-sm text-red-500">
                                    {errorMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={cartCount === 0 || hasMultipleStores || isSubmitting}
                                className="cursor-pointer w-full px-4 py-3 rounded-full bg-[#ff4f00] text-white text-sm font-black hover:bg-[#e44700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                {isSubmitting ? "Creando pedido..." : "Confirmar pedido"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
