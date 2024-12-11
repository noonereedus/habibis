import { generateCode } from '../src/utils.js';
import pool from '../src/utils.js'; 

describe('Utility Function Tests', () => {

    describe('generateCode', () => {
      test('should return a 5-character string', async () => {
        const code = await generateCode();
        expect(code).toHaveLength(5);
      });

      test('should only contain allowed characters', async () => {
        const code = await generateCode();
        const allowedChars = /^[ABCDEFGHIJKLMNPQRSTUVWXYZ123456789]+$/;
        expect(allowedChars.test(code)).toBe(true);
      });

      test('codes should be unique', async () => {
        const code1 = await generateCode();
        const code2 = await generateCode();
        expect(code1).not.toBe(code2);
      });

      // TODO: Test if `updateOrderTotal` calculates the total cost accurately for an order.
      // TODO: Test if `updateIndividualTotal` calculates the correct individual total for a student in an order.
      // TODO: Test if `updateDeliveryFee` distributes the delivery fee equally among all students.
      // TODO: Test adding a new item updates the order correctly.
      // TODO: Test incrementing an existing item's quantity updates the totals correctly.
      // TODO: Test decrementing the quantity of an item updates the totals correctly.
      // TODO: Test removing the item (quantity = 0) updates the totals correctly.
      // TODO: Test if `generateCode` creates a unique, valid 5-character code.
      // TODO: Test if `createOrder` creates a new order and adds the creator to contributions.
      // TODO: Test if `createOrder` creates a new order and adds the creator to contributions.
      // TODO: Test if a new student can be added to an existing order.
      // TODO: Test if delivery fee updates when a student is added.
      // TODO: Test if a student is removed and totals/delivery fees are updated correctly.



    });
    
    // clean up after tests
    afterAll(async () => {
      await pool.end();
    });  
  });