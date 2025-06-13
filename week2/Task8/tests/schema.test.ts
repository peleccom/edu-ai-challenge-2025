import { Schema } from '../src/index';

describe('Type-Safe Validation Library', () => {
  // ==========================================
  // STRING VALIDATOR TESTS
  // ==========================================

  describe('StringValidator', () => {
    describe('Basic string validation', () => {
      const validator = Schema.string();

      test('should validate valid strings', () => {
        expect(validator.validate('hello')).toEqual({
          success: true,
          data: 'hello',
        });
        expect(validator.validate('')).toEqual({
          success: true,
          data: '',
        });
        expect(validator.validate('with spaces')).toEqual({
          success: true,
          data: 'with spaces',
        });
      });

      test('should reject non-string types', () => {
        const testCases = [123, true, false, {}, [], null, undefined, NaN];

        testCases.forEach(testCase => {
          const result = validator.validate(testCase);
          expect(result.success).toBe(false);
          expect(result.error).toBe('Value must be a string');
        });
      });
    });

    describe('minLength validation', () => {
      test('should validate minimum length correctly', () => {
        const validator = Schema.string().minLength(3);

        expect(validator.validate('abc')).toEqual({
          success: true,
          data: 'abc',
        });
        expect(validator.validate('abcd')).toEqual({
          success: true,
          data: 'abcd',
        });

        const result = validator.validate('ab');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String must be at least 3 characters long');
      });

      test('should handle edge cases', () => {
        const validator = Schema.string().minLength(0);
        expect(validator.validate('')).toEqual({
          success: true,
          data: '',
        });

        const validator1 = Schema.string().minLength(1);
        const result = validator1.validate('');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String must be at least 1 characters long');
      });
    });

    describe('maxLength validation', () => {
      test('should validate maximum length correctly', () => {
        const validator = Schema.string().maxLength(5);

        expect(validator.validate('abc')).toEqual({
          success: true,
          data: 'abc',
        });
        expect(validator.validate('abcde')).toEqual({
          success: true,
          data: 'abcde',
        });

        const result = validator.validate('abcdef');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String must be at most 5 characters long');
      });
    });

    describe('pattern validation', () => {
      test('should validate email pattern', () => {
        const emailValidator = Schema.string().pattern(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        );

        expect(emailValidator.validate('user@example.com')).toEqual({
          success: true,
          data: 'user@example.com',
        });
        expect(
          emailValidator.validate('test.email+tag@domain.co.uk'),
        ).toEqual({
          success: true,
          data: 'test.email+tag@domain.co.uk',
        });

        const invalidEmails = [
          'invalid',
          'user@',
          '@domain.com',
          'user@domain',
          'user @domain.com',
        ];
        invalidEmails.forEach(email => {
          const result = emailValidator.validate(email);
          expect(result.success).toBe(false);
          expect(result.error).toBe('String does not match required pattern');
        });
      });

      test('should validate numeric pattern', () => {
        const numericValidator = Schema.string().pattern(/^\d+$/);

        expect(numericValidator.validate('123')).toEqual({
          success: true,
          data: '123',
        });

        const result = numericValidator.validate('12a3');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String does not match required pattern');
      });
    });

    describe('method chaining', () => {
      test('should support chaining multiple constraints', () => {
        const validator = Schema.string()
          .minLength(3)
          .maxLength(10)
          .pattern(/^[a-zA-Z]+$/);

        expect(validator.validate('hello')).toEqual({
          success: true,
          data: 'hello',
        });

        // Test each constraint failure
        expect(validator.validate('hi').error).toBe(
          'String must be at least 3 characters long',
        );
        expect(validator.validate('verylongstring').error).toBe(
          'String must be at most 10 characters long',
        );
        expect(validator.validate('hello123').error).toBe(
          'String does not match required pattern',
        );
      });
    });

    describe('custom error messages', () => {
      test('should use custom error message for base type', () => {
        const validator = Schema.string().withMessage('Must be a string, dude.');
        const result = validator.validate(123);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Must be a string, dude.');
      });

      test('should use custom error message for rule', () => {
        const validator = Schema.string().minLength(5, 'Name is too short!');

        const result = validator.validate('hi');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Name is too short!');
      });
    });

    describe('optional strings', () => {
      const validator = Schema.string().minLength(3).optional();

      test('should allow undefined and null', () => {
        expect(validator.validate(undefined)).toEqual({
          success: true,
          data: undefined,
        });

        expect(validator.validate(null)).toEqual({
          success: true,
          data: undefined,
        });
      });

      test('should still validate strings correctly', () => {
        expect(validator.validate('hello')).toEqual({
          success: true,
          data: 'hello',
        });

        const result = validator.validate('hi');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String must be at least 3 characters long');
      });

      test('should reject other invalid types', () => {
        const testCases = [123, true, false, {}, [], NaN];
        testCases.forEach(testCase => {
          const result = validator.validate(testCase);
          expect(result.success).toBe(false);
          expect(result.error).toBe('Value must be a string');
        });
      });
    });
  });
}); 