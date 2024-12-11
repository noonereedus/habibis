import express from 'express';
import pool from './utils.js';
import { 
    addItemToOrder, 
    removeItemFromOrder,
    createOrder,
    addStudentToOrder,
    removeStudentFromOrder,
    completePayment, 
} from './utils.js'; 

const router = express.Router();

// get summary of an order
router.get('/order/:orderId/summary', async (req, res) => {
    const { orderId } = req.params;

    // get order details
    const orderDetails = await pool.query(
        `SELECT id AS order_id, unique_code, total_cost
         FROM shared_orders
         WHERE id = $1`,
        [orderId]
    );

    // get details and products for each student
    const studentDetails = await pool.query(
        `SELECT sc.student_id, 
                s.name AS student_name, 
                sc.individual_total, 
                sc.delivery_fee_share, 
                sc.payment_status,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'product_name', gi.name, 
                        'product_price', gi.price,
                        'quantity', soi.quantity
                    )
                ) AS products
         FROM student_contributions sc
         JOIN shared_order_items soi 
           ON sc.order_id = soi.order_id AND sc.student_id = soi.student_id
         JOIN grocery_items gi 
           ON soi.item_id = gi.id
         JOIN students s 
           ON sc.student_id = s.student_id
         WHERE sc.order_id = $1
         GROUP BY sc.student_id, s.name, sc.individual_total, sc.delivery_fee_share, sc.payment_status`,
        [orderId]
    );

    res.json({ orderDetails: orderDetails.rows[0], students: studentDetails.rows });
    
})

// list all students in database
router.get('/students', async (req, res) => {
    const result = await pool.query('SELECT student_id, name FROM students');
    res.json(result.rows);
});

// list all products
router.get('/products', async(req, res) => {
    const result = await pool.query('SELECT * FROM grocery_items');
    res.json(result.rows);
})

// list all products in group order
router.get('/order/:orderId/products', async (req, res) => {
    const { orderId } = req.params;

    const result = await pool.query(
        `SELECT 
            shared_order_items.item_id, 
            grocery_items.name AS product_name, 
            shared_order_items.quantity
         FROM shared_order_items
         JOIN grocery_items ON shared_order_items.item_id = grocery_items.id
         WHERE shared_order_items.order_id = $1`,
         [orderId]
      );

      res.json({ orderId, products: result.rows });
});

// list all products of a student in group order
router.get('/order/:orderId/student/:studentId/products', async (req, res) => {
    const { orderId, studentId } = req.params;

    const result = await pool.query(
        `SELECT 
            shared_order_items.item_id, 
            grocery_items.name AS product_name, 
            shared_order_items.quantity
         FROM shared_order_items
         JOIN grocery_items ON shared_order_items.item_id = grocery_items.id
         WHERE shared_order_items.order_id = $1
         AND shared_order_items.student_id = $2`,  
         
        [orderId, studentId]
    );

    res.json({ orderId, studentId, products: result.rows });
});

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

// get delivery fee for each student in an order
router.get('/order/:orderId/deliveryFeeShare', async (req, res) => {
    const { orderId } = req.params;

    const result = await pool.query(
        `SELECT delivery_fee_share 
         FROM student_contributions
         WHERE order_id = $1`,
         [orderId] 
    );
    res.json({ orderId, deliveryFeeShare: result.rows[0].delivery_fee_share });
})

// add items to an order
router.post('/order/:orderId/add', async (req,res) => {
    const { orderId } = req.params;
    const { itemId, studentId } = req.body;

    await addItemToOrder(orderId, itemId, studentId);
    res.json({ message: "Item added successfully" }); 
})

// remove items from an order
router.post('/order/:orderId/remove', async (req,res) => {
    const { orderId } = req.params;
    const { itemId, studentId } = req.body;

    await removeItemFromOrder(orderId, itemId, studentId);
    res.json({ message: "Item removed successfully" }); 
})

// get unique_code of an order
router.get('/order/:orderId/uniqueCode', async (req, res) => {
    const { orderId } = req.params;

    const result = await pool.query(
        `SELECT unique_code 
         FROM shared_orders
         WHERE id = $1`,
        [orderId]
    );
    res.json({orderId, uniqueCode: result.rows[0].unique_code })  //TODO: handle edge cases

})

// create a new shared order
router.post('/order/create', async (req, res) => {
    const { studentId } = req.body;

    const uniqueCode = await createOrder(studentId);
    res.json({ message: "Shared order created successfully", uniqueCode })
});

// join orders by adding a student from an order
router.post('/order/join', async (req, res) => {
    const { studentId, uniqueCode } = req.body;

    try{
        const orderId = await addStudentToOrder(studentId, uniqueCode);
        res.json ({ message: "Student added to order successfully", orderId });
        
    } catch (err) {
        res.json({ error: err.message });
    }

});

// remove student from an order
router.post('/order/:orderId/removeStudent', async (req, res) => { 
	const { orderId } = req.params; 
	const { studentId } = req.body; 

	await removeStudentFromOrder(studentId, orderId); 
	res.json({ message: "Student removed from order successfully" }); 
});

// get payment status of a student in an order
router.get('/order/:orderId/student/:studentId/paymentStatus', async(req, res) => {
	const { orderId, studentId } = req.params;  

	const result = await pool.query(
        `SELECT payment_status
		 FROM student_contributions
		 WHERE order_id = $1 AND student_id = $2`,
		 [orderId, studentId]
    );

    const { payment_status } = result.rows[0];

	res.json({ paymentStatus: payment_status });
    
}); 

// get status of a group order 
router.get('/order/:orderId/status', async(req, res) => {
	const { orderId } = req.params;  

	const result = await pool.query(
		`SELECT status
		 FROM shared_orders
		 WHERE id = $1`,
		[orderId]
    );

    const { status } = result.rows[0];
	res.json({ orderStatus: status });
}); 

// complete payment of a student 
router.post('/order/:orderId/completePayment', async (req, res) => {
    const { orderId } = req.params;
    const { studentId } = req.body;

    await completePayment(orderId, studentId);
    res.json({ message: "Payment completed successfully" });
});

// delete an order 
router.post('/order/:orderId', async (req, res) => {
    const { orderId } = req.params;

    await deleteOrder(orderId);
    res.json({ message: "Order deleted successfully"});
});

export default router;