import { Schema } from '../src/schema';

describe('BooleanValidator', () => {
  const validator = Schema.boolean();
  
  describe('Basic boolean validation', () => {
    test('should validate true and false', () => {
      expect(validator.validate(true)).toEqual({ success: true, data: true });
      expect(validator.validate(false)).toEqual({ success: true, data: false });
    });
    
    test('should reject truthy values that are not boolean', () => {
      const truthyValues = [1, 'true', 'yes', 'on', [], {}, 'non-empty'];
      
      truthyValues.forEach(value => {
        const result = validator.validate(value);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a boolean');
        expect(result.data).toBeUndefined();
      });
    });
    
    test('should reject falsy values that are not boolean', () => {
      const falsyValues = [0, '', 'false', 'no', 'off', null, undefined, NaN];
      
      falsyValues.forEach(value => {
        const result = validator.validate(value);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a boolean');
        expect(result.data).toBeUndefined();
      });
    });
    
    test('should reject object and array types', () => {
      const complexTypes = [{}, [], new Date(), /regex/, () => {}, Symbol('test')];
      
      complexTypes.forEach(value => {
        const result = validator.validate(value);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a boolean');
      });
    });
  });
  
  describe('Boolean with custom error messages', () => {
    test('should use custom error message', () => {
      const customValidator = Schema.boolean().withMessage('Please select yes or no');
      
      const result1 = customValidator.validate('yes');
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Please select yes or no');
      
      const result2 = customValidator.validate(1);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Please select yes or no');
      
      // Should still work for valid booleans
      expect(customValidator.validate(true)).toEqual({ success: true, data: true });
      expect(customValidator.validate(false)).toEqual({ success: true, data: false });
    });
    
    test('should handle method chaining with custom messages', () => {
      const validator = Schema.boolean().withMessage('Custom error').withMessage('Newer error');
      
      const result = validator.validate('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Newer error');
    });
  });
  
  describe('Optional boolean validation', () => {
    test('should handle undefined and null for optional booleans', () => {
      const optionalValidator = Schema.boolean().optional();
      
      expect(optionalValidator.validate(undefined)).toEqual({ 
        success: true, 
        data: undefined 
      });
      expect(optionalValidator.validate(null)).toEqual({ 
        success: true, 
        data: undefined 
      });
    });
    
    test('should validate provided boolean values for optional', () => {
      const optionalValidator = Schema.boolean().optional();
      
      expect(optionalValidator.validate(true)).toEqual({ success: true, data: true });
      expect(optionalValidator.validate(false)).toEqual({ success: true, data: false });
    });
    
    test('should reject invalid values for optional booleans', () => {
      const optionalValidator = Schema.boolean().optional();
      
      const result = optionalValidator.validate('yes');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Value must be a boolean');
    });
    
    test('should work with custom messages for optional booleans', () => {
      const validator = Schema.boolean().withMessage('Invalid choice').optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(true)).toEqual({ success: true, data: true });
      
      const result = validator.validate('maybe');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid choice');
    });
  });
  
  describe('Boolean edge cases', () => {
    test('should handle Boolean object instances', () => {
      // eslint-disable-next-line no-new-wrappers
      const booleanObject = new Boolean(true);
      const result = validator.validate(booleanObject);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Value must be a boolean');
    });
    
    test('should maintain strict boolean checking', () => {
      // These should all pass because they return primitive booleans
      const booleanValues = [
        Boolean(1),     // function call returns primitive true
        Boolean(0),     // function call returns primitive false
        !!1,           // double negation
        Boolean('yes') // Boolean constructor with string
      ];
      
      // These should pass because they return primitive booleans
      booleanValues.forEach(value => {
        const result = validator.validate(value);
        expect(result.success).toBe(true);
        expect(typeof result.data).toBe('boolean');
      });
    });
  });
}); 