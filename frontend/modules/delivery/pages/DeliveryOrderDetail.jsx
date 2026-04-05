import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppNavbar from "../../../src/shared/components/AppNavbar.jsx";
import BackButton from "../../../src/shared/components/BackButton.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";

export default function DeliveryOrderDetail() {
    const { user } = useAuth();
    const deliveryId = user?.id ?? "";
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDelivering, setIsDelivering] = useState(false);
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

        const loadOrder = async () => {
            if (!orderId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setErrorMessage("");

                const response = await fetch(buildUrl(`/orders/${orderId}`));
                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json?.error || json?.message || "No se pudo cargar la orden.");
                }

                const rows = Array.isArray(json?.order) ? json.order : [];
                const header = rows[0] ?? null;
                const mappedItems = rows
                    .filter((row) => row?.item_id)
                    .map((row) => ({
                        id: row.item_id,
                        product_id: row.product_id,
                        product_name: row.product_name,
                        quantity: row.quantity,
                        price: row.price,
                    }));

                if (!isCancelled) {
                    setOrder(header);
                    setItems(mappedItems);
                }
            } catch (error) {
                if (!isCancelled) {
                    setErrorMessage(String(error?.message ?? "No se pudo cargar la orden."));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadOrder();

        return () => {
            isCancelled = true;
        };
    }, [orderId, buildUrl]);

    const canAccept = Boolean(deliveryId) && order?.status === "accepted" && !order?.delivery_id;
    const canDeliver = Boolean(deliveryId) && order?.status === "accepted" && String(order?.delivery_id ?? "") === String(deliveryId);

    const handleAccept = async () => {
        if (!orderId || !deliveryId) return;

        try {
            setIsAccepting(true);
            setErrorMessage("");
            setFeedbackMessage("");

            const response = await fetch(buildUrl(`/orders/${orderId}/accept`), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ delivery_id: deliveryId }),
            });

            const json = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(json?.error || json?.message || "No se pudo aceptar la orden.");
            }

            navigate("/rappi-app/delivery/accepted");
        } catch (error) {
            setErrorMessage(String(error?.message ?? "No se pudo aceptar la orden."));
        } finally {
            setIsAccepting(false);
        }
    };

    const handleDeliver = async () => {
        if (!orderId || !deliveryId) return;

        try {
            setIsDelivering(true);
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

            setOrder((current) => ({ ...(current ?? {}), ...(json?.order ?? {}), status: "delivered" }));
            setFeedbackMessage("Orden marcada como entregada.");
        } catch (error) {
            setErrorMessage(String(error?.message ?? "No se pudo marcar la orden como entregada."));
        } finally {
            setIsDelivering(false);
        }
    };

    const title = "Repartidor · Detalle";

    return (
        <div className="min-h-screen bg-[#f5f2ee]">
            <AppNavbar title={title} />

            <main className="mx-auto max-w-4xl px-6 py-10">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Detalle de orden
                        </h1>
                        <p className="text-sm text-[#7a7370]">Orden: {String(orderId ?? "").slice(0, 8)}</p>
                    </div>
                    <BackButton
                        to="/rappi-app/delivery"
                    >
                        ← Volver
                    </BackButton>
                </div>

                {isLoading && <div className="text-sm text-[#7a7370]">Cargando detalle...</div>}

                {!isLoading && errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}

                {!isLoading && feedbackMessage && !errorMessage && <div className="text-sm text-[#1f7a36] mb-6">{feedbackMessage}</div>}

                {!isLoading && !errorMessage && !order && (
                    <div className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6 text-sm text-[#7a7370]">
                        No se encontró la orden.
                    </div>
                )}

                {!isLoading && !errorMessage && order && (
                    <div className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Dirección</p>
                                <p className="text-sm text-[#111010]">{order?.address ?? "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Total</p>
                                <p className="text-sm font-bold text-[#111010]">${order?.total ?? "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Pago</p>
                                <p className="text-sm text-[#111010]">{order?.payment_method ?? "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Estado</p>
                                <p className="text-sm text-[#111010]">{order?.status ?? "-"}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370] mb-2">Items</p>
                            {items.length === 0 ? (
                                <p className="text-sm text-[#7a7370]">Esta orden no tiene items.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="rounded-2xl border-[1.5px] border-[#e2ddd8] bg-[#fbfaf8] p-4 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-[#111010]">
                                                    Producto: {item?.product_name ?? String(item?.product_id ?? "").slice(0, 8)}
                                                </p>
                                                <p className="text-xs text-[#7a7370]">Cantidad: {item?.quantity ?? "-"}</p>
                                            </div>
                                            <p className="text-sm font-bold text-[#111010]">${item?.price ?? "-"}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            {canAccept && (
                                <button
                                    type="button"
                                    onClick={handleAccept}
                                    disabled={isAccepting}
                                    className="cursor-pointer px-5 py-2 rounded-full bg-[#ff4f00] text-white text-sm font-black transition-colors hover:bg-[#e64900] disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    {isAccepting ? "Aceptando..." : "Aceptar"}
                                </button>
                            )}
                            {canDeliver && (
                                <button
                                    type="button"
                                    onClick={handleDeliver}
                                    disabled={isDelivering}
                                    className="cursor-pointer px-5 py-2 rounded-full bg-[#ff4f00] text-white text-sm font-black transition-colors hover:bg-[#e64900] disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                >
                                    {isDelivering ? "Entregando..." : "Entregar"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
