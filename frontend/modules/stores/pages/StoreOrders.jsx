import { useCallback, useEffect, useMemo, useState } from "react";
import AppNavbar from "../../../src/shared/components/AppNavbar.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";

export default function StoreOrders() {
    const { user } = useAuth();
    const storeId = user?.store?.id ?? "";
    const storeName = user?.store?.name ?? "";

    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

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

        const loadOrders = async () => {
            if (!storeId) {
                setIsLoadingOrders(false);
                return;
            }

            try {
                setIsLoadingOrders(true);
                setErrorMessage("");

                const response = await fetch(buildUrl(`/orders/store/${storeId}`));
                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json?.error || json?.message || "No se pudieron cargar las órdenes.");
                }

                if (!isCancelled) {
                    setOrders(Array.isArray(json?.orders) ? json.orders : []);
                }
            } catch (error) {
                if (!isCancelled) {
                    setErrorMessage(String(error?.message ?? "No se pudieron cargar las órdenes."));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingOrders(false);
                }
            }
        };

        loadOrders();

        return () => {
            isCancelled = true;
        };
    }, [storeId, buildUrl]);

    const historyOrders = (Array.isArray(orders) ? orders : []).filter((order) => order?.status && order.status !== "pending");
    const title = storeName ? `Órdenes · ${storeName}` : "Órdenes";

    return (
        <div className="min-h-screen bg-[#f5f2ee]">
            <AppNavbar title={title} />

            <main className="mx-auto max-w-6xl px-6 py-10">
                <section className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Historial de órdenes
                        </h1>
                        <p className="text-sm text-[#7a7370]">
                            Órdenes ya aceptadas, rechazadas o entregadas.
                        </p>
                    </div>

                    {!storeId && (
                        <div className="text-sm text-[#7a7370]">
                            No se encontró una tienda asociada a tu sesión. Cierra sesión e inicia nuevamente con tu cuenta de tienda.
                        </div>
                    )}

                    {storeId && isLoadingOrders && (
                        <div className="text-sm text-[#7a7370]">Cargando historial...</div>
                    )}

                    {storeId && !isLoadingOrders && errorMessage && (
                        <div className="text-sm text-red-500">{errorMessage}</div>
                    )}

                    {storeId && !isLoadingOrders && !errorMessage && historyOrders.length === 0 && (
                        <div className="text-sm text-[#7a7370]">Aún no hay órdenes aceptadas o rechazadas.</div>
                    )}

                    {storeId && !isLoadingOrders && !errorMessage && historyOrders.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {historyOrders.map((order) => {
                                const status = String(order?.status ?? "");
                                const label = status === "accepted" ? "Aceptada" : status === "cancelled" ? "Rechazada" : status === "delivered" ? "Entregada" : status;
                                const badgeClass =
                                    status === "accepted"
                                        ? "border-[#d7f5df] bg-[#effff3] text-[#1f7a36]"
                                        : status === "cancelled"
                                            ? "border-[#f3d7d7] bg-[#fff0f0] text-[#c0392b]"
                                            : status === "delivered"
                                                ? "border-[#d7e7f5] bg-[#f0f7ff] text-[#1f4f7a]"
                                                : "border-[#e2ddd8] bg-white text-[#7a7370]";

                                return (
                                    <div key={order.id} className="rounded-2xl border-[1.5px] border-[#e2ddd8] bg-white p-4">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Orden</p>
                                                <p className="text-sm font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                    {String(order?.id ?? "").slice(0, 8)}
                                                </p>
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full border-[1.5px] whitespace-nowrap ${badgeClass}`}>
                                                {label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Dirección</p>
                                                <p className="text-sm text-[#111010]">{order?.address ?? "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Total</p>
                                                <p className="text-sm font-bold text-[#111010]">${order?.total ?? "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
