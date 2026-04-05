import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../../../src/shared/components/AppNavbar.jsx";

export default function Home() {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchText, setSearchText] = useState("");

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

    useEffect(() => {
        let isCancelled = false;

        const fetchStores = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const normalizedApiBaseUrl = (apiBaseUrl ?? "").trim().replace(/\/+$/, "");
                const storesUrl = normalizedApiBaseUrl ? `${normalizedApiBaseUrl}/stores` : "/stores";
                const response = await fetch(storesUrl);
                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json?.error || json?.message || "No se pudieron cargar las tiendas");
                }

                if (!isCancelled) {
                    setStores(Array.isArray(json?.stores) ? json.stores : []);
                }
            } catch (error) {
                if (!isCancelled) {
                    setErrorMessage(error.message);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchStores();

        return () => {
            isCancelled = true;
        };
    }, [apiBaseUrl]);

    const visibleStores = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();
        if (!normalizedSearch) return stores;

        return stores.filter((store) => {
            const name = String(store?.name ?? "").toLowerCase();
            const description = String(store?.description ?? "").toLowerCase();
            const address = String(store?.address ?? "").toLowerCase();
            return (
                name.includes(normalizedSearch) ||
                description.includes(normalizedSearch) ||
                address.includes(normalizedSearch)
            );
        });
    }, [stores, searchText]);

    return (
        <div className="min-h-screen bg-[#f5f2ee]">
            <AppNavbar title="Tiendas" />

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Explora tiendas disponibles
                        </h1>
                        <p className="text-sm text-[#7a7370] max-w-xl">
                            Busca por nombre, descripción o dirección y elige dónde quieres comprar.
                        </p>
                    </div>

                    <div className="w-full md:w-96">
                        <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">
                            Buscar
                        </label>
                        <input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            type="text"
                            placeholder="Ej: sushi, calle 45, mercado..."
                            className="mt-2 w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00] placeholder:text-[#c4bfbb]"
                        />
                    </div>
                </div>

                {isLoading && (
                    <div className="text-sm text-[#7a7370]">Cargando tiendas...</div>
                )}

                {!isLoading && errorMessage && (
                    <div className="text-sm text-red-500">{errorMessage}</div>
                )}

                {!isLoading && !errorMessage && visibleStores.length === 0 && (
                    <div className="text-sm text-[#7a7370]">
                        No se encontraron tiendas con ese criterio.
                    </div>
                )}

                {!isLoading && !errorMessage && visibleStores.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleStores.map((store) => (
                            <div
                                key={store.id}
                                className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6 flex flex-col gap-3 cursor-pointer hover:border-[#ff4f00] transition-colors"
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/rappi-app/consumer/stores/${store.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        navigate(`/rappi-app/consumer/stores/${store.id}`);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-lg font-black text-[#111010] leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                        {store.name}
                                    </h2>
                                    <span
                                        className={`text-xs font-bold px-3 py-1 rounded-full border-[1.5px] ${store.is_open
                                            ? "border-[#d7f5df] bg-[#effff3] text-[#1f7a36]"
                                            : "border-[#f0e6df] bg-[#fff6f0] text-[#7a3a1f]"
                                            }`}
                                    >
                                        {store.is_open ? "Abierta" : "Cerrada"}
                                    </span>
                                </div>

                                <p className="text-sm text-[#7a7370] leading-relaxed">
                                    {store.description}
                                </p>

                                <div className="text-xs text-[#7a7370]">
                                    <span className="font-semibold">Dirección:</span>{" "}
                                    {store.address}
                                </div>

                                <div className="mt-1">
                                    <span className="text-xs font-bold text-[#ff4f00]">
                                        Ver tienda →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
