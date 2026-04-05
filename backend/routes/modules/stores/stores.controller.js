export class StoresController {
    constructor(repository) {
        this.repository = repository;
    }

    // método 1

    createStore = async (req, res) => {
        try {
            const newStore = await this.repository.createStore(req.body);
            res.status(201).send({ store: newStore });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // método 2

    getAllStores = async (req, res) => {
        try {
            const stores = await this.repository.getAllStores();
            res.send({ stores });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // método 3

    getStoreById = async (req, res) => {
        try {
            const storeId = req.params.id;
            const store = await this.repository.getStoreById(storeId);

            if (!store) {
                res.send("Store not found :(");
                return;
            }

            res.send({ store });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // método 4

    toggleStoreStatus = async (req, res) => {
        try {
            const storeId = req.params.id;
            const updatedStore = await this.repository.toggleStoreStatus(storeId);

            if (!updatedStore) {
                res.send("Store not found :(");
                return;
            }

            res.send({ store: updatedStore });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // método 5 - aceptar orden 

    decideOrder = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const orderId = req.params.orderId;
        const { decision } = req.body;

        if (!["accept", "reject"].includes(decision)) {
            return res.status(400).send({
                message: "Invalid decision"
            });
        }

        const updatedOrder = await this.repository.decideOrder(
            storeId,
            orderId,
            decision
        );

        if (!updatedOrder) {
            return res.status(404).send({
                message: "Order not found or not available :("
            });
        }

        res.send({ order: updatedOrder });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

    // método 6

    createProduct = async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const newProduct = await this.repository.createProduct(storeId, req.body);
            res.status(201).send({ product: newProduct });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // método 7 
    
    getProductsByStoreId = async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const products = await this.repository.getProductsByStoreId(storeId);
            res.send({ products });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    getAllProducts = async (req, res) => {
        try {
            const products = await this.repository.getAllProducts();
            res.send({ products });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    deleteProduct = async (req, res) => {
        try {
            const storeId = req.params.storeId;
            const productId = req.params.productId;

            const deletedProduct = await this.repository.deleteProduct(storeId, productId);

            if (!deletedProduct) {
                res.status(404).send({ message: "Product not found" });
                return;
            }

            res.send({ product: deletedProduct });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
}
