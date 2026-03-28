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

    createUser = async ({ name, email }) => {
        const query = `
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        RETURNING *
    `;

        const values = [name, email];

        const result = await pool.query(query, values);
        return result.rows[0]

    }
}
