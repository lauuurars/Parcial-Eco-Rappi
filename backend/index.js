import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import OrdersRouter from "./routes/modules/orders/orders.router.js";
import UsersRouter from "./routes/modules/users/users.router.js";
import StoresRouter from "./routes/modules/stores/stores.router.js";
import AuthRouter from "./routes/modules/auth/auth.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// puerto dinámico para Render
const PORT = process.env.PORT || 8080;

const app = express();

// Paths
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const publicPath = path.join(__dirname, "public");

app.use(cors());
app.use(express.json());

//Rutas API
app.use("/orders", OrdersRouter);
app.use("/users", UsersRouter);
app.use("/stores", StoresRouter);
app.use("/api/auth", AuthRouter);

// servir frontend compilado
app.use("/rappi", express.static(frontendDistPath));

// servir landing 
app.use("/", express.static(publicPath));

// SPA fallback
app.get(/^\/rappi(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
});

// 
app.get("*", (req, res) => {
    if (
        req.path.startsWith("/orders") ||
        req.path.startsWith("/users") ||
        req.path.startsWith("/stores") ||
        req.path.startsWith("/api")
    ) {
        return res.status(404).json({ message: "Not found" });
    }

    res.sendFile(path.join(publicPath, "index.html"));
});


app.listen(PORT, () => {
    console.log("listening on port:", PORT);
});