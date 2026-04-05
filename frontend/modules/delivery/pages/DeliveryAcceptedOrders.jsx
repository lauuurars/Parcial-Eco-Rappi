import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../../../src/shared/components/AppNavbar.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";

export default function DeliveryAcceptedOrders() {
    const { user } = useAuth();
    const deliveryId = user?.id ?? "";
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deliveringOrderId, setDeliveringOrderId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

    const normalizedApiBaseUrl = useMemo(() => {
        return String(apiBaseUrl ?? "").trim().replace(/\/+$/, "");
    }, [apiBaseUrl]);

    const buildUrl = useCallback((path) => {
        if (!path) return normalizedApiBaseUrl || "";
        return normalizedApiBaseUrl ? `${normalizedApiBaseUrl}${path}` : path;
    }, [normalizedApiBaseUrl]);

    useEffect(() => {
        let isCancelled = false;

        const loadAcceptedOrders = async () => {
            if (!deliveryId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setErrorMessage("");

                const response = await fetch(buildUrl(`/orders/delivery/${deliveryId}/accepted`));
                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json?.error || json?.message || "No se pudieron cargar tus órdenes aceptadas.");
                }

                if (!isCancelled) {
                    setOrders(Array.isArray(json?.orders) ? json.orders : []);
                }
            } catch (error) {
                if (!isCancelled) {
                    setErrorMessage(String(error?.message ?? "No se pudieron cargar tus órdenes aceptadas."));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadAcceptedOrders();

        return () => {
            isCancelled = true;
        };
    }, [deliveryId, buildUrl]);

    const handleDeliverOrder = async (orderId) => {
        if (!deliveryId || !orderId) return;

        try {
            setDeliveringOrderId(orderId);
            setErrorMessage("");
            setFeedbackMessage("");

            const response = await fetch(buildUrl(`/orders/${orderId}/deliver`), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ delivery_id: deliveryId }),
            });

            const json = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(json?.error || json?.message || "No se pudo marcar la orden como entregada.");
            }

            const updatedOrder = json?.order;
            setOrders((current) =>
                (Array.isArray(current) ? current : []).map((order) =>
                    order?.id === orderId ? { ...(order ?? {}), ...(updatedOrder ?? {}), status: "delivered" } : order,
                ),
            );
            setFeedbackMessage("Orden marcada como entregada.");
        } catch (error) {
            setErrorMessage(String(error?.message ?? "No se pudo marcar la orden como entregada."));
        } finally {
            setDeliveringOrderId("");
        }
    };

    const title = "Repartidor · Mis aceptadas";

    return (
        <div className="min-h-screen bg-[#f5f2ee]">
            <AppNavbar title={title} />

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8 flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Mis órdenes aceptadas
                        </h1>
                        <p className="text-sm text-[#7a7370]">Aquí aparecen las órdenes que tomaste como repartidor.</p>
                    </div>
                </div>

                {!deliveryId && (
                    <div className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6 text-sm text-[#7a7370]">
                        No se encontró un repartidor asociado a tu sesión. Cierra sesión e inicia nuevamente.
                    </div>
                )}

                {deliveryId && isLoading && <div className="text-sm text-[#7a7370]">Cargando órdenes...</div>}

                {deliveryId && !isLoading && errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}

                {deliveryId && !isLoading && feedbackMessage && !errorMessage && (
                    <div className="text-sm text-[#1f7a36] mb-6">{feedbackMessage}</div>
                )}

                {deliveryId && !isLoading && !errorMessage && orders.length === 0 && (
                    <div className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6 text-sm text-[#7a7370]">
                        Aún no has aceptado órdenes.
                    </div>
                )}

                {deliveryId && !isLoading && !errorMessage && orders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orders.map((order) => (
                            <article key={order.id} className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-5">
                                {(() => {
                                    const status = String(order?.status ?? "");
                                    const statusLabel = status === "delivered" ? "Entregada" : "Aceptada";
                                    const badgeClass =
                                        status === "delivered"
                                            ? "border-[#d7e7f5] bg-[#f0f7ff] text-[#1f4f7a]"
                                            : "border-[#d7f5df] bg-[#effff3] text-[#1f7a36]";

                                    return (
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Orden</p>
                                        <p className="text-base font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                            {String(order?.id ?? "").slice(0, 8)}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border-[1.5px] whitespace-nowrap ${badgeClass}`}>
                                        {statusLabel}
                                    </span>
                                </div>
                                    );
                                })()}

                                <div className="flex flex-col gap-2 mb-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Dirección</p>
                                        <p className="text-sm text-[#111010]">{order?.address ?? "-"}</p>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Total</p>
                                            <p className="text-sm font-bold text-[#111010]">${order?.total ?? "-"}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/rappi-app/delivery/orders/${order.id}`)}
                                                className="cursor-pointer px-4 py-2 rounded-full border-[1.5px] border-[#e2ddd8] text-[#111010] text-xs font-bold hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors"
                                                style={{ fontFamily: "'Syne', sans-serif" }}
                                            >
                                                Ver detalle
                                            </button>
                                            {String(order?.status ?? "") === "accepted" && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeliverOrder(order.id)}
                                                    disabled={deliveringOrderId === order.id}
                                                    className="cursor-pointer px-4 py-2 rounded-full bg-[#ff4f00] text-white text-xs font-black transition-colors hover:bg-[#e64900] disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                                >
                                                    {deliveringOrderId === order.id ? "Entregando..." : "Entregar"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
