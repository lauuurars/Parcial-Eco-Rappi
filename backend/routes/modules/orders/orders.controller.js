export class OrdersController {

    constructor(repository) {
        this.repository = repository; // inyectamos repository 
    }

    // método 1
    createOrder = async (req, res) => {
        try {
            const created = await this.repository.createOrder(req.body); // recibimos lo que envía el cliente :p

            if (created && created.order) {
                res.status(201).send({
                    order: created.order,
                    items: created.items ?? []
                });
                return;
            }

            res.status(201).send({
                order: created
            });

        } catch (error) { 
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    }

    //método 2
    getOrdersByUserId = async (req, res) => {
        try {
            const userId = req.params.userId;
            const orders = await this.repository.getOrdersByUserId(userId);
            res.status(200).send({ orders });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    }

    // método 3
    getOrderById = async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await this.repository.getOrderById(orderId);

            if (!order || order.length === 0) {
                res.status(404).send({ message: "Order not found :(" });
                return;
            }

            res.status(200).send({ order });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    }

    // método 4
    getOrdersByStoreId = async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const orders = await this.repository.getOrdersByStoreId(storeId);
            res.status(200).send({ orders });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    }

    // método 5
    getAvailableOrders = async (req, res) => {
        try {
            const orders = await this.repository.getAvailableOrders();
            res.status(200).send({ orders });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    }

    // método 6
    assignDelivery = async (req, res) => {
        try {
            const orderId = req.params.id;
            const { delivery_id } = req.body;

            const updatedOrder = await this.repository.assignDelivery(orderId, delivery_id);

            if (!updatedOrder) {
                res.status(409).send({ message: "Order not available or already taken :(" });
                return;
            }

            res.status(200).send({ order: updatedOrder });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    }

    // método 7

    getAcceptedOrdersByDeliveryId = async (req, res) => {
        try {
            const deliveryId = req.params.deliveryId;
            const orders = await this.repository.getAcceptedOrdersByDeliveryId(deliveryId);
            res.status(200).send({ orders });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    }

    // método 8
    
    deliverOrder = async (req, res) => {
        try {
            const orderId = req.params.id;
            const { delivery_id } = req.body;

            const updatedOrder = await this.repository.deliverOrder(orderId, delivery_id);

            if (!updatedOrder) {
                res.status(409).send({
                    message: "The order cannot be delivered. Verify it is accepted and assigned to this delivery :("
                });
                return;
            }

            res.status(200).send({ order: updatedOrder });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    }
}

