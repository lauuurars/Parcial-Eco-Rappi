export class OrdersController {

    constructor(repository) {
        this.repository = repository; // inyectamos repository 
    }

    // método 1
    createOrder = async (req, res) => {
        try {
            const newOrder = await this.repository.createOrder(req.body); // recibimos lo que envía el cliente :p

            res.status(201).send({ 
                order: newOrder
            });

        } catch (error) { 
            res.status(500).send({
                error: error.message
            });
        }
    }

    //método 2
    getOrdersByUserId = async (req, res) => {
        const userId = Number(req.params.userId);

        const orders = await this.repository.getOrdersByUserId(userId);

        res.send({ orders });
    }

    // método 3
    getOrderById = async (req, res) => {
        const orderId = Number(req.params.id);

        const order = await this.repository.getOrderById(orderId);

        if (!order || order.length === 0) {
            res.send("Orden no encontrada :(");
            return;
        }

        res.send({ order });
    }

    // método 4
    getOrdersByStoreId = async (req, res) => {
        const storeId = Number(req.params.storeId);

        const orders = await this.repository.getOrdersByStoreId(storeId);

        res.send({ orders });
    }

    // método 5
    getAvailableOrders = async (req, res) => {
        const orders = await this.repository.getAvailableOrders();

        res.send({ orders });
    }

    // método 6
    acceptOrder = async (req, res) => {
        const orderId = Number(req.params.id);
        const { delivery_id } = req.body;

        const updatedOrder = await this.repository.acceptOrder(orderId, delivery_id);

    if (!updatedOrder) {
        res.status(409).send({ message: "Order not available or already taken :(" });
        return;
    }

        res.send({ order: updatedOrder });
    }

    // método 7

    getAcceptedOrdersByDeliveryId = async (req, res) => {
        const deliveryId = Number(req.params.deliveryId);

        const orders = await this.repository.getAcceptedOrdersByDeliveryId(deliveryId);

        res.send({ orders });
    }

    // método 8
    
    deliverOrder = async (req, res) => {
        const orderId = Number(req.params.id);
        const { delivery_id } = req.body;

        const updatedOrder = await this.repository.deliverOrder(orderId, delivery_id);

        if (!updatedOrder) {
            res.status(400).send({
                message: "The order cannot be delivered. Please verify that the order has been accepted by a delivery :("
            });
            return;
        }

        res.send({ order: updatedOrder });
    }
}

