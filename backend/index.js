import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import OrdersRouter from "./routes/modules/orders/orders.router.js";

const PORT = 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/orders", OrdersRouter);

app.listen(PORT, () => {
    console.log("listening on port:", PORT);
});