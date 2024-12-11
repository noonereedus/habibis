import pool from './utils.js';


async function reset() {

    try {
        await pool.query('BEGIN');
    
        // delete all rows in the tables excluding students or grocery items
        await pool.query('DELETE FROM student_contributions');
        await pool.query('DELETE FROM shared_order_items');
        await pool.query('DELETE FROM shared_orders');
    
        // reinsert initial hardcoded/seed data into shared_orders
        await pool.query(`
          INSERT INTO shared_orders (created_by, unique_code) VALUES 
          ('2644476', '5XYD3'),
          ('2521768', 'BR3FQ');
        `);
    
        // reinsert initial data into shared_order_items for order 1 - 5XYD3
        await pool.query(`
          INSERT INTO shared_order_items (item_id, order_id, student_id, quantity) VALUES
          (2, 1, '2644476', 2),
          (13, 1, '2545776', 1),
          (6, 1, '2563027', 3),
          (7, 1, '2563027', 3),
          (17, 1, '2644476', 1);
        `);
    
        // reinsert initial data into shared_order_items for shared order 2 - BR3FQ
        await pool.query(`
            INSERT INTO shared_order_items (item_id, order_id, student_id, quantity) VALUES
            (20, 2, '2521768', 12);
        `);

        // reinsert initial data into student_contributions for shared order 1 - 5XYD3 
        await pool.query(`
            INSERT INTO student_contributions (order_id, student_id) VALUES
            (1, '2644476'),
            (1, '2545776'),
            (1, '2563027');
        `);

        // reinsert initial data into student_contributions for shared order 2 - BR3FQ 
        await pool.query(`
            INSERT INTO student_contributions (order_id, student_id) VALUES
            (2, '2521768');
        `);
    

        // commit the transaction after successful execution
        await pool.query('COMMIT');
        console.log('Database reset successfully.');


      } catch (err) {
        // if any query fails then roll back the transaction
        await pool.query('ROLLBACK');
        console.error('Error during database reset:', err);
        process.exit(1); 
      }

}
export default reset;

(async () => {
  await reset();
})();