import { pool } from "../../config/supabase-db.js"

export class StoresRepository {

    // método 1: crear una tienda

    createStore = async (store) => {
        const query = `
            INSERT INTO stores (owner_id, name, description, address, is_open, created_at)
            VALUES ($1, $2, $3, $4, false, NOW())
            RETURNING *;
        `;

        const values = [
            store.owner_id,
            store.name,
            store.description,
            store.address
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // método 2: obtener todas las tiendas

    getAllStores = async () => {
        const query = `
            SELECT * FROM stores
            ORDER BY id ASC;
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    // método 3: obtener una tienda por id

    getStoreById = async (storeId) => {
        const query = `
            SELECT * FROM stores
            WHERE id = $1;
        `;

        const result = await pool.query(query, [storeId]);
        return result.rows[0];
    }

    // método 4: abrir o cerrar tienda :p

    toggleStoreStatus = async (storeId) => {
        const query = `
            UPDATE stores
            SET is_open = NOT is_open
            WHERE id = $1
            RETURNING *;
        `;

        const result = await pool.query(query, [storeId]);
        return result.rows[0];
    }

    // método 5: aceptar o rechazar una orden

    decideOrder = async (storeId, orderId, decision) => {
        const status = decision === "accept" ? "accepted" : "cancelled";

        const query = `
            UPDATE orders
            SET status = $1
            WHERE id = $2 AND store_id = $3 AND status = 'pending'
            RETURNING *;
        `;

        const values = [status, orderId, storeId];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // método 6: crear producto

    createProduct = async (storeId, product) => {
        const query = `
            INSERT INTO products (store_id, product_name, product_description, price, stock, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;

        const values = [
            storeId,
            product.product_name,
            product.product_description,
            product.price,
            product.stock
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }
}
