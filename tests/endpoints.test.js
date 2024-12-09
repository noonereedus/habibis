import request from 'supertest';
import { app, server } from '../src/index.js';
import pool from '../src/utils.js';

describe("Endpoint Tests", () => {
    let testOrderId;
    let testStudentIds = [2644476, 2563027, 2545776, 2521768];
    let testUniqueCode = 'TEST123';

    beforeAll(async () => {
        // create a test order 
        const orderResult = await pool.query(
            `INSERT INTO shared_orders (created_by, unique_code)
             VALUES ($1, $2) RETURNING id, unique_code`
            [testStudentIds[0], testUniqueCode]
        );
        testOrderId = orderResult.rows[0].id;

        // add students to the order
        for (const studentId of testStudentIds) {
            await pool.query(
                `INSERT INTO student_contributions (order_id, student_id, delivery_fee_share)
                 VALUES ($1, $2, $3)`,
                [testOrderId, studentId, 5.00]
            );
        }

    });

    // order management (create, code, status, join, remove)
    describe("Order management",() => {
        test("POST /order/create should create a new order", async () => {
            const studentId = 2644476;
            const response = await request(app)
                .post('/order/create')
                .send({ studentId });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Shared order created successfully");
            expect(response.body.uniqueCode).toBeDefined();
        });

        test("GET /order/:orderId/uniqueCode should return the unique code of an order", async () => {
            const response = await(app).get('/order/${testOrderId}/code');
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('uniqueCode', testUniqueCode);
        });

        test("GET /order/:orderId/status should return order status", async () => {
            const orderId = 1;

            const response = await request(app).get('/order/${orderId}/status');
        
            expect(response.status).toBe(200);
            expect(response.body.orderStatus).toBeDefined(); 
        });

        test("POST /order/join should add a student to an order", async () => {
            const studentId = 2644476;
            const uniqueCode = "TESTCODE"

            const response = await request(app)
                .post('/order/join')
                .send({ studentId, uniqueCode });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Student added to order successfully");
        });

        test("POST /order/remove should remove a student from an order", async () => {
            const studentId = 2644476;
            const orderId = 1

            const response = await request(app)
                .post('/order/$orderId/remove')
                .send({ studentId });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Student removed from order successfully");
        });

    });

    // item management (products for each order/student, add, remove)
    describe("Item Management", () => {
        
        test("GET /order/:orderId/products should list all products in a group order", async () => {
            const response = await request(app)
                .get(`/order/${testOrderId}/items`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.items)).toBe(true);
        });

        test("GET /order/:orderId/student/:studentId/products should list all items of a student in a group order", async () => {
            const response = await request(app)
                .get(`/order/${testOrderId}/student/${testStudentIds}/products`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.items)).toBe(true);
        });

        test("POST /order/:orderId/add should add an item to the order", async () => {
            const response = await request(app)
                .post(`/order/${testOrderId}/add`)
                .send({ studentId: 2644476, itemName: "Pizza", itemPrice: 15.00})

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Item added successfully");
        });

        test("DELETE /order/:orderId/remove should remove an item from the order", async () => {
            const testItemId = 1;
            const response = await request(app)
                .delete(`/order/${testOrderId}/remove`)
                .send({ studentId: 2644476 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Item removed successfully");
        });

    });

    // TODO: payment management (order/student total, delivery share, payment status, complete payment)
    describe("Payment Management", () => {
        test("Get /order/:orderId/student/:studentId/paymentStatus should return payment status", async () =>{
            const response = await request(app)
                .get(`/order/${testOrderId}/student/${testStudentIds[0]}/paymentStatus`)

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("paymentStatus");
        });

        test("POST /order/:orderId/completePayment should mark payment as complete", async () => {
            const response = await request(app)
                .post(`/order/${testOrderId}/completePayment`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Payment completed successfully");
        });


    // clean up after tests
    afterAll (async () => {
        await request(app).delete(`/order/${testOrderId}`);
        
        server.close();
        await pool.end();
    });
});
});