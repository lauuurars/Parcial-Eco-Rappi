import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import OrdersRouter from "./routes/modules/orders/orders.router.js";
import UsersRouter from "./routes/modules/users/users.router.js";
import StoresRouter from "./routes/modules/stores/stores.router.js";

const PORT = 8080;

const app = express();

app.get("/", (req, res) => {
    res.send({
        message: "Server Running :D"
    });
});

app.use(cors());
app.use(express.json());

app.use("/orders", OrdersRouter);

app.use("/users", UsersRouter)

app.use("/stores", StoresRouter)

app.listen(PORT, () => {
    console.log("listening on port:", PORT);
});
