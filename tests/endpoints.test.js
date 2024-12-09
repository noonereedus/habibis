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
                .send({ stuentId });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('orderId');
            expect(response.body).toHaveProperty('uniqueCode');
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
        server.close();
        await pool.end();
    });
});