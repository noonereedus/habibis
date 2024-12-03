import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import pg from 'pg'

const app = express();
const { Pool } = pg

app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

// test the database connection
async function testConnection() {
    try {
        const res = await pool.query('SELECT * FROM students');
        console.log('Database Test Result:', res.rows);
    } catch (err) {
        console.error(err);
    }
}
  
testConnection();

// list all products
app.get('/products', async(req, res) => {
    const result = await pool.query('SELECT * FROM grocery_items');
    res.json(result.rows);
})

// TODO: list all products in group order

// TODO: list all products of a student in group order

// calculate total cost of an order
app.get('/order/:orderId/total', async (req, res) => {
    const { orderId } = req.params;

    const result = await pool.query(
        `SELECT SUM(gi.price * soi.quantity) AS total_cost
         FROM shared_order_items soi
         JOIN grocery_items gi ON soi.item_id = gi.id
         WHERE soi.order_id = $1`,
        [orderId]
      );
    
    res.json({ orderId, totalCost: result.rows[0].total_cost || 0 });
})

// calculate total cost of student in group order
app.get('/order/:orderId/student/:studentId/total', async (req, res) => {
    const { orderId, studentId } = req.params;

    const result = await pool.query(
        `SELECT SUM(gi.price * soi.quantity) AS individual_total
         FROM shared_order_items soi
         JOIN grocery_items gi ON soi.item_id = gi.id
         WHERE soi.order_id = $1 AND soi.student_id = $2`,
        [orderId, studentId]
    );

    res.json({ orderId, studentId, individualTotal: result.rows[0].individual_total || 0 });
})

// TODO: dynamically calculate delivery fee per student in an order 

// TODO: add/remove items in an order

// start the server 
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
})
