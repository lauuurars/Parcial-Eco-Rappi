import { pool } from "../../config/supabase-db.js"
import { randomUUID } from "crypto";

export class OrdersRepository {

    // método 1: crear una nueva orden :D (consumidor)

    createOrder = async (order) => {
        const items = Array.isArray(order?.items) ? order.items : [];
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const orderQuery = `
                INSERT INTO orders (id, consumer_id, store_id, address, payment_method, total, status, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
                RETURNING *;
            `;

            const orderId = randomUUID();
            const orderValues = [
                orderId,
                order.consumer_id,
                order.store_id,
                order.address,
                order.payment_method,
                order.total
            ];

            const orderResult = await client.query(orderQuery, orderValues);
            const createdOrder = orderResult.rows[0];

            if (items.length === 0) {
                await client.query("COMMIT");
                return { order: createdOrder, items: [] };
            }

            const insertValues = [];
            const rowsSql = items.map((item, index) => {
                const base = index * 5;
                insertValues.push(
                    randomUUID(),
                    createdOrder.id,
                    item.product_id,
                    item.quantity,
                    item.price
                );
                return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
            }).join(", ");

            const itemsQuery = `
                INSERT INTO order_items (id, order_id, product_id, quantity, price)
                VALUES ${rowsSql}
                RETURNING *;
            `;

            const itemsResult = await client.query(itemsQuery, insertValues);

            await client.query("COMMIT");
            return { order: createdOrder, items: itemsResult.rows };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    // método 2: órdenes de un usuario (consumidor)

    getOrdersByUserId = async (userId) => {
        const query = `
            SELECT
                o.id AS order_id,
                o.consumer_id,
                o.store_id,
                o.address,
                o.payment_method,
                o.total,
                o.status,
                o.created_at,
                s.name AS store_name,
                oi.id AS item_id,
                oi.product_id,
                oi.quantity,
                oi.price AS item_price,
                p.product_name
            FROM orders o
            LEFT JOIN stores s ON s.id = o.store_id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE o.consumer_id = $1
            ORDER BY o.created_at DESC, oi.id ASC;
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
            WHERE status = 'accepted' AND delivery_id IS NULL
            ORDER BY created_at ASC;
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    // método 6: aceptar una orden (repartidor)

    assignDelivery = async (orderId, deliveryId) => {
        const query = `
        UPDATE orders
        SET delivery_id = $1
        WHERE id = $2 AND delivery_id IS NULL AND status = 'accepted'
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

    // método 8: marcar una orden como entregada

    deliverOrder = async (orderId, deliveryId) => {
        const query = `
            UPDATE orders
            SET status = 'delivered'
            WHERE id = $1 AND delivery_id = $2 AND status = 'accepted'
            RETURNING *;
        `;

        const values = [orderId, deliveryId];

        const result = await pool.query(query, values);
        return result.rows[0];
    }
}
