import { Schema } from '../src/schema';

describe('NumberValidator', () => {
  describe('Basic number validation', () => {
    const validator = Schema.number();
    
    test('should validate valid numbers', () => {
      expect(validator.validate(0)).toEqual({ success: true, data: 0 });
      expect(validator.validate(123)).toEqual({ success: true, data: 123 });
      expect(validator.validate(-456)).toEqual({ success: true, data: -456 });
      expect(validator.validate(3.14)).toEqual({ success: true, data: 3.14 });
      expect(validator.validate(-0)).toEqual({ success: true, data: -0 });
      expect(validator.validate(Number.MAX_VALUE)).toEqual({ success: true, data: Number.MAX_VALUE });
      expect(validator.validate(Number.MIN_VALUE)).toEqual({ success: true, data: Number.MIN_VALUE });
    });
    
    test('should reject infinity', () => {
      expect(validator.validate(Infinity).success).toBe(false);
      expect(validator.validate(-Infinity).success).toBe(false);
      expect(validator.validate(Infinity).error).toBe('Value must be a valid number');
    });
    
    test('should reject NaN', () => {
      const result = validator.validate(NaN);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Value must be a valid number');
    });
    
    test('should reject non-number types', () => {
      const testCases = ['123', '0', '', true, false, {}, [], null, undefined, Symbol('test')];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a valid number');
        expect(result.data).toBeUndefined();
      });
    });
  });
  
  describe('min validation', () => {
    test('should validate minimum value correctly', () => {
      const validator = Schema.number().min(10);
      
      expect(validator.validate(10)).toEqual({ success: true, data: 10 });
      expect(validator.validate(10.1)).toEqual({ success: true, data: 10.1 });
      expect(validator.validate(15)).toEqual({ success: true, data: 15 });
      expect(validator.validate(100)).toEqual({ success: true, data: 100 });
      
      const result = validator.validate(5);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at least 10');
      expect(result.data).toBeUndefined();
      
      const result2 = validator.validate(9.99);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Number must be at least 10');
    });
    
    test('should handle negative minimum values', () => {
      const validator = Schema.number().min(-5);
      
      expect(validator.validate(-5)).toEqual({ success: true, data: -5 });
      expect(validator.validate(-4.99)).toEqual({ success: true, data: -4.99 });
      expect(validator.validate(0)).toEqual({ success: true, data: 0 });
      expect(validator.validate(100)).toEqual({ success: true, data: 100 });
      
      const result = validator.validate(-10);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at least -5');
      
      const result2 = validator.validate(-5.01);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Number must be at least -5');
    });
    
    test('should handle zero as minimum', () => {
      const validator = Schema.number().min(0);
      
      expect(validator.validate(0)).toEqual({ success: true, data: 0 });
      expect(validator.validate(-0)).toEqual({ success: true, data: -0 });
      expect(validator.validate(0.1)).toEqual({ success: true, data: 0.1 });
      
      const result = validator.validate(-0.1);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at least 0');
    });
  });
  
  describe('max validation', () => {
    test('should validate maximum value correctly', () => {
      const validator = Schema.number().max(100);
      
      expect(validator.validate(100)).toEqual({ success: true, data: 100 });
      expect(validator.validate(99.99)).toEqual({ success: true, data: 99.99 });
      expect(validator.validate(50)).toEqual({ success: true, data: 50 });
      expect(validator.validate(0)).toEqual({ success: true, data: 0 });
      expect(validator.validate(-100)).toEqual({ success: true, data: -100 });
      
      const result = validator.validate(150);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at most 100');
      
      const result2 = validator.validate(100.01);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Number must be at most 100');
    });
    
    test('should handle negative maximum values', () => {
      const validator = Schema.number().max(-5);
      
      expect(validator.validate(-5)).toEqual({ success: true, data: -5 });
      expect(validator.validate(-5.01)).toEqual({ success: true, data: -5.01 });
      expect(validator.validate(-100)).toEqual({ success: true, data: -100 });
      
      const result = validator.validate(-4.99);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at most -5');
      
      const result2 = validator.validate(0);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Number must be at most -5');
    });
  });
  
  describe('range validation', () => {
    test('should validate range correctly', () => {
      const validator = Schema.number().min(0).max(100);
      
      expect(validator.validate(0)).toEqual({ success: true, data: 0 });
      expect(validator.validate(50)).toEqual({ success: true, data: 50 });
      expect(validator.validate(100)).toEqual({ success: true, data: 100 });
      expect(validator.validate(25.5)).toEqual({ success: true, data: 25.5 });
      
      const result1 = validator.validate(-1);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Number must be at least 0');
      
      const result2 = validator.validate(101);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Number must be at most 100');
      
      const result3 = validator.validate(-0.1);
      expect(result3.success).toBe(false);
      expect(result3.error).toBe('Number must be at least 0');
      
      const result4 = validator.validate(100.1);
      expect(result4.success).toBe(false);
      expect(result4.error).toBe('Number must be at most 100');
    });
    
    test('should handle equal min and max values', () => {
      const validator = Schema.number().min(42).max(42);
      
      expect(validator.validate(42)).toEqual({ success: true, data: 42 });
      
      const result1 = validator.validate(41);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Number must be at least 42');
      
      const result2 = validator.validate(43);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Number must be at most 42');
    });
    
    test('should handle floating point precision', () => {
      const validator = Schema.number().min(0.1).max(0.3);
      
      expect(validator.validate(0.1)).toEqual({ success: true, data: 0.1 });
      expect(validator.validate(0.2)).toEqual({ success: true, data: 0.2 });
      expect(validator.validate(0.3)).toEqual({ success: true, data: 0.3 });
      
      // These should fail due to floating point precision
      const result1 = validator.validate(0.09);
      expect(result1.success).toBe(false);
      
      const result2 = validator.validate(0.31);
      expect(result2.success).toBe(false);
    });
  });
  
  describe('method chaining', () => {
    test('should support chaining min and max', () => {
      const validator = Schema.number().min(10).max(20);
      
      expect(validator.validate(15)).toEqual({ success: true, data: 15 });
      expect(validator.validate(10)).toEqual({ success: true, data: 10 });
      expect(validator.validate(20)).toEqual({ success: true, data: 20 });
      
      expect(validator.validate(5).success).toBe(false);
      expect(validator.validate(25).success).toBe(false);
    });
    
    test('should handle multiple min calls (last one wins)', () => {
      const validator = Schema.number().min(5).min(10).min(15);
      
      expect(validator.validate(15)).toEqual({ success: true, data: 15 });
      expect(validator.validate(20)).toEqual({ success: true, data: 20 });
      
      const result = validator.validate(10);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at least 15');
    });
    
    test('should handle multiple max calls (last one wins)', () => {
      const validator = Schema.number().max(100).max(50).max(25);
      
      expect(validator.validate(25)).toEqual({ success: true, data: 25 });
      expect(validator.validate(10)).toEqual({ success: true, data: 10 });
      
      const result = validator.validate(30);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at most 25');
    });
  });
  
  describe('custom error messages', () => {
    test('should use custom error message for type validation', () => {
      const validator = Schema.number().withMessage('Age must be a number');
      
      const result = validator.validate('25');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Age must be a number');
    });
    
    test('should use custom error message for range validation', () => {
      const validator = Schema.number().min(18, 'Must be 18 or older');
      
      const result = validator.validate(16);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Must be 18 or older');
    });
    
    test('should use custom error message for max validation', () => {
      const validator = Schema.number().max(100, 'Score cannot exceed 100');
      
      const result = validator.validate(150);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Score cannot exceed 100');
    });
    
    test('should use the last custom message provided in a chain', () => {
      const validator = Schema.number()
        .min(0, 'Cannot be negative')
        .max(100, 'Cannot exceed 100');
      
      // Min error
      expect(validator.validate(-1).error).toBe('Cannot be negative');
      
      // Max error
      expect(validator.validate(101).error).toBe('Cannot exceed 100');
    });
  });
  
  describe('optional numbers', () => {
    test('should handle optional numbers', () => {
      const validator = Schema.number().min(0).optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(null)).toEqual({ success: true, data: undefined });
      expect(validator.validate(5)).toEqual({ success: true, data: 5 });
      expect(validator.validate(0)).toEqual({ success: true, data: 0 });
      
      const result = validator.validate(-1);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at least 0');
    });
    
    test('should handle optional numbers with custom messages', () => {
      const validator = Schema.number().min(18, 'Age required, 18+').optional();
      
      const result = validator.validate(16);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Age required, 18+');
    });
    
    test('should handle chaining optional with constraints', () => {
      const validator = Schema.number().min(10).max(20).optional();
      
      // This should work because optional is applied to the base validator
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      
      // But this tests the constraint validation
      const result = validator.validate(5);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Number must be at least 10');
    });
  });
  
  describe('edge cases', () => {
    test('should handle very large numbers', () => {
      const validator = Schema.number();
      
      expect(validator.validate(Number.MAX_SAFE_INTEGER)).toEqual({
        success: true,
        data: Number.MAX_SAFE_INTEGER
      });
      
      expect(validator.validate(Number.MIN_SAFE_INTEGER)).toEqual({
        success: true,
        data: Number.MIN_SAFE_INTEGER
      });
    });
    
    test('should handle special numeric values', () => {
      const validator = Schema.number();
      
      // Epsilon is a valid, finite number
      expect(validator.validate(Number.EPSILON)).toEqual({
        success: true,
        data: Number.EPSILON
      });
      
      // Infinity should be rejected
      const resultInfinity = validator.validate(Number.POSITIVE_INFINITY);
      expect(resultInfinity.success).toBe(false);
      expect(resultInfinity.error).toBe('Value must be a valid number');

      // -Infinity should be rejected
      const resultNegInfinity = validator.validate(Number.NEGATIVE_INFINITY);
      expect(resultNegInfinity.success).toBe(false);
      expect(resultNegInfinity.error).toBe('Value must be a valid number');
    });
    
    test('should handle numbers from different sources', () => {
      const validator = Schema.number();
      
      // Numbers from different constructors/operations
      expect(validator.validate(parseInt('42'))).toEqual({ success: true, data: 42 });
      expect(validator.validate(parseFloat('3.14'))).toEqual({ success: true, data: 3.14 });
      expect(validator.validate(Math.PI)).toEqual({ success: true, data: Math.PI });
      expect(validator.validate(Math.sqrt(16))).toEqual({ success: true, data: 4 });
      expect(validator.validate(1 + 1)).toEqual({ success: true, data: 2 });
      
      // But NaN from parsing should fail
      const result = validator.validate(parseInt('abc'));
      expect(result.success).toBe(false);
      expect(result.error).toBe('Value must be a valid number');
    });
    
    test('should maintain precision in validation results', () => {
      const validator = Schema.number();
      
      const preciseNumber = 0.1 + 0.2; // This is actually 0.30000000000000004
      const result = validator.validate(preciseNumber);
      expect(result.success).toBe(true);
      expect(result.data).toBe(preciseNumber);
      expect(result.data).not.toBe(0.3); // Should preserve the actual floating point result
    });
  });
}); 