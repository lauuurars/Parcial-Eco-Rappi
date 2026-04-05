export default function ProductCard({ product, mode = "consumer", isStoreOpen = true, onAdd, onDelete, isDeleting = false }) {
    const name = String(product?.product_name ?? product?.name ?? "Producto");
    const description = String(product?.product_description ?? product?.description ?? "");
    const stockNumber = Number(product?.stock ?? 0);
    const priceNumber = Number(product?.price ?? 0);

    const outOfStock = Number.isFinite(stockNumber) ? stockNumber <= 0 : false;
    const canAdd = mode === "consumer" && Boolean(isStoreOpen) && !outOfStock;

    if (mode === "store") {
        return (
            <article className="rounded-3xl border-[1.5px] border-[#e2ddd8] bg-[#fbfaf8] p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {name}
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 rounded-full border-[1.5px] border-[#e2ddd8] bg-white text-[#8d8d8d] whitespace-nowrap">
                        Stock: {Number.isFinite(stockNumber) ? stockNumber : product?.stock ?? "-"}
                    </span>
                </div>
                <p className="text-sm text-[#7a7370] mb-3">{description}</p>
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#111010]">
                        ${Number.isFinite(priceNumber) ? priceNumber : product?.price ?? "-"}
                    </p>
                    {typeof onDelete === "function" && (
                        <button
                            type="button"
                            onClick={() => onDelete(product)}
                            disabled={isDeleting}
                            className="cursor-pointer px-4 py-2 rounded-full border-[1.5px] border-[#f0e6df] bg-white hover:bg-[#f1f1f1] text-[#e25922] text-xs font-black hover:border-[#d54b14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                    )}
                </div>
            </article>
        );
    }

    return (
        <div
            className={`group rounded-2xl border-[1.5px] bg-white p-5 flex flex-col gap-4 transition-all ${
                canAdd ? "border-[#e2ddd8] hover:border-[#ff4f00] hover:shadow-sm" : "opacity-50 border-[#e2ddd8]"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-black text-[#111010] leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {name}
                </h3>
                <span
                    className={`shrink-0 whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        outOfStock ? "bg-[#fdf0ee] text-[#c0392b]" : "bg-[#f5f2ee] text-[#7a7370]"
                    }`}
                >
                    {outOfStock ? "Sin stock" : `Stock: ${Number.isFinite(stockNumber) ? stockNumber : product?.stock ?? "-"}`}
                </span>
            </div>

            <p className="text-sm text-[#7a7370] leading-relaxed flex-1">{description}</p>

            <div className="flex items-center justify-between gap-3">
                <p className="text-base font-black text-[#111010]" style={{ fontFamily: "'Syne', sans-serif" }}>
                    ${Number.isFinite(priceNumber) ? priceNumber.toLocaleString("es-CO") : product?.price ?? "-"}
                </p>
                <button
                    type="button"
                    onClick={() => onAdd?.(product)}
                    disabled={!canAdd}
                    className="cursor-pointer px-4 py-2 rounded-full bg-[#111010] text-white text-xs font-black transition-colors hover:bg-[#ff4f00] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#111010]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                >
                    + Agregar
                </button>
            </div>
        </div>
    );
}
