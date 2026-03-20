import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';

export const pool = new Pool({
    host: "aws-0-us-west-2.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres.yczqtreizuanspvyhsgh",
    password: process.env.DB_PASSWORD,
})