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


// [ Utility Functions ]

async function updateOrderTotal(orderId){
    const result = await pool.query(
        `UPDATE shared_orders
         SET total_cost = (
             SELECT SUM(gi.price * soi.quantity)
             FROM shared_order_items soi
             JOIN grocery_items gi ON soi.item_id = gi.id
             WHERE soi.order_id = $1
         )
         WHERE id = $1`,
        [orderId]
    );
}

async function updateIndividualTotal(orderId, studentId) {
    const result = await pool.query(
        `UPDATE student_contributions
         SET individual_total = (
             SELECT SUM(gi.price * soi.quantity)
             FROM shared_order_items soi
             JOIN grocery_items gi ON soi.item_id = gi.id
             WHERE soi.order_id = $1 AND soi.student_id = $2
         )
         WHERE order_id = $1 AND student_id = $2`,
        [orderId, studentId]
    );
}

// TODO: dynamically calculate delivery fee per student in an order 
async function updateDeliveryFee (orderId) {
    
}

// TODO: add items to an order
async function addItemToOrder(orderId, itemId, studentId, quantity){

}

// TODO: remove items from an order
async function removeItemFromOrder(orderId, itemId, studentId, quantity){

}


// [ Endpoints ]

// list all products
app.get('/products', async(req, res) => {
    const result = await pool.query('SELECT * FROM grocery_items');
    res.json(result.rows);
})

// TODO: list all products in group order

// TODO: list all products of a student in group order

// get total cost of an order
app.get('/order/:orderId/total', async (req, res) => {
    const { orderId } = req.params;

    const result = await pool.query(
        `SELECT total_cost
         FROM shared_orders
         WHERE id = $1`,
        [orderId]
      );
    
    res.json({ orderId, totalCost: result.rows[0].total_cost || 0 });
})

// get total cost of student in group order
app.get('/order/:orderId/student/:studentId/total', async (req, res) => {
    const { orderId, studentId } = req.params;

    const result = await pool.query(
        `SELECT individual_total
         FROM student_contributions
         WHERE order_id = $1 AND student_id = $2`,
        [orderId, studentId]
    );

    res.json({ orderId, studentId, individualTotal: result.rows[0].individual_total || 0 });
})

// TODO: get delivery fee for each student in an order

// TODO: add items to an order

// TODO: remove items from an order



// start the server 
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
})
