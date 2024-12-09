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
    });
    
    // clean up after tests
    afterAll(async () => {
      await pool.end();
    });  
  });