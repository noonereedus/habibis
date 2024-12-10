import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const useSSL = process.env.CI === 'true'; 

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: 30000,
    ssl: useSSL ? { rejectUnauthorized: false } : false
});

export default pool;

const DELIVERY_FEE = 5;

export async function updateOrderTotal(orderId){
    await pool.query(
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
    await pool.query(
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

export async function updateDeliveryFee (orderId) {
    const countResult = await pool.query(
        `SELECT COUNT(DISTINCT student_id) AS count
         FROM student_contributions
         WHERE order_id = $1`,
        [orderId]
    );

    const numOfStudents = countResult.rows[0].count;
    if (numOfStudents === 0) {
        throw new Error(`No students in order_id ${orderId}.`);
    }

    await pool.query(
        `UPDATE student_contributions
         SET delivery_fee_share = $1::NUMERIC / $2::NUMERIC
         WHERE order_id = $3`,
        [DELIVERY_FEE, numOfStudents, orderId]
    );
}

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

// generate a unique code
export async function generateCode(){
    let result = '';
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';

    // generate unique code
    for(let i = 0; i < 5; i++){
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // check if unique code already exists
    const codeResult = await pool.query(
        `SELECT * FROM shared_orders
         WHERE unique_code = $1`,
        [result]
    );

    // if code is already used, generate again
    if(codeResult.rows.length > 0) {
        return await generateCode();
    }

    return result;
}

// create a shared order
export async function createOrder(studentId) {
    const uniqueCode = await generateCode();

    const result = await pool.query(
        `INSERT INTO shared_orders (created_by, unique_code)
         VALUES ($1, $2)
         RETURNING id`,
        [studentId, uniqueCode]
    );

    const orderId = result.rows[0].id;

    await pool.query(
        `INSERT INTO student_contributions (order_id, student_id, delivery_fee_share)
         VALUES ($1, $2, $3)`,
        [orderId, studentId, DELIVERY_FEE]
    );

    return uniqueCode;
}

// add student to shared order
export async function addStudentToOrder(studentId, uniqueCode) {
    
    // validate the unique code exists
    const result = await pool.query(
        `SELECT id FROM shared_orders
         WHERE unique_code = $1`,
        [uniqueCode]
    );

    if(result.rows.length < 1) {
        throw new Error('Invalid unique code.');
    }

    const orderId = result.rows[0].id;

    // check if student is already in group order
    const existingEntry = await pool.query(
        `SELECT * FROM student_contributions
         WHERE order_id = $1 AND student_id = $2`,
        [orderId, studentId]
    );

    if(existingEntry.rows.length > 0) {
        throw new Error ('Student is already part of this order');
    }
    
    // add student to group order
    await pool.query(
        `INSERT INTO student_contributions (order_id, student_id)
         VALUES ($1, $2)`,
        [orderId, studentId]
    );

    // update delivery fee when a new student joins
    await updateDeliveryFee(orderId);

    return orderId;
}

// remove student from group order
export async function removeStudentFromOrder(studentId, orderId) {
    await pool.query(
        `DELETE FROM student_contributions
         WHERE student_id = $1 AND order_id = $2`,
        [studentId, orderId]
    );

    await updateOrderTotal(orderId);
    await updateDeliveryFee(orderId);
}

// set payment status of student in order to paid
export async function completePayment(orderId, studentId) {
    await pool.query(
        `UPDATE student_contributions
         SET payment_status = 'paid'
         WHERE order_id = $1 AND student_id = $2`,
        [orderId, studentId]
    );

    await updateOrderStatus(orderId);
}

// finalise order status once all participants complete payment
export async function updateOrderStatus(orderId) {

    // check if all students paid, if so finalise status
    const result = await pool.query(
        `SELECT * FROM student_contributions
         WHERE order_id = $1 AND payment_status = 'pending'`,
        [orderId]
    );

    if(result.rows.length === 0){
        await pool.query(
            `UPDATE shared_orders
             SET status = 'finalised'
             WHERE id = $1`,
            [orderId] 
        );
    }
}

// delete an order
export async function deleteOrder(orderId) {
    await pool.query(`DELETE FROM shared_order_items WHERE order_id = $1`, [orderId]);
    await pool.query(`DELETE FROM shared_orders WHERE id = $1`, [orderId]);
    await pool.query(`DELETE FROM student_contributions WHERE order_id = $1`, [orderId]);
}

/**
 * Initialise test data for the database.
 *
 * Note: Update this function if new test data is added into data.sql.
 */
 
export async function initaliseData() {
    // order 1
    await updateDeliveryFee(1);
    await updateOrderTotal(1);
    await updateIndividualTotal(1, '2644476');
    await updateIndividualTotal(1, '2563027');
    await updateIndividualTotal(1, '2545776');

    // order 2 
    await updateDeliveryFee(2);
    await updateOrderTotal(2);
    await updateIndividualTotal(2, '2521768');
}
