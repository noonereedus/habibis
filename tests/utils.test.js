import { generateCode } from '../src/utils.js';
import pool from '../src/utils.js'; 

describe('Utility Function Tests', () => {
  // test variables 
  let testOrderId;
  const testStudentId = '2644476';
  const initialItems = [
    { name: 'Apples', price: 2.0, quantity: 3 },
    { name: 'Bananas', price: 1.5, quantity: 2 },
  ];

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

    //describe('updateOrderTotal', () => {
    //  test('should calculate the total cost accurately for an order', async () => {
    //    const result = await updateOrderTotal(testOrderId);
//
//        const expectedTotal = initialItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//       expect(result).toBe(expectedTotal);
//      });
//    });
  
    describe('updateIndividualTotal', () => {
      // TODO: Test if `updateIndividualTotal` calculates the correct individual total for a student in an order.
    });
  
    describe('updateDeliveryFee', () => {
      // TODO: Test if `updateDeliveryFee` distributes the delivery fee equally among all students.
      // TODO: Test if delivery fee updates when a student is added.
    });
  
    describe('item management', () => {
      // TODO: Test adding a new item updates the order correctly.
      // TODO: Test incrementing an existing item's quantity updates the totals correctly.
      // TODO: Test decrementing the quantity of an item updates the totals correctly.
      // TODO: Test removing the item (quantity = 0) updates the totals correctly.
    });
  
    describe('student management', () => {
      // TODO: Test if a new student can be added to an existing order.
      // TODO: Test if a student is removed and totals/delivery fees are updated correctly.
    });
  
    
    // clean up after tests
    afterAll(async () => {
      await pool.end();
    });  
  });
});