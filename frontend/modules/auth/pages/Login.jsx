import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { Link, useNavigate } from "react-router-dom";
import RappiLogo from "./assets/Rappi_logo.svg.png"
import RappiBanner from "./assets/rappi-banner.avif"

export default function Login() {

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (field) => (e) =>
        setForm({ ...form, [field]: e.target.value });

    const inputClass = "w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00] placeholder:text-[#c4bfbb]";
    const labelClass = "text-xs font-semibold uppercase tracking-wide text-[#7a7370]";

    // login 
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await login(form);

            const role = data.role;
            console.log("LOGIN DATA:", data);

            // redirección según rol
            if (role === "consumer") {
                navigate("/rappi-app/consumer");
            } 
            else if (role === "delivery") {
                navigate("/rappi-app/delivery");
            } 
            else if (role === "store") {
                navigate("/rappi-app/stores");
            }

        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className="min-h-screen bg-[#f5f2ee] grid grid-cols-1 md:grid-cols-2">

            {/* ── PANEL IZQUIERDO ── */}
            <div
                className="hidden md:flex flex-col justify-between text-white p-12 sticky top-0 h-screen"
                style={{
                    backgroundImage: `url(${RappiBanner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-black/80" />

                <div className="relative z-10 flex flex-col justify-between h-full">
                    <a href="/" className="text-sm text-white/40 hover:text-white transition-colors">
                        ← Volver al inicio
                    </a>

                    <div>
                        <img src={RappiLogo} alt="Rappi" className="h-16 mb-6 object-contain" />
                        <h2 className="text-4xl font-black tracking-tight leading-tight mb-4"
                            style={{ fontFamily: "'Syne', sans-serif" }}>
                            Bienvenido<br />
                            <em className="not-italic text-[#ff4f00]">de nuevo</em>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            Inicia sesión y continúa donde lo dejaste.
                        </p>
                    </div>

                    <p className="text-xs text-white/20">© 2025 Rappi</p>
                </div>
            </div>

            {/* ── PANEL DERECHO ── */}
            <div className="flex items-start justify-center px-6 py-12 md:px-12 overflow-y-auto">
                <form onSubmit={handleSubmit} className="w-full max-w-md pt-8">

                    <h1 className="text-3xl font-black tracking-tight text-[#111010] mb-1"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        Iniciar sesión
                    </h1>

                    <p className="text-sm text-[#7a7370] mb-8">
                        ¿No tienes cuenta?{" "}
                        <Link to="/sign-up" className="text-[#ff4f00] hover:underline">
                            Crear cuenta
                        </Link>
                    </p>

                    {/* CAMPOS */}
                    <div className="flex flex-col gap-4 mb-6">

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Correo electrónico</label>
                            <input
                                type="email"
                                className={inputClass}
                                placeholder="correo@example.com" 
                                onChange={handleChange("email")} required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Contraseña</label>
                            <input
                                type="password"
                                className={inputClass}
                                placeholder="Mínimo 12 caracteres"
                                onChange={handleChange("password")} required
                            />
                        </div>

                    </div>

                    {/* BOTÓN */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-full cursor-pointer bg-[#ff4f00] text-white font-bold text-sm 
                        tracking-wide hover:bg-[#df4904] transition-opacity disabled:opacity-50"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        {loading ? "Entrando..." : "Iniciar sesión"}
                    </button>

                    {/* ERROR */}
                    {error && (
                        <p className="text-xs text-red-500 mt-3">{error}</p>
                    )}

                    {/* DIVISOR */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-[#e2ddd8]" />
                        <span className="text-xs text-[#7a7370]">o</span>
                        <div className="flex-1 h-px bg-[#e2ddd8]" />
                    </div>

                </form>
            </div>
        </div>
    );
}
