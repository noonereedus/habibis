import express from 'express'
import router from './endpoints.js';
import pool from './utils.js';
import { initaliseData } from './utils.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors()); //Allows requests from different ports - I get a fetch error otherwise
app.use('/api', router);


initaliseData();

// test the database connection
async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log("✅ Database connected successfully at: ", res.rows[0].now);
    } catch (err) {
        console.error("❌ Database connection failed: ", err.message);
        process.exit(1);
    }   
} 

// start the server 
const port = 3000;
app.listen(port, async () => {
    console.log(`🚀 Server running on port ${port}.`);
    await testConnection();
});
