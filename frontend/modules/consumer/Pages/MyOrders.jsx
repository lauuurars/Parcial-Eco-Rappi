import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../../../src/shared/components/AppNavbar.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import BackButton from "../../../src/shared/components/BackButton.jsx";

export default function MyOrders() {
    const { user } = useAuth();
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

    useEffect(() => {
        const userId = user?.id;
        if (!userId) {
            setIsLoading(false);
            setRows([]);
            setErrorMessage("No se pudo identificar tu usuario, inicia sesión nuevamente :(");
            return;
        }

        const normalizedApiBaseUrl = String(apiBaseUrl ?? "").trim().replace(/\/+$/, "");
        const url = normalizedApiBaseUrl ? `${normalizedApiBaseUrl}/orders/user/${userId}` : `/orders/user/${userId}`;

        let cancelled = false;

        const run = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");
                const response = await fetch(url);
                const json = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(json?.error || json?.message || "No se pudieron cargar tus pedidos.");
                }
                if (cancelled) return;
                setRows(Array.isArray(json?.orders) ? json.orders : []);
            } catch (error) {
                if (cancelled) return;
                const message = String(error?.message ?? "No se pudieron cargar tus pedidos.");
                setErrorMessage(message);
                setRows([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [apiBaseUrl, user?.id]);

    const orders = useMemo(() => {
        const map = new Map();
        for (const row of rows) {
            const orderId = row?.order_id ?? row?.id;
            if (!orderId) continue;

            const existing = map.get(orderId);
            if (!existing) {
                map.set(orderId, {
                    id: orderId,
                    store_name: row?.store_name ?? "Tienda",
                    status: row?.status ?? "",
                    total: row?.total ?? 0,
                    created_at: row?.created_at,
                    address: row?.address ?? "",
                    payment_method: row?.payment_method ?? "",
                    items: [],
                });
            }

            const itemId = row?.item_id;
            if (itemId) {
                map.get(orderId).items.push({
                    id: itemId,
                    product_name: row?.product_name ?? "Producto",
                    quantity: row?.quantity ?? 1,
                    price: row?.item_price ?? row?.price ?? 0,
                });
            }
        }

        return Array.from(map.values());
    }, [rows]);

    return (
        <div className="min-h-screen bg-[#f5f2ee]">
            <AppNavbar title="Mis pedidos" />

            <main className="mx-auto max-w-6xl px-6 py-10">
                <BackButton to="/rappi-app/consumer" />

                <h1 className="text-2xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Historial de pedidos
                </h1>
                <p className="text-sm text-[#7a7370] mb-8">
                    Aquí puedes ver todas las órdenes que has creado.
                </p>

                {isLoading && (
                    <div className="text-sm text-[#7a7370]">
                        Cargando pedidos...
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="text-sm text-red-500">
                        {errorMessage}
                    </div>
                )}

                {!isLoading && !errorMessage && orders.length === 0 && (
                    <div className="text-sm text-[#7a7370]">
                        Aún no tienes pedidos.
                    </div>
                )}

                {!isLoading && !errorMessage && orders.length > 0 && (
                    <div className="flex flex-col gap-5">
                        {orders.map((order) => {
                            const createdAt = order?.created_at ? new Date(order.created_at) : null;
                            const createdAtText = createdAt && !Number.isNaN(createdAt.getTime())
                                ? createdAt.toLocaleString("es-CO")
                                : "";

                            return (
                                <div
                                    key={order.id}
                                    className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                        <div className="min-w-0">
                                            <p className="text-md font-bold uppercase tracking-widest text-[#ff4f00] mb-2">
                                                {order.store_name}
                                            </p>
                                            <p className="text-lg font-black text-[#111010] truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                Pedido #{order.id}
                                            </p>
                                            {createdAtText && (
                                                <p className="text-xs text-[#7a7370] mt-1">
                                                    {createdAtText}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-start sm:items-end gap-1">
                                            <span className="text-xs font-bold px-3 py-1 rounded-full border-[1.5px] border-[#e2ddd8] text-[#1c1c1c]">
                                                {order.status || "pendiente"}
                                            </span>
                                            <p className="text-lg font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                ${Number(order.total ?? 0).toLocaleString("es-CO")}
                                            </p>
                                        </div>
                                    </div>

                                    {order.items.length > 0 ? (
                                        <div className="flex flex-col gap-3">
                                            {order.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-start justify-between gap-4 rounded-2xl border-[1.5px] border-[#e2ddd8] bg-[#f5f2ee] p-4"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-[#111010] truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                            {item.product_name}
                                                        </p>
                                                        <p className="text-xs text-[#7a7370] mt-1">
                                                            {item.quantity} × ${Number(item.price ?? 0).toLocaleString("es-CO")}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                        ${(Number(item.price ?? 0) * Number(item.quantity ?? 1)).toLocaleString("es-CO")}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[#7a7370]">
                                            Este pedido no tiene items registrados.
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
