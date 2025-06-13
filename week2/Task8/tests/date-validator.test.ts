import { Schema } from '../src/schema';

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
      expect(validator.validate(new Date('2024-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2023-12-31')).success).toBe(true);
      
      // Invalid dates (after max)
      const result1 = validator.validate(new Date('2025-01-01'));
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Date must be before');
      expect(result1.error).toContain(maxDate.toISOString());
      
      const result2 = validator.validate(new Date('2026-01-01'));
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Date must be before');
    });
    
    test('should validate date range (min and max)', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-01-31');
      const validator = Schema.date().min(minDate).max(maxDate);
      
      // Valid dates
      expect(validator.validate(new Date('2024-01-15')).success).toBe(true);
      expect(validator.validate(new Date('2024-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2024-01-31')).success).toBe(true);
      
      // Invalid dates
      expect(validator.validate(new Date('2023-12-31')).success).toBe(false);
      expect(validator.validate(new Date('2024-02-01')).success).toBe(false);
    });
    
    test('should handle invalid date range (min > max)', () => {
      const minDate = new Date('2025-01-01');
      const maxDate = new Date('2024-01-01');
      
      // The validator should throw an error upon creation
      expect(() => Schema.date().min(minDate).max(maxDate)).toThrow('Min date cannot be after max date');
    });
    
    test('should use custom messages for range validation', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-01-31');
      
      const validator = Schema.date()
        .min(minDate, 'Date must be in January 2024')
        .max(maxDate, 'Date cannot be after January 2024');
        
      const result1 = validator.validate(new Date('2023-12-31'));
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Date must be in January 2024');
      
      const result2 = validator.validate(new Date('2024-02-01'));
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Date cannot be after January 2024');
    });
  });
  
  describe('Optional date validation', () => {
    test('should handle undefined and null for optional dates', () => {
      const optionalValidator = Schema.date().optional();
      
      expect(optionalValidator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(optionalValidator.validate(null)).toEqual({ success: true, data: undefined });
    });
    
    test('should reject invalid values for optional dates', () => {
      const optionalValidator = Schema.date().optional();
      const result = optionalValidator.validate('not a date');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Value must be a valid date');
    });
    
    test('should still validate date ranges for optional dates', () => {
      const minDate = new Date('2024-01-01');
      const validator = Schema.date().min(minDate).optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(new Date('2024-01-15'))).toEqual({ success: true, data: new Date('2024-01-15') });
      expect(validator.validate(new Date('2023-12-31')).success).toBe(false);
    });
  });
}); 