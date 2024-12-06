import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

export default pool;

export async function updateOrderTotal(orderId){
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

export async function updateIndividualTotal(orderId, studentId) {
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
const DELIVERY_FEE = 5;
export async function updateDeliveryFee (orderId) {
    const countResult = await pool.query(
        `SELECT COUNT(DISTINCT student_id) AS count
         FROM shared_order_items
         WHERE order_id = $1`,
        [orderId]
    );

    const numOfStudents = countResult.rows[0].count;
    if (numOfStudents === 0) {
        throw new Error(`No students in order_id ${orderId}.`);
    }

    const result = await pool.query(
        `UPDATE student_contributions
         SET delivery_fee_share = $1 / $2
         WHERE order_id = $3`,
        [DELIVERY_FEE, numOfStudents, orderId]
    );
}

// TODO: add items to an order
export async function addItemToOrder(orderId, itemId, studentId){
    
    // check if item already exists for student
    const result = await pool.query(
        `SELECT quantity FROM shared_order_items
         WHERE order_id = $1 AND item_id = $2 AND student_id = $3`,
        [orderId, itemId, studentId]
    );

    if (result.rows.length > 0) {
        // if item exists, increment quantity
        await pool.query(
            `UPDATE shared_order_items
             SET quantity = quantity + 1
             WHERE order_id = $1 AND item_id = $2 AND student_id = $3`,
            [orderId, itemId, studentId]
        );
    } else {
        // if item doesnt exist, insert it
        await pool.query(
            `INSERT INTO shared_order_items (order_id, item_id, student_id)
             VALUES ($1, $2, $3)`,
            [orderId, itemId, studentId]
        );
    }

    await updateOrderTotal(orderId);
    await updateIndividualTotal(orderId, studentId);
}

// TODO: remove items from an order
export async function removeItemFromOrder(orderId, itemId, studentId){
    // get quantity of item to be removed
    const result = await pool.query(
        `SELECT quantity FROM shared_order_items
         WHERE order_id = $1 AND item_id = $2 AND student_id = $3`,
        [orderId, itemId, studentId]
    );

    const itemQuantity = result.rows[0].quantity;

    if(itemQuantity > 1) {
        await pool.query(
            `UPDATE shared_order_items
             SET quantity = quantity - 1
             WHERE order_id = $1 AND item_id = $2 AND student_id = $3`,
            [orderId, itemId, studentId]
        );
    } else {
        await pool.query(
            `DELETE FROM shared_order_items
             WHERE order_id = $1 AND item_id = $2 AND student_id = $3`,
            [orderId, itemId, studentId]
        );
    }

    await updateOrderTotal(orderId);
    await updateIndividualTotal(orderId, studentId);
}
