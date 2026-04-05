import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import RappiLogo from "./assets/Rappi_logo.svg.png"
import RappiBanner from "./assets/rappi-banner.avif"

export default function SignUp() {

    const [role, setRole] = useState("consumer");
    const [clientError, setClientError] = useState("");

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        storeName: "",
        storeDescription: "",
        storeAddress: ""
    });

    const { register, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (field) => (e) =>
        setForm({ ...form, [field]: e.target.value });

    const roles = [
        { value: "consumer", emoji: "🛍️", label: "Consumidor" },
        { value: "store",    emoji: "🏪", label: "Tienda"     },
        { value: "delivery", emoji: "🛵", label: "Repartidor" },
    ];

    const inputClass = "w-full px-4 py-3 rounded-xl border-[1.5px] border-[#e2ddd8] bg-white text-[#111010] text-sm outline-none transition-colors focus:border-[#ff4f00] placeholder:text-[#c4bfbb]";
    const labelClass = "text-xs font-semibold uppercase tracking-wide text-[#7a7370]";

    // SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if ((form.password ?? "").length < 12) {
                setClientError("La contraseña debe tener al menos 12 caracteres :(");
                return;
            }

            await register(form, role);

            navigate("/rappi-app") // redirección según rol

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f2ee] grid grid-cols-1 md:grid-cols-2">

            {/* ── PANEL IZQUIERDO ── */}
            <div
                className="hidden md:flex flex-col justify-between text-white p-12 top-0 h-screen sticky"
                style={{
                    backgroundImage: `url(${RappiBanner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full">
                    <a href="/" className="text-sm text-white/40 hover:text-white transition-colors">
                        ← Volver al inicio
                    </a>

                    <div>
                        <img src={RappiLogo} alt="Rappi" className="h-16 mb-6 object-contain" />
                        <h2 className="text-4xl font-black tracking-tight leading-tight mb-4"
                            style={{ fontFamily: "'Syne', sans-serif" }}>
                            Únete a la<br />
                            <em className="not-italic text-[#ff4f00]">plataforma</em>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            Crea tu cuenta en segundos y empieza a disfrutar de la experiencia según tu rol.
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
                        Crear cuenta
                    </h1>

                    <p className="text-sm text-[#7a7370] mb-8">
                        ¿Ya tienes una?{" "}
                        <a href="/login" className="text-[#ff4f00] hover:underline">
                            Inicia sesión
                        </a>
                    </p>

                    {/* SELECTOR DE ROL */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {roles.map(({ value, emoji, label }) => (
                            <label
                                key={value}
                                className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-[1.5px] cursor-pointer text-center transition-all select-none
                                    ${role === value
                                        ? "border-[#ff4f00] bg-[#fff4f0]"
                                        : "border-[#e2ddd8] hover:border-[#ff4f00]"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={value}
                                    checked={role === value}
                                    onChange={() => setRole(value)}
                                    className="hidden"
                                />
                                <span className="text-2xl">{emoji}</span>
                                <span className="text-xs font-bold"
                                    style={{ fontFamily: "'Syne', sans-serif" }}>
                                    {label}
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* CAMPOS BASE */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Username</label>
                            <input type="text" className={inputClass} placeholder="Nombre de usuario" required
                                onChange={handleChange("username")} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Correo electrónico</label>
                            <input type="email" className={inputClass} placeholder="correo@example.com" required
                                onChange={handleChange("email")} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Contraseña</label>
                            <input
                                type="password"
                                className={inputClass}
                                placeholder="Mínimo 12 caracteres"
                                minLength={12}
                                required
                                onChange={(e) => {
                                    setClientError("");
                                    handleChange("password")(e);
                                }}
                            />
                        </div>
                    </div>

                    {/* CAMPOS TIENDA */}
                    {role === "store" && (
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Nombre de la tienda</label>
                                <input type="text" className={inputClass} placeholder="Sr Wok..." required
                                    onChange={handleChange("storeName")} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Descripción</label>
                                <input type="text" className={inputClass} placeholder="Delicioso sushi..." required
                                    onChange={handleChange("storeDescription")} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Dirección</label>
                                <input type="text" className={inputClass} placeholder="Cra 123 #45-67" required
                                    onChange={handleChange("storeAddress")} />
                            </div>
                        </div>
                    )}

                    {/* BOTÓN */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-full cursor-pointer bg-[#ff4f00] text-white font-bold text-sm 
                        tracking-wide hover:bg-[#df4904] transition-opacity disabled:opacity-50"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        {loading ? "Creando..." : "Crear cuenta"}
                    </button>

                    {/* ERROR */}
                    {(clientError || error) && (
                        <p className="text-xs text-red-500 mt-3">{clientError || error}</p>
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
