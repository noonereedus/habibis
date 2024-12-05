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
export async function updateDeliveryFee (orderId) {
    
}

// TODO: add items to an order
export async function addItemToOrder(orderId, itemId, studentId, quantity){

}

// TODO: remove items from an order
export async function removeItemFromOrder(orderId, itemId, studentId, quantity){

}
