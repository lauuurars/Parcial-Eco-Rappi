import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path"
import cors from "cors";

import OrdersRouter from "./routes/modules/orders/orders.router.js";
import UsersRouter from "./routes/modules/users/users.router.js";
import StoresRouter from "./routes/modules/stores/stores.router.js";

const PORT = 8080;
const __dirname = import.meta.dirname

const app = express();

app.use(cors());
app.use(express.json());

app.use("/orders", OrdersRouter);

app.use("/users", UsersRouter)

app.use("/stores", StoresRouter)

app.use("/", express.static(path.join(__dirname, "public")))

app.listen(PORT, () => {
    console.log("listening on port:", PORT);
});
