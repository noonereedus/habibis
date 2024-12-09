import request from 'supertest';
import app from '../src/index';

describe("Endpoint Tests", () => {
    // TODO: order management (create, code, status, join, remove)

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

});