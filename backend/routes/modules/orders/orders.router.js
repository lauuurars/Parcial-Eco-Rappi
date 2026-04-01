import express from "express"
import { OrdersController } from "./orders.controller.js"
import { OrdersRepository } from "./orders.repository.js"

const router = express.Router()

const repository = new OrdersRepository();
const controller = new OrdersController(repository); 

router.get("/", (req, res) => {
    res.send({
        message: "Orders Running :3"
    });
});

router.post("/", controller.createOrder); // consumidor 

router.get("/available", controller.getAvailableOrders); // repartidor

router.get("/user/:userId", controller.getOrdersByUserId); // consumidor

router.get("/store/:storeId", controller.getOrdersByStoreId); // tienda

router.get("/delivery/:deliveryId/accepted", controller.getAcceptedOrdersByDeliveryId); // repartidor

router.patch("/:id/accept", controller.assignDelivery); // repartidor

router.patch("/:id/deliver", controller.deliverOrder); // repartidor

router.get("/:id", controller.getOrderById); // tienda

export default router;
