import express from 'express';
import pool from './utils.js';
// import { function_names } from './utils.js';

const router = express.Router();


// list all products
router.get('/products', async(req, res) => {
    const result = await pool.query('SELECT * FROM grocery_items');
    res.json(result.rows);
})

// TODO: list all products in group order

// TODO: list all products of a student in group order

// get total cost of an order
router.get('/order/:orderId/total', async (req, res) => {
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
router.get('/order/:orderId/student/:studentId/total', async (req, res) => {
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

export default router;