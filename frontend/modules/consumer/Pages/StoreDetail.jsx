import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../../../src/context/CartContext.js";
import AppNavbar from "../../../src/shared/components/AppNavbar.jsx";
import BackButton from "../../../src/shared/components/BackButton.jsx";
import ProductCard from "../../../src/shared/components/ProductCard.jsx";

export default function StoreDetail() {
    const { storeId } = useParams();
    const { addToCart } = useContext(CartContext) ?? {};

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

    useEffect(() => {
        let isCancelled = false;

        const fetchStoreAndProducts = async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const normalizedApiBaseUrl = (apiBaseUrl ?? "").trim().replace(/\/+$/, "");
                const storeUrl = normalizedApiBaseUrl ? `${normalizedApiBaseUrl}/stores/${storeId}` : `/stores/${storeId}`;
                const productsUrl = normalizedApiBaseUrl ? `${normalizedApiBaseUrl}/stores/${storeId}/products` : `/stores/${storeId}/products`;

                const [storeResponse, productsResponse] = await Promise.all([
                    fetch(storeUrl),
                    fetch(productsUrl),
                ]);

                const storeJson = await storeResponse.json();
                const productsJson = await productsResponse.json();

                if (!storeResponse.ok) throw new Error(storeJson?.error || storeJson?.message || "No se pudo cargar la tienda");
                if (!productsResponse.ok) throw new Error(productsJson?.error || productsJson?.message || "No se pudieron cargar los productos");

                if (!isCancelled) {
                    setStore(storeJson?.store ?? null);
                    setProducts(Array.isArray(productsJson?.products) ? productsJson.products : []);
                }
            } catch (error) {
                if (!isCancelled) setErrorMessage(error.message);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        if (storeId) fetchStoreAndProducts();
        return () => { isCancelled = true; };
    }, [apiBaseUrl, storeId]);

    const handleAddToCart = (product) => {
        if (typeof addToCart !== "function") return;
        addToCart(product);
    };

    return (
        <div className="min-h-screen bg-[#f5f2ee]">
            <AppNavbar title={store?.name ?? "Tienda"} />

            {/* ── main ── */}
            <main className="mx-auto max-w-6xl px-6 py-10">

                {/* volver btn */}
                <BackButton to="/rappi-app/consumer" />

                {/* header tienda */}
                {store && (
                    <div className="mb-10">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-[#ff4f00] mb-2">
                                    Detalle de tienda
                                </p>
                                <h1 className="text-4xl font-black tracking-tight text-[#111010] leading-none mb-3"
                                    style={{ fontFamily: "'Syne', sans-serif" }}>
                                    {store.name}
                                </h1>
                                <p className="text-md text-[#7a7370] leading-relaxed max-w-lg">
                                    {store.description ?? "Sin descripción"}
                                </p>
                            </div>
                            <span className={`shrink-0 text-[14px] font-bold px-8 py-1.5 rounded-full border-[1.5px]
                                ${store.is_open
                                    ? "border-[#d7f5df] bg-[#effff3] text-[#1f7a36]"
                                    : "border-[#f0e6df] bg-[#fff6f0] text-[#7a3a1f]"}`}>
                                {store.is_open ? "Abierta" : "Cerrada"}
                            </span>
                        </div>
                        <p className="text-[15px] text-[#7a7370] mt-3">
                            📍 {store.address ?? "—"}
                        </p>
                        {/* separadpr */}
                        <div className="mt-8 h-px bg-[#e2ddd8]" />
                    </div>
                )}

                {/* estados de carga y vacío */}
                {isLoading && (
                    <p className="text-sm text-[#7a7370] py-16 text-center">Cargando productos...</p>
                )}
                {!isLoading && errorMessage && (
                    <p className="text-sm text-[#ff4f00] py-16 text-center">{errorMessage}</p>
                )}
                {!isLoading && !errorMessage && products.length === 0 && (
                    <p className="text-sm text-[#7a7370] py-16 text-center">
                        Esta tienda aún no tiene productos.
                    </p>
                )}

                {/* Grid de productos */}
                {!isLoading && !errorMessage && products.length > 0 && (
                    <>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#7a7370] mb-5"
                            style={{ fontFamily: "'Syne', sans-serif" }}>
                            Todos los Productos
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((product) => {
                                return (
                                    <ProductCard
                                        key={product.id}
                                        mode="consumer"
                                        product={product}
                                        isStoreOpen={Boolean(store?.is_open)}
                                        onAdd={handleAddToCart}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
