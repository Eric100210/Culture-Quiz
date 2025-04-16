import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config(); // Charge les variables du fichier .env


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
