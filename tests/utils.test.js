import { generateCode } from '../src/utils.js';

describe('Utility Function Tests', () => {
    test('generateCode should return a 5-character string', () => {
      const code = generateCode();
      expect(code).toHaveLength(5);
    });
  });