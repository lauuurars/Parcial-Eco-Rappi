import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to = "/rappi-app/consumer", replace = false, children = "← Volver", className, style, onClick }) {
    const navigate = useNavigate();

    const handleClick = useCallback(
        (event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            navigate(to, { replace });
        },
        [navigate, onClick, replace, to],
    );

    return (
        <button
            type="button"
            onClick={handleClick}
            className={
                className ??
                "cursor-pointer px-4 py-2 rounded-full bg-[#ff4f00] text-white text-xs font-black transition-colors hover:bg-[#e64900] mb-8"
            }
            style={{ fontFamily: "'Syne', sans-serif", ...style }}
        >
            {children}
        </button>
    );
}
