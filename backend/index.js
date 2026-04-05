import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path"
import cors from "cors";

import OrdersRouter from "./routes/modules/orders/orders.router.js";
import UsersRouter from "./routes/modules/users/users.router.js";
import StoresRouter from "./routes/modules/stores/stores.router.js";
import AuthRouter from "./routes/modules/auth/auth.router.js";

const PORT = process.env.PORT || 8080;
const __dirname = import.meta.dirname

const app = express();

const frontendDistPath = path.join(__dirname, "../frontend/dist");
const publicPath = path.join(__dirname, "public");

app.use(cors());
app.use(express.json());

app.use("/orders", OrdersRouter);

app.use("/users", UsersRouter)

app.use("/stores", StoresRouter)

app.use("/api/auth", AuthRouter)

app.use("/rappi", express.static(frontendDistPath))
app.use("/", express.static(publicPath))

app.get(/^\/rappi(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
}); // frontend compilado se sirve desde express bajo la ruta /rappi desde BrowserRouter

app.get(/.*/, (req, res) => {
    if (
        req.path.startsWith("/orders") ||
        req.path.startsWith("/users") ||
        req.path.startsWith("/stores") ||
        req.path.startsWith("/api")
    ) {
        res.status(404).send({ message: "Not found" });
        return;
    }

    res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () => {
    console.log("listening on port:", PORT);
});
