import { useCallback, useEffect, useMemo, useState } from "react";
import AppNavbar from "../../../src/shared/components/AppNavbar.jsx";
import ProductCard from "../../../src/shared/components/ProductCard.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";

export default function Dashboard() {
    const { user } = useAuth();
    const storeId = user?.store?.id ?? "";

    const [store, setStore] = useState(user?.store ?? null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [isLoadingStore, setIsLoadingStore] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState("");
    const [decidingOrderId, setDecidingOrderId] = useState("");

    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [newProductForm, setNewProductForm] = useState({
        productName: "",
        productDescription: "",
        price: "",
        stock: "",
    });

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

        const loadStoreInfo = async () => {
            if (!storeId) {
                setIsLoadingStore(false);
                return;
            }

            try {
                setIsLoadingStore(true);
                setErrorMessage("");

                const response = await fetch(buildUrl(`/stores/${storeId}`));
                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json?.error || json?.message || "No se pudo cargar la información de la tienda.");
                }

                if (!isCancelled) {
                    setStore(json?.store ?? null);
                }
            } catch (error) {
                if (!isCancelled) {
                    setErrorMessage(String(error?.message ?? "No se pudo cargar la información de la tienda."));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingStore(false);
                }
            }
        };

        loadStoreInfo();

        return () => {
            isCancelled = true;
        };
    }, [storeId, buildUrl]);

    useEffect(() => {
        let isCancelled = false;

        const loadProducts = async () => {
            if (!storeId) {
                setIsLoadingProducts(false);
                return;
            }

            try {
                setIsLoadingProducts(true);
                setErrorMessage("");

                const response = await fetch(buildUrl(`/stores/${storeId}/products`));
                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json?.error || json?.message || "No se pudieron cargar los productos.");
                }

                if (!isCancelled) {
                    setProducts(Array.isArray(json?.products) ? json.products : []);
                }
            } catch (error) {
                if (!isCancelled) {
                    setErrorMessage(String(error?.message ?? "No se pudieron cargar los productos."));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingProducts(false);
                }
            }
        };

        loadProducts();

        return () => {
            isCancelled = true;
        };
    }, [storeId, buildUrl]);

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

    const handleToggleStore = async () => {
        if (!storeId) return;

        try {
            setIsToggling(true);
            setFeedbackMessage("");
            setErrorMessage("");

            const response = await fetch(buildUrl(`/stores/${storeId}/toggle`), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json?.error || json?.message || "No se pudo actualizar el estado de la tienda.");
            }

            setStore(json?.store ?? store);
            const isOpen = Boolean(json?.store?.is_open ?? store?.is_open);
            setFeedbackMessage(isOpen ? "Tienda abierta para recibir pedidos." : "Tienda cerrada. No recibirás pedidos por ahora.");
        } catch (error) {
            setErrorMessage(String(error?.message ?? "No se pudo actualizar el estado de la tienda."));
        } finally {
            setIsToggling(false);
        }
    };

    const handleNewProductChange = (field) => (event) => {
        const value = event?.target?.value ?? "";
        setNewProductForm((current) => ({ ...current, [field]: value }));
    };

    const handleCreateProduct = async (event) => {
        event.preventDefault();
        if (!storeId) return;

        const priceNumber = Number(newProductForm.price);
        const stockNumber = Number(newProductForm.stock);

        if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
            setErrorMessage("El precio debe ser un número mayor a 0.");
            return;
        }

        if (!Number.isFinite(stockNumber) || stockNumber < 0) {
            setErrorMessage("El stock debe ser un número mayor o igual a 0.");
            return;
        }

        try {
            setIsCreatingProduct(true);
            setFeedbackMessage("");
            setErrorMessage("");

            const payload = {
                product_name: newProductForm.productName.trim(),
                product_description: newProductForm.productDescription.trim(),
                price: priceNumber,
                stock: stockNumber,
            };

            const response = await fetch(buildUrl(`/stores/${storeId}/products`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const json = await response.json();

            if (!response.ok) {
                throw new Error(json?.error || json?.message || "No se pudo crear el producto.");
            }

            const createdProduct = json?.product;

            setProducts((current) => {
                const safeCurrent = Array.isArray(current) ? current : [];
                return createdProduct ? [createdProduct, ...safeCurrent] : safeCurrent;
            });

            setNewProductForm({
                productName: "",
                productDescription: "",
                price: "",
                stock: "",
            });

            setFeedbackMessage("Producto creado correctamente.");
        } catch (error) {
            setErrorMessage(String(error?.message ?? "No se pudo crear el producto."));
        } finally {
            setIsCreatingProduct(false);
        }
    };

    const handleDeleteProduct = async (product) => {
        const productId = product?.id;
        const productName = product?.product_name;

        if (!storeId || !productId) return;

        const shouldDelete = window.confirm(`¿Eliminar "${productName ?? "este producto"}"? Esta acción no se puede deshacer.`);
        if (!shouldDelete) return;

        try {
            setDeletingProductId(productId);
            setFeedbackMessage("");
            setErrorMessage("");

            const response = await fetch(buildUrl(`/stores/${storeId}/products/${productId}`), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const json = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(json?.error || json?.message || "No se pudo eliminar el producto.");
            }

            setProducts((current) => (Array.isArray(current) ? current : []).filter((item) => item?.id !== productId));
            setFeedbackMessage("Producto eliminado correctamente.");
        } catch (error) {
            setErrorMessage(String(error?.message ?? "No se pudo eliminar el producto."));
        } finally {
            setDeletingProductId("");
        }
    };

    const handleDecideOrder = async (orderId, decision) => {
        if (!storeId || !orderId) return;

        try {
            setDecidingOrderId(orderId);
            setFeedbackMessage("");
            setErrorMessage("");

            const response = await fetch(buildUrl(`/stores/${storeId}/orders/${orderId}`), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ decision }),
            });
            const json = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(json?.error || json?.message || "No se pudo actualizar la orden.");
            }

            const updatedOrder = json?.order;
            if (updatedOrder?.id) {
                setOrders((current) => (Array.isArray(current) ? current : []).map((order) => (order?.id === updatedOrder.id ? updatedOrder : order)));
            }

            setFeedbackMessage(decision === "accept" ? "Orden aceptada correctamente." : "Orden rechazada correctamente.");
        } catch (error) {
            setErrorMessage(String(error?.message ?? "No se pudo actualizar la orden."));
        } finally {
            setDecidingOrderId("");
        }
    };

    const storeTitle = store?.name ? `Panel · ${store.name}` : "Panel de tienda";
    const isStoreOpen = Boolean(store?.is_open);
    const pendingOrders = (Array.isArray(orders) ? orders : []).filter((order) => order?.status === "pending");

    return (
        <div className="min-h-screen bg-[#f5f2ee]">
            <AppNavbar title={storeTitle} />

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Administra tu tienda
                        </h1>
                        <p className="text-sm text-[#7a7370] max-w-2xl">
                            Información general, abre o cierra tu tienda y crea nuevos productos para tus clientes :D.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={`text-md font-bold px-8 py-2 rounded-full border-[1.5px] ${isStoreOpen
                                ? "border-[#d7f5df] bg-[#effff3] text-[#1f7a36]"
                                : "border-[#f0e6df] bg-[#fff6f0] text-[#7a3a1f]"
                                }`}
                        >
                            {isStoreOpen ? "Abierta" : "Cerrada"}
                        </span>
                        <button
                            type="button"
                            onClick={handleToggleStore}
                            disabled={!storeId || isToggling || isLoadingStore}
                            className="cursor-pointer px-5 py-2 rounded-full bg-[#ff4f00] text-white text-sm font-black transition-colors hover:bg-[#e64900] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            {isToggling ? "Actualizando..." : isStoreOpen ? "Cerrar tienda" : "Abrir tienda"}
                        </button>
                    </div>
                </div>

                {!storeId && (
                    <div className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6 text-sm text-[#7a7370]">
                        No se encontró una tienda asociada a tu sesión. Cierra sesión e inicia nuevamente con tu cuenta de tienda.
                    </div>
                )}

                {storeId && (isLoadingStore || isLoadingProducts || isLoadingOrders) && (
                    <div className="text-sm text-[#7a7370]">Cargando panel...</div>
                )}

                {storeId && !isLoadingStore && !isLoadingProducts && !isLoadingOrders && errorMessage && (
                    <div className="text-sm text-red-500 mb-6">{errorMessage}</div>
                )}

                {storeId && !isLoadingStore && !isLoadingProducts && !isLoadingOrders && feedbackMessage && !errorMessage && (
                    <div className="text-sm text-[#1f7a36] mb-6">{feedbackMessage}</div>
                )}

                {storeId && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <section className="lg:col-span-2 rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6">
                            <h2 className="text-xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Información general
                            </h2>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Nombre</p>
                                    <p className="text-sm font-bold text-[#111010]">{store?.name ?? "-"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Descripción</p>
                                    <p className="text-sm text-[#111010]">{store?.description ?? "-"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Dirección</p>
                                    <p className="text-sm text-[#111010]">{store?.address ?? "-"}</p>
                                </div>
                            </div>
                        </section>

                        <section className="lg:col-span-3 rounded-3xl border-[1.5px] border-[#e2ddd8] bg-white p-6">
                            <h2 className="text-xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Órdenes
                            </h2>
                            <p className="text-sm text-[#7a7370] mb-6">
                                Acepta o rechaza las órdenes pendientes de tus clientes.
                            </p>

                            {isLoadingOrders && (
                                <div className="text-sm text-[#7a7370]">Cargando órdenes...</div>
                            )}

                            {!isLoadingOrders && pendingOrders.length === 0 && (
                                <div className="text-sm text-center justify-center font-bold text-[#db6f41] mb-8">No tienes órdenes pendientes.</div>
                            )}

                            {!isLoadingOrders && pendingOrders.length > 0 && (
                                <div className="flex flex-col gap-3 mb-10">
                                    {pendingOrders.map((order) => (
                                        <div key={order.id} className="rounded-2xl border-[1.5px] border-[#e2ddd8] bg-[#fbfaf8] p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Orden</p>
                                                    <p className="text-sm font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                                        {String(order?.id ?? "").slice(0, 8)}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-bold px-3 py-1 rounded-full border-[1.5px] border-[#f0e6df] bg-white text-[#7a3a1f] whitespace-nowrap">
                                                    Pendiente
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Dirección</p>
                                                    <p className="text-sm text-[#111010]">{order?.address ?? "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Total</p>
                                                    <p className="text-sm font-bold text-[#111010]">${order?.total ?? "-"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDecideOrder(order.id, "reject")}
                                                    disabled={decidingOrderId === order.id}
                                                    className="cursor-pointer px-5 py-2 rounded-full border-[1.5px] border-[#f0e6df] text-[#e25922] text-sm font-bold hover:border-[#e25922] hover:bg-[#fdf0ee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                                >
                                                    {decidingOrderId === order.id ? "Actualizando..." : "Rechazar"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDecideOrder(order.id, "accept")}
                                                    disabled={decidingOrderId === order.id}
                                                    className="cursor-pointer px-5 py-2 rounded-full bg-[#ff4f00] text-white text-sm font-black transition-colors hover:bg-[#e64900] disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{ fontFamily: "'Syne', sans-serif" }}
                                                >
                                                    {decidingOrderId === order.id ? "Actualizando..." : "Aceptar"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <h2 className="text-xl font-black tracking-tight text-[#111010] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Productos
                            </h2>
                            <p className="text-sm text-[#7a7370] mb-6">Crea productos y revisa los productos existentes.</p>

                            <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">
                                        Nombre del producto
                                    </label>
                                    <input
                                        value={newProductForm.productName}
                                        onChange={handleNewProductChange("productName")}
                                        required
                                        type="text"
                                        className="mt-2 w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00] placeholder:text-[#c4bfbb]"
                                        placeholder="Ej: Hamburguesa clásica"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">
                                        Descripción
                                    </label>
                                    <input
                                        value={newProductForm.productDescription}
                                        onChange={handleNewProductChange("productDescription")}
                                        required
                                        type="text"
                                        className="mt-2 w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00] placeholder:text-[#c4bfbb]"
                                        placeholder="Ej: Pan artesanal, carne 150g, salsa especial..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Precio</label>
                                    <input
                                        value={newProductForm.price}
                                        onChange={handleNewProductChange("price")}
                                        required
                                        type="text"
                                        className="mt-2 w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00] placeholder:text-[#c4bfbb]"
                                        placeholder="Ej: 25000"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7370]">Stock</label>
                                    <input
                                        value={newProductForm.stock}
                                        onChange={handleNewProductChange("stock")}
                                        required
                                        type="text"
                                        className="mt-2 w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00] placeholder:text-[#c4bfbb]"
                                        placeholder="Ej: 10"
                                    />
                                </div>

                                <div className="md:col-span-2 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={isCreatingProduct}
                                        className="cursor-pointer px-5 py-2 rounded-full border-[1.5px] border-[#e2ddd8] text-[#111010] text-sm font-bold hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors disabled:opacity-50 disabled:hover:border-[#e2ddd8] disabled:hover:text-[#111010]"
                                        style={{ fontFamily: "'Syne', sans-serif" }}
                                    >
                                        {isCreatingProduct ? "Creando..." : "Crear producto"}
                                    </button>
                                </div>
                            </form>

                            {isLoadingProducts && (
                                <div className="text-sm text-[#7a7370]">Cargando productos...</div>
                            )}

                            {!isLoadingProducts && products.length === 0 && (
                                <div className="text-sm text-[#7a7370]">Aún no tienes productos creados.</div>
                            )}

                            {!isLoadingProducts && products.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            mode="store"
                                            product={product}
                                            onDelete={handleDeleteProduct}
                                            isDeleting={deletingProductId === product?.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
