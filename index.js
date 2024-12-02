import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import pg from 'pg'

const app = express();
const { Pool } = pg

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

async function testConnection() {
    try {
        const res = await pool.query('SELECT * FROM students');
        console.log('Database Test Result:', res.rows);
    } catch (err) {
        console.error(err);
    }
}
  
testConnection();