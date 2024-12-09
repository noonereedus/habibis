import request from 'supertest';
import { app, server } from '../src/index.js';
import pool from '../src/utils.js';

describe("Endpoint Tests", () => {
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