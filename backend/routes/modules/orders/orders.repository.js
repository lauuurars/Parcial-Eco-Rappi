import { pool } from "../../config/supabase-db.js"

export class OrdersRepository {

    // método 1: crear una nueva orden :D (consumidor)

    createOrder = async (order) => {

        // query que representa la orden, usamos placeholders para ordenar la info
        const query = `
            INSERT INTO orders (consumer_id, store_id, address, payment_method, total, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
            RETURNING *;
        `;

        // valores de la orden (reemplazan los placeholders)
        const values = [
            order.consumer_id,
            order.store_id,
            order.address,
            order.payment_method,
            order.total
        ];

        const result = await pool.query(query, values); // ejecutamos consulta en db
        return result.rows[0]; // devolvemos la orden creada 
    }

    // método 2: órdenes de un usuario (consumidor)

    getOrdersByUserId = async (userId) => {
        const query = `
            SELECT * FROM orders
            WHERE consumer_id = $1
            ORDER BY created_at DESC;
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    // método 3: obtener una orden por id 

    getOrderById = async (orderId) => {
        // unimos orders con order_items, trayendo la orden y sus productos
        const query = `
            SELECT o.*, 
                oi.id AS item_id,
                oi.product_id,
                oi.quantity,
                oi.price
            FROM orders o
            LEFT JOIN order_items oi 
            ON o.id = oi.order_id
            WHERE o.id = $1;
        `;

        const result = await pool.query(query, [orderId]);
        return result.rows;
    }

    // método 4: obtener ordenes de una tienda

    getOrdersByStoreId = async (storeId) => {
        const query = `
            SELECT * FROM orders
            WHERE store_id = $1
            ORDER BY created_at DESC;
        `;

        const result = await pool.query(query, [storeId]);
        return result.rows;
    }

    // método 5: ordenes disponibles (repartidor)

    getAvailableOrders = async () => {
        const query = `
            SELECT * FROM orders
            WHERE status = 'pending' AND delivery_id IS NULL
            ORDER BY created_at ASC;
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    // método 6: aceptar una orden (repartidor)

    acceptOrder = async (orderId, deliveryId) => {
        const query = `
        UPDATE orders
        SET delivery_id = $1,
        status = 'accepted'
        WHERE id = $2 AND delivery_id IS NULL
        RETURNING *;
    `;

        const values = [deliveryId, orderId];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // método 7: ordenes aceptadas por los repartidores :p

    getAcceptedOrdersByDeliveryId = async (deliveryId) => {
        const query = `
            SELECT * FROM orders
            WHERE delivery_id = $1 AND status = 'accepted'
            ORDER BY created_at DESC;
        `;

        const result = await pool.query(query, [deliveryId]);
        return result.rows;
    }
}
