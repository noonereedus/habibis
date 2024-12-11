import request from 'supertest';
import { app, server } from '../src/index.js';
import pool from '../src/utils.js';

describe("Endpoint Tests", () => {
    // test variables
    let orderId; 
    let uniqueCode; 
    const student1 = '2644476';
    const student2 = '2563027';
    const student3 = '2545776';

    // order management (create, code, status, join, remove)
    describe("Order management",() => {
        test("POST /order/create should create a new order", async () => {
            const response = await request(app)
                .post('/api/order/create')
                .send({ studentId: student1 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Shared order created successfully");
            expect(response.body.uniqueCode).toBeDefined();
            uniqueCode = response.body.uniqueCode;
        });

        test("POST /order/join should add student 2 to the order", async () => {
            const response = await request(app)
                .post('/api/order/join')
                .send({ studentId: student2, uniqueCode });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Student added to order successfully");
            orderId = response.body.orderId;
        });

        test("POST /order/join should add student 3 to the order", async () => {
            const response = await request(app)
                .post('/api/order/join')
                .send({ studentId: student3, uniqueCode });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Student added to order successfully");
            expect(response.body.orderId).toBe(orderId);
        });

        test("GET /order/:orderId/uniqueCode should return the unique code of an order", async () => {
            const response = await request(app).get(`/api/order/${orderId}/uniqueCode`);
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('uniqueCode', uniqueCode);
        });

        test("GET /order/:orderId/status should return order status", async () => {
            const response = await request(app).get(`/api/order/${orderId}/status`);
        
            expect(response.status).toBe(200);
            expect(response.body.orderStatus).toBeDefined(); 
            expect(response.body.orderStatus).toBe("active")
        });

        test("POST /order/:orderId/removeStudent should remove a student from an order", async () => {
            const response = await request(app)
                .post(`/api/order/${orderId}/removeStudent`)
                .send({ studentId: student3 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Student removed from order successfully");
        });

    });

    // item management (products for each order/student, add, remove)
    describe("Item Management", () => {
        describe("POST /order/:orderId/add should add an item to the order ", () => {
            test("should add item to the order", async () => {
                const response = await request(app)
                    .post(`/api/order/${orderId}/add`)
                    .send({ studentId: 2644476, itemId: 16})
    
                expect(response.status).toBe(200);
                expect(response.body.message).toBe("Item added successfully");
            });

            test("should add item to the order", async () => {
                const response = await request(app)
                    .post(`/api/order/${orderId}/add`)
                    .send({ studentId: 2644476, itemId: 11})
    
                expect(response.status).toBe(200);
                expect(response.body.message).toBe("Item added successfully");
            });

            test("should add item to the order", async () => {
                const response = await request(app)
                    .post(`/api/order/${orderId}/add`)
                    .send({ studentId: 2644476, itemId: 14})
    
                expect(response.status).toBe(200);
                expect(response.body.message).toBe("Item added successfully");
            });

        })
        
        test("GET /order/:orderId/products should list all products in a group order", async () => {
            const response = await request(app)
                .get(`/api/order/${orderId}/products`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.products)).toBe(true);
        });

        test("GET /order/:orderId/student/:studentId/products should list all items of a student in a group order", async () => {
            const response = await request(app)
                .get(`/api/order/${orderId}/student/${student1}/products`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.products)).toBe(true);
        });

        test("POST /order/:orderId/remove should remove an item from the order", async () => {
            const response = await request(app)
                .post(`/api/order/${orderId}/remove`)
                .send({ itemId: 16, studentId: 2644476 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Item removed successfully");
        });

    });

    // payment management (order/student total, delivery share, payment status, complete payment)
    describe("Payment Management", () => {

        test("GET /order/:orderId/total should return the total cost of an order", async () => {
            const response = await request(app)
                .get(`/api/order/${orderId}/total`);
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("orderId");
            expect(response.body).toHaveProperty("totalCost");
        });

        test("GET /order/:orderId/student/:studentId/total should return the total cost for a student in an order", async () => {
            const response = await request(app)
                .get(`/api/order/${orderId}/student/${student1}/total`);
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("orderId");
            expect(response.body).toHaveProperty("studentId", student1);
            expect(response.body).toHaveProperty("individualTotal");
        });    

        test("GET /order/:orderId/deliveryFeeShare should return the delivery fee share for each student", async () => {
            const response = await request(app)
                .get(`/api/order/${orderId}/deliveryFeeShare`);
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("orderId");
            expect(response.body).toHaveProperty("deliveryFeeShare");
            expect(response.body.deliveryFeeShare).toBe("2.50");
        });

        test("GET /order/:orderId/student/:studentId/paymentStatus should return pending", async () =>{
            const response = await request(app)
                .get(`/api/order/${orderId}/student/${student1}/paymentStatus`);

            expect(response.status).toBe(200);
            expect(response.body.paymentStatus).toBe('pending');
            expect(response.body).toHaveProperty("paymentStatus");
        });

        test("POST /order/:orderId/completePayment should mark student1's payment as complete", async () => {
            const response = await request(app)
                .post(`/api/order/${orderId}/completePayment`)
                .send({ studentId: student1 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Payment completed successfully");
        });

        test("GET /order/:orderId/student/:studentId/paymentStatus should return paid", async () =>{
            const response = await request(app)
                .get(`/api/order/${orderId}/student/${student1}/paymentStatus`)

            expect(response.status).toBe(200);
            expect(response.body.paymentStatus).toBe("paid");
            expect(response.body).toHaveProperty("paymentStatus");
        });

        test("POST /order/:orderId/completePayment should mark student2's payment as complete", async () => {
            const response = await request(app)
                .post(`/api/order/${orderId}/completePayment`)
                .send({ studentId: student2 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Payment completed successfully");
        });

        test("GET /order/:orderId/status should return order status", async () => {
            const response = await request(app).get(`/api/order/${orderId}/status`);
        
            expect(response.status).toBe(200);
            expect(response.body.orderStatus).toBeDefined(); 
            expect(response.body.orderStatus).toBe("finalised");
        });

    // clean up after tests
    afterAll (async () => {
        
        try {
            console.log('Cleaning up test data...');
            
            await request(app).get(`/api/order/${orderId}/removeOrder`) 

            console.log('Closing server...');
            await new Promise((resolve, reject) => {
                server.close((err) => (err ? reject(err) : resolve()));
            });
    
            console.log('Closing database connection pool...');
            await pool.end();
    
            console.log('Cleanup completed.');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    });
});
}); 

