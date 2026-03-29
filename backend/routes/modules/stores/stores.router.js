import express from "express"
import { StoresController } from "./stores.controller.js"
import { StoresRepository } from "./stores.repository.js"

const router = express.Router()

const repository = new StoresRepository();
const controller = new StoresController(repository);

router.get("/", controller.getAllStores);

router.post("/", controller.createStore);

router.get("/:id", controller.getStoreById);

router.patch("/:id/toggle", controller.toggleStoreStatus);

router.patch("/:storeId/orders/:orderId", controller.decideOrder);

router.post("/:storeId/products", controller.createProduct); // creando producto en la tienda seleccionada

export default router;
