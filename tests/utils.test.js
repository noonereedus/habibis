import { generateCode } from '../src/utils.js';
import pool from '../src/utils.js'; 

describe('Utility Function Tests', () => {
    test('generateCode should return a 5-character string', async () => {
      const code = await generateCode();
      expect(code).toHaveLength(5);
    });

    // clean up after tests
    afterAll(async () => {
      await pool.end();
    });  
  });