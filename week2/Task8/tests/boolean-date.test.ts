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

describe('DateValidator', () => {
  const validator = Schema.date();
  
  describe('Basic date validation', () => {
    test('should validate Date objects', () => {
      const validDates = [
        new Date(),
        new Date('2024-01-01'),
        new Date(2024, 0, 1), // January 1, 2024
        new Date(Date.now()),
        new Date('December 17, 1995 03:24:00'),
        new Date(1995, 11, 17, 3, 24, 0)
      ];
      
      validDates.forEach(date => {
        const result = validator.validate(date);
        expect(result.success).toBe(true);
        expect(result.data).toBeInstanceOf(Date);
        expect(result.data).toEqual(date);
      });
    });
    
    test('should validate and convert valid date strings', () => {
      const validDateStrings = [
        '2024-01-01',
        '2024-12-31T23:59:59.999Z',
        'January 1, 2024',
        '01/01/2024',
        '2024/01/01',
        'Mon Jan 01 2024'
      ];
      
      validDateStrings.forEach(dateString => {
        const result = validator.validate(dateString);
        expect(result.success).toBe(true);
        expect(result.data).toBeInstanceOf(Date);
        expect(isNaN((result.data as Date).getTime())).toBe(false);
      });
    });
    
    test('should reject invalid date strings', () => {
      const invalidDateStrings = [
        'invalid-date',
        'not a date',
        '',
        'abc123',
        'tomorrow',
        'yesterday'
      ];
      
      invalidDateStrings.forEach(dateString => {
        const result = validator.validate(dateString);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a valid date');
        expect(result.data).toBeUndefined();
      });
    });
    
    test('should reject non-date types', () => {
      const nonDateTypes = [
        123,
        true,
        false,
        {},
        [],
        null,
        undefined,
        Symbol('test'),
        () => {}
      ];
      
      nonDateTypes.forEach(value => {
        const result = validator.validate(value);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a valid date');
      });
    });
    
    test('should handle invalid Date objects', () => {
      const invalidDate = new Date('invalid');
      expect(isNaN(invalidDate.getTime())).toBe(true);
      
      const result = validator.validate(invalidDate);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Value must be a valid date');
    });
  });
  
  describe('Date range validation', () => {
    test('should validate minimum date', () => {
      const minDate = new Date('2024-01-01');
      const validator = Schema.date().min(minDate);
      
      // Valid dates (on or after min)
      expect(validator.validate(new Date('2024-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2024-01-02')).success).toBe(true);
      expect(validator.validate(new Date('2024-06-15')).success).toBe(true);
      expect(validator.validate(new Date('2025-01-01')).success).toBe(true);
      
      // Invalid dates (before min)
      const result1 = validator.validate(new Date('2023-12-31'));
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Date must be after');
      expect(result1.error).toContain(minDate.toISOString());
      
      const result2 = validator.validate(new Date('2023-01-01'));
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Date must be after');
    });
    
    test('should validate maximum date', () => {
      const maxDate = new Date('2024-12-31');
      const validator = Schema.date().max(maxDate);
      
      // Valid dates (on or before max)
      expect(validator.validate(new Date('2024-12-31')).success).toBe(true);
      expect(validator.validate(new Date('2024-12-30')).success).toBe(true);
      expect(validator.validate(new Date('2024-06-15')).success).toBe(true);
      expect(validator.validate(new Date('2020-01-01')).success).toBe(true);
      
      // Invalid dates (after max)
      const result1 = validator.validate(new Date('2025-01-01'));
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Date must be before');
      expect(result1.error).toContain(maxDate.toISOString());
      
      const result2 = validator.validate(new Date('2025-12-31'));
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Date must be before');
    });
    
    test('should validate date range', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-12-31');
      const validator = Schema.date().min(minDate).max(maxDate);
      
      // Valid dates (within range)
      expect(validator.validate(new Date('2024-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2024-06-15')).success).toBe(true);
      expect(validator.validate(new Date('2024-12-31')).success).toBe(true);
      
      // Invalid dates (before range)
      const result1 = validator.validate(new Date('2023-12-31'));
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Date must be after');
      
      // Invalid dates (after range)
      const result2 = validator.validate(new Date('2025-01-01'));
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Date must be before');
    });
    
    test('should handle same min and max date', () => {
      const exactDate = new Date('2024-06-15T12:00:00.000Z');
      const validator = Schema.date().min(exactDate).max(exactDate);
      
      expect(validator.validate(exactDate).success).toBe(true);
      
      const beforeDate = new Date('2024-06-15T11:59:59.999Z');
      expect(validator.validate(beforeDate).success).toBe(false);
      
      const afterDate = new Date('2024-06-15T12:00:00.001Z');
      expect(validator.validate(afterDate).success).toBe(false);
    });
    
    test('should handle method chaining with multiple constraints', () => {
      const validator = Schema.date()
        .min(new Date('2024-01-01'))
        .max(new Date('2024-12-31'))
        .min(new Date('2024-06-01')); // This should override the first min
      
      expect(validator.validate(new Date('2024-06-01')).success).toBe(true);
      expect(validator.validate(new Date('2024-08-15')).success).toBe(true);
      expect(validator.validate(new Date('2024-12-31')).success).toBe(true);
      
      // Should fail because min is now June 1st
      expect(validator.validate(new Date('2024-05-31')).success).toBe(false);
    });
  });
  
  describe('Date with custom error messages', () => {
    test('should use custom error message for type validation', () => {
      const validator = Schema.date().withMessage('Please enter a valid birthday');
      
      const result1 = validator.validate('invalid');
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Please enter a valid birthday');
      
      const result2 = validator.validate(123);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Please enter a valid birthday');
      
      // Should work for valid dates
      expect(validator.validate(new Date('2024-01-01')).success).toBe(true);
    });
    
    test('should use custom error message for range validation', () => {
      const validator = Schema.date()
        .min(new Date('2024-01-01'))
        .withMessage('Date must be in 2024 or later');
      
      const result = validator.validate(new Date('2023-12-31'));
      expect(result.success).toBe(false);
      expect(result.error).toBe('Date must be in 2024 or later');
    });
    
    test('should override all validation messages', () => {
      const validator = Schema.date()
        .min(new Date('2024-01-01'))
        .max(new Date('2024-12-31'))
        .withMessage('Invalid date provided');
      
      // Type error
      expect(validator.validate('invalid').error).toBe('Invalid date provided');
      
      // Range errors
      expect(validator.validate(new Date('2023-01-01')).error).toBe('Invalid date provided');
      expect(validator.validate(new Date('2025-01-01')).error).toBe('Invalid date provided');
    });
  });
  
  describe('Optional date validation', () => {
    test('should handle undefined and null for optional dates', () => {
      const optionalValidator = Schema.date().optional();
      
      expect(optionalValidator.validate(undefined)).toEqual({
        success: true,
        data: undefined
      });
      expect(optionalValidator.validate(null)).toEqual({
        success: true,
        data: undefined
      });
    });
    
    test('should validate provided dates for optional', () => {
      const optionalValidator = Schema.date().optional();
      
      const validDate = new Date('2024-01-01');
      expect(optionalValidator.validate(validDate)).toEqual({
        success: true,
        data: validDate
      });
      
      expect(optionalValidator.validate('2024-06-15').success).toBe(true);
    });
    
    test('should reject invalid values for optional dates', () => {
      const optionalValidator = Schema.date().optional();
      
      const result = optionalValidator.validate('invalid-date');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Value must be a valid date');
    });
    
    test('should work with range constraints for optional dates', () => {
      const validator = Schema.date()
        .min(new Date('2024-01-01'))
        .max(new Date('2024-12-31'))
        .optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(new Date('2024-06-15')).success).toBe(true);
      
      const result = validator.validate(new Date('2025-01-01'));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Date must be before');
    });
  });
  
  describe('Date edge cases', () => {
    test('should handle special date values', () => {
      const validator = Schema.date();
      
      // Unix epoch
      expect(validator.validate(new Date(0)).success).toBe(true);
      
      // Far future date
      expect(validator.validate(new Date('3024-01-01')).success).toBe(true);
      
      // Far past date
      expect(validator.validate(new Date('1024-01-01')).success).toBe(true);
    });
    
    test('should handle timezone considerations', () => {
      const validator = Schema.date();
      
      // Same moment in different timezone representations
      const utcDate = new Date('2024-01-01T00:00:00.000Z');
      const localDate = new Date('2024-01-01');
      
      expect(validator.validate(utcDate).success).toBe(true);
      expect(validator.validate(localDate).success).toBe(true);
    });
    
    test('should handle date strings with various formats', () => {
      const validator = Schema.date();
      
      const formats = [
        '2024-01-01T00:00:00.000Z',  // ISO string
        '2024-01-01T00:00:00',       // ISO without timezone
        '2024/01/01',                // US format
        '01/01/2024',                // US format
        'Jan 1, 2024',               // Long format
        'January 1, 2024',           // Full month name
        'Mon, 01 Jan 2024 00:00:00 GMT' // RFC format
      ];
      
      formats.forEach(format => {
        const result = validator.validate(format);
        expect(result.success).toBe(true);
        expect(result.data).toBeInstanceOf(Date);
      });
    });
    
    test('should preserve millisecond precision', () => {
      const validator = Schema.date();
      const preciseDate = new Date('2024-01-01T12:34:56.789Z');
      
      const result = validator.validate(preciseDate);
      expect(result.success).toBe(true);
      expect((result.data as Date).getMilliseconds()).toBe(789);
      expect(result.data).toEqual(preciseDate);
    });
  });
}); 