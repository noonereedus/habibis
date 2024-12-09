import { generateCode } from '../src/utils.js';
import pool from '../src/utils.js'; 

afterAll(async () => {
    await pool.end();
});

describe('Utility Function Tests', () => {
    test('generateCode should return a 5-character string', async () => {
      const code = await generateCode();
      expect(code).toHaveLength(5);
    });
  });