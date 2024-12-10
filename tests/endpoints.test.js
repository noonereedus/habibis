import request from 'supertest';
import { app, server } from '../src/index.js';
import pool from '../src/utils.js';

describe("Endpoint Tests", () => {
    // test variables
    let orderId; 
    let uniqueCode; 
    const student1 = 2644476;
    const student2 = 2563027;
    const student3 = 2545776;

    // order management (create, code, status, join, remove)
    describe("Order management",() => {
        test("POST /order/create should create a new order", async () => {
            const response = await request(app)
                .post('/order/create')
                .send({ student1 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Shared order created successfully");
            expect(response.body.uniqueCode).toBeDefined();
            uniqueCode = response.body.uniqueCode;
        });

        test("POST /order/join should add student 2 to the order", async () => {
            const response = await request(app)
                .post('/order/join')
                .send({ student2, uniqueCode });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Student added to order successfully");
            orderId = response.body.orderId;
        });

        test("POST /order/join should add student 3 to the order", async () => {
            const response = await request(app)
                .post('/order/join')
                .send({ student3, uniqueCode });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Student added to order successfully");
            expect(response.body.orderId).toBe(orderId);
        });

        test("GET /order/:orderId/uniqueCode should return the unique code of an order", async () => {
            const response = await(app).get('/order/${orderId}/code');
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('uniqueCode', uniqueCode);
        });

        test("GET /order/:orderId/status should return order status", async () => {
            const response = await request(app).get('/order/${orderId}/status');
        
            expect(response.status).toBe(200);
            expect(response.body.orderStatus).toBeDefined(); 
            expect(response.body.orderStatus).toBe("active")
        });

        test("POST /order/remove should remove a student from an order", async () => {
            const response = await request(app)
                .post('/order/$orderId/remove')
                .send({ student3 });

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

    // payment management (order/student total, delivery share, payment status, complete payment)
    describe("Payment Management", () => {

        test("GET /order/:orderId/total should return the total cost of an order", async () => {
            const response = await request(app)
                .get(`/order/${testOrderId}/total`);
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("orderId", testOrderId);
            expect(response.body).toHaveProperty("totalCost");
            expect(typeof response.body.totalCost).toBe("number");
        });

        test("GET /order/:orderId/student/:studentId/total should return the total cost for a student in an order", async () => {
            const response = await request(app)
                .get(`/order/${testOrderId}/student/${testStudentIds[0]}/total`);
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("orderId", testOrderId);
            expect(response.body).toHaveProperty("studentId", testStudentIds[0]);
            expect(response.body).toHaveProperty("individualTotal");
            expect(typeof response.body.individualTotal).toBe("number");
        });    

        test("GET /order/:orderId/deliveryFeeShare should return the delivery fee share for each student", async () => {
            const response = await request(app)
                .get(`/order/${testOrderId}/deliveryFeeShare`);
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("orderId", testOrderId);
            expect(response.body).toHaveProperty("deliveryFeeShare");
            expect(typeof response.body.deliveryFeeShare).toBe("number");
        });

        test("GET /order/:orderId/student/:studentId/paymentStatus should return payment status", async () =>{
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