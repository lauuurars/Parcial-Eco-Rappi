import { pool } from "../../config/supabase-db.js"

export class UsersRepository {

    // método 1: obtener todos los usuarios

    getAllUsers = async () => {
        const query = `
            SELECT * FROM users
            ORDER BY id ASC;
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    // método 2: obtener un usuario por id

    getUserById = async (userId) => {
        const query = `
            SELECT * FROM users
            WHERE id = $1;
        `;

        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    // método 3: crear un nuevo usuario 

    createUser = async ({ id,   username, email, role }) => {
        const normalizeRole = (inputRole) => {
            const r = (inputRole ?? "consumer").trim();
            if (r === "store") return "store_admin";
            return r;
        };

        const safeRole = normalizeRole(role);
        const query = `
        INSERT INTO users (id, username, email, role, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
    `;

        const values = [id, username, email, safeRole];

        const result = await pool.query(query, values);
        return result.rows[0]

    }

}

export const userRepository = new UsersRepository()
