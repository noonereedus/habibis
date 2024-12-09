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

        // add multiple students to the order
        for (const studentId of testStudentIds) {
            await pool.query(
                `INSERT INTO student_contributions (order_id, student_id, delivery_fee_share)
                 VALUES ($1, $2, $3)`,
                [testOrderId, studentId, 5.00]
            );
        }

    });

    // TODO: order management (create, code, status, join, remove)
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

    // TODO: item management (products for each order/student, add, remove)
    
    // example test (edit as needed)
    describe("Item Management", () => {
        test("GET /api/products should return the list of products", async () => {
            const response = await request(app).get("/api/products");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        // other tests in item management...
    });

    // TODO: payment management (order/student total, delivery share, payment status, complete payment)

    // clean up after tests
    afterAll (async () => {
        await request(app).delete(endpoint);
        
        server.close();
        await pool.end();
    });
});