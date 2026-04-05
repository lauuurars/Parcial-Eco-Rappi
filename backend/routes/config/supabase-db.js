import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

import { Pool } from 'pg';

export const pool = new Pool({
    host: "aws-0-us-west-2.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: "postgres.yczqtreizuanspvyhsgh",
    password: process.env.DB_PASSWORD,
})

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);