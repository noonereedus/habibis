import express from 'express'
import router from './endpoints.js';
import pool from './utils.js';
// import { function_names } from './utils.js';

const app = express();
app.use(express.json());
app.use('/api', router);

// test the database connection (temporary)
async function testConnection() {
    try {
        const res = await pool.query('SELECT * FROM students');
        console.log('Database Test Result:', res.rows);
    } catch (err) {
        console.error(err);
    }
} 
testConnection();

// start the server 
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
})
