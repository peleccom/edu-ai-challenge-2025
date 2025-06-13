import { Schema, ValidationResult, Validator } from '../src/schema';

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
          data: 'hello'
        });
        expect(validator.validate('')).toEqual({
          success: true,
          data: ''
        });
        expect(validator.validate('with spaces')).toEqual({
          success: true,
          data: 'with spaces'
        });
      });
      
      test('should reject non-string types', () => {
        const testCases = [123, true, false, {}, [], null, undefined];
        
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
          data: 'abc'
        });
        expect(validator.validate('abcd')).toEqual({
          success: true,
          data: 'abcd'
        });
        
        const result = validator.validate('ab');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String must be at least 3 characters long');
      });
      
      test('should handle edge cases', () => {
        const validator = Schema.string().minLength(0);
        expect(validator.validate('')).toEqual({
          success: true,
          data: ''
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
          data: 'abc'
        });
        expect(validator.validate('abcde')).toEqual({
          success: true,
          data: 'abcde'
        });
        
        const result = validator.validate('abcdef');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String must be at most 5 characters long');
      });
    });
    
    describe('pattern validation', () => {
      test('should validate email pattern', () => {
        const emailValidator = Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        
        expect(emailValidator.validate('user@example.com')).toEqual({
          success: true,
          data: 'user@example.com'
        });
        expect(emailValidator.validate('test.email+tag@domain.co.uk')).toEqual({
          success: true,
          data: 'test.email+tag@domain.co.uk'
        });
        
        const invalidEmails = ['invalid', 'user@', '@domain.com', 'user@domain', 'user @domain.com'];
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
          data: '123'
        });
        
        const result = numericValidator.validate('12a3');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String does not match required pattern');
      });
    });
    
    describe('method chaining', () => {
      test('should support chaining multiple constraints', () => {
        const validator = Schema.string().minLength(3).maxLength(10).pattern(/^[a-zA-Z]+$/);
        
        expect(validator.validate('hello')).toEqual({
          success: true,
          data: 'hello'
        });
        
        // Test each constraint failure
        expect(validator.validate('hi').success).toBe(false); // too short
        expect(validator.validate('verylongstring').success).toBe(false); // too long
        expect(validator.validate('hello123').success).toBe(false); // invalid pattern
      });
    });
    
    describe('custom error messages', () => {
      test('should use custom error message', () => {
        const validator = Schema.string().minLength(5).withMessage('Name is too short!');
        
        const result = validator.validate('hi');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Name is too short!');
      });
    });
    
    describe('optional strings', () => {
      test('should handle optional strings', () => {
        const validator = Schema.string().minLength(3).optional();
        
        expect(validator.validate(undefined)).toEqual({
          success: true,
          data: undefined
        });
        expect(validator.validate(null)).toEqual({
          success: true,
          data: undefined
        });
        expect(validator.validate('hello')).toEqual({
          success: true,
          data: 'hello'
        });
        
        const result = validator.validate('hi');
        expect(result.success).toBe(false);
        expect(result.error).toBe('String must be at least 3 characters long');
      });
    });
  });
  
  // ==========================================
  // NUMBER VALIDATOR TESTS
  // ==========================================
  
  describe('NumberValidator', () => {
    describe('Basic number validation', () => {
      const validator = Schema.number();
      
      test('should validate valid numbers', () => {
        expect(validator.validate(0)).toEqual({ success: true, data: 0 });
        expect(validator.validate(123)).toEqual({ success: true, data: 123 });
        expect(validator.validate(-456)).toEqual({ success: true, data: -456 });
        expect(validator.validate(3.14)).toEqual({ success: true, data: 3.14 });
        expect(validator.validate(-0)).toEqual({ success: true, data: -0 });
      });
      
      test('should reject NaN', () => {
        const result = validator.validate(NaN);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a valid number');
      });
      
      test('should handle Infinity', () => {
        expect(validator.validate(Infinity)).toEqual({ success: true, data: Infinity });
        expect(validator.validate(-Infinity)).toEqual({ success: true, data: -Infinity });
      });
      
      test('should reject non-number types', () => {
        const testCases = ['123', true, false, {}, [], null, undefined];
        
        testCases.forEach(testCase => {
          const result = validator.validate(testCase);
          expect(result.success).toBe(false);
          expect(result.error).toBe('Value must be a valid number');
        });
      });
    });
    
    describe('min validation', () => {
      test('should validate minimum value correctly', () => {
        const validator = Schema.number().min(10);
        
        expect(validator.validate(10)).toEqual({ success: true, data: 10 });
        expect(validator.validate(15)).toEqual({ success: true, data: 15 });
        
        const result = validator.validate(5);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Number must be at least 10');
      });
      
      test('should handle negative minimum values', () => {
        const validator = Schema.number().min(-5);
        
        expect(validator.validate(-5)).toEqual({ success: true, data: -5 });
        expect(validator.validate(0)).toEqual({ success: true, data: 0 });
        
        const result = validator.validate(-10);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Number must be at least -5');
      });
    });
    
    describe('max validation', () => {
      test('should validate maximum value correctly', () => {
        const validator = Schema.number().max(100);
        
        expect(validator.validate(100)).toEqual({ success: true, data: 100 });
        expect(validator.validate(50)).toEqual({ success: true, data: 50 });
        
        const result = validator.validate(150);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Number must be at most 100');
      });
    });
    
    describe('range validation', () => {
      test('should validate range correctly', () => {
        const validator = Schema.number().min(0).max(100);
        
        expect(validator.validate(0)).toEqual({ success: true, data: 0 });
        expect(validator.validate(50)).toEqual({ success: true, data: 50 });
        expect(validator.validate(100)).toEqual({ success: true, data: 100 });
        
        expect(validator.validate(-1).success).toBe(false);
        expect(validator.validate(101).success).toBe(false);
      });
    });
    
    describe('custom error messages', () => {
      test('should use custom error message', () => {
        const validator = Schema.number().min(18).withMessage('Must be 18 or older');
        
        const result = validator.validate(16);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Must be 18 or older');
      });
    });
    
    describe('optional numbers', () => {
      test('should handle optional numbers', () => {
        const validator = Schema.number().min(0).optional();
        
        expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
        expect(validator.validate(null)).toEqual({ success: true, data: undefined });
        expect(validator.validate(5)).toEqual({ success: true, data: 5 });
        
        const result = validator.validate(-1);
        expect(result.success).toBe(false);
      });
    });
  });
  
  // ==========================================
  // BOOLEAN VALIDATOR TESTS
  // ==========================================
  
  describe('BooleanValidator', () => {
    const validator = Schema.boolean();
    
    test('should validate valid booleans', () => {
      expect(validator.validate(true)).toEqual({ success: true, data: true });
      expect(validator.validate(false)).toEqual({ success: true, data: false });
    });
    
    test('should reject non-boolean types', () => {
      const testCases = [0, 1, 'true', 'false', '', 'yes', 'no', {}, [], null, undefined];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a boolean');
      });
    });
    
    test('should support custom error messages', () => {
      const customValidator = Schema.boolean().withMessage('Please select yes or no');
      
      const result = customValidator.validate('yes');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Please select yes or no');
    });
    
    test('should handle optional booleans', () => {
      const optionalValidator = Schema.boolean().optional();
      
      expect(optionalValidator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(optionalValidator.validate(null)).toEqual({ success: true, data: undefined });
      expect(optionalValidator.validate(true)).toEqual({ success: true, data: true });
      expect(optionalValidator.validate(false)).toEqual({ success: true, data: false });
    });
  });
  
  // ==========================================
  // DATE VALIDATOR TESTS
  // ==========================================
  
  describe('DateValidator', () => {
    const validator = Schema.date();
    
    test('should validate valid Date objects', () => {
      const date = new Date('2024-01-01');
      expect(validator.validate(date)).toEqual({ success: true, data: date });
      
      const now = new Date();
      expect(validator.validate(now)).toEqual({ success: true, data: now });
    });
    
    test('should validate valid date strings', () => {
      const result = validator.validate('2024-01-01');
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Date);
      expect((result.data as Date).getFullYear()).toBe(2024);
    });
    
    test('should reject invalid dates', () => {
      const invalidDates = ['invalid-date', 'not a date', '', '2024-13-01', '2024-01-32'];
      
      invalidDates.forEach(invalidDate => {
        const result = validator.validate(invalidDate);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a valid date');
      });
    });
    
    test('should reject non-date types', () => {
      const testCases = [true, {}, [], null, undefined];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be a valid date');
      });
    });
    
    describe('date range validation', () => {
      test('should validate minimum date', () => {
        const minDate = new Date('2024-01-01');
        const validator = Schema.date().min(minDate);
        
        expect(validator.validate(new Date('2024-01-01')).success).toBe(true);
        expect(validator.validate(new Date('2024-06-01')).success).toBe(true);
        
        const result = validator.validate(new Date('2023-12-31'));
        expect(result.success).toBe(false);
        expect(result.error).toContain('Date must be after');
      });
      
      test('should validate maximum date', () => {
        const maxDate = new Date('2024-12-31');
        const validator = Schema.date().max(maxDate);
        
        expect(validator.validate(new Date('2024-12-31')).success).toBe(true);
        expect(validator.validate(new Date('2024-06-01')).success).toBe(true);
        
        const result = validator.validate(new Date('2025-01-01'));
        expect(result.success).toBe(false);
        expect(result.error).toContain('Date must be before');
      });
      
      test('should validate date range', () => {
        const validator = Schema.date()
          .min(new Date('2024-01-01'))
          .max(new Date('2024-12-31'));
        
        expect(validator.validate(new Date('2024-06-15')).success).toBe(true);
        expect(validator.validate(new Date('2023-12-31')).success).toBe(false);
        expect(validator.validate(new Date('2025-01-01')).success).toBe(false);
      });
    });
    
    test('should support custom error messages', () => {
      const validator = Schema.date().withMessage('Please enter a valid birthday');
      
      const result = validator.validate('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter a valid birthday');
    });
    
    test('should handle optional dates', () => {
      const validator = Schema.date().optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(null)).toEqual({ success: true, data: undefined });
      expect(validator.validate(new Date('2024-01-01')).success).toBe(true);
    });
  });
  
  // ==========================================
  // ARRAY VALIDATOR TESTS
  // ==========================================
  
  describe('ArrayValidator', () => {
    describe('Basic array validation', () => {
      const validator = Schema.array(Schema.string());
      
      test('should validate arrays with valid items', () => {
        expect(validator.validate([])).toEqual({ success: true, data: [] });
        expect(validator.validate(['a'])).toEqual({ success: true, data: ['a'] });
        expect(validator.validate(['a', 'b', 'c'])).toEqual({ success: true, data: ['a', 'b', 'c'] });
      });
      
      test('should reject non-array types', () => {
        const testCases = ['string', 123, true, {}, null, undefined];
        
        testCases.forEach(testCase => {
          const result = validator.validate(testCase);
          expect(result.success).toBe(false);
          expect(result.error).toBe('Value must be an array');
        });
      });
      
      test('should validate array items', () => {
        const result = validator.validate(['valid', 123, 'also valid']);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Array item at index 1');
        expect(result.error).toContain('Value must be a string');
      });
    });
    
    describe('array length validation', () => {
      test('should validate minimum length', () => {
        const validator = Schema.array(Schema.string()).minLength(2);
        
        expect(validator.validate(['a', 'b']).success).toBe(true);
        expect(validator.validate(['a', 'b', 'c']).success).toBe(true);
        
        const result = validator.validate(['a']);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Array must have at least 2 items');
      });
      
      test('should validate maximum length', () => {
        const validator = Schema.array(Schema.string()).maxLength(2);
        
        expect(validator.validate([]).success).toBe(true);
        expect(validator.validate(['a']).success).toBe(true);
        expect(validator.validate(['a', 'b']).success).toBe(true);
        
        const result = validator.validate(['a', 'b', 'c']);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Array must have at most 2 items');
      });
      
      test('should validate length range', () => {
        const validator = Schema.array(Schema.string()).minLength(1).maxLength(3);
        
        expect(validator.validate(['a']).success).toBe(true);
        expect(validator.validate(['a', 'b']).success).toBe(true);
        expect(validator.validate(['a', 'b', 'c']).success).toBe(true);
        
        expect(validator.validate([]).success).toBe(false);
        expect(validator.validate(['a', 'b', 'c', 'd']).success).toBe(false);
      });
    });
    
    describe('complex array validation', () => {
      test('should validate array of numbers', () => {
        const validator = Schema.array(Schema.number().min(0));
        
        expect(validator.validate([1, 2, 3]).success).toBe(true);
        expect(validator.validate([0, 10, 100]).success).toBe(true);
        
        const result = validator.validate([1, -2, 3]);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Array item at index 1');
      });
      
      test('should validate array of objects', () => {
        const itemValidator = Schema.object({
          name: Schema.string(),
          age: Schema.number()
        });
        const validator = Schema.array(itemValidator);
        
        const validData = [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ];
        expect(validator.validate(validData).success).toBe(true);
        
        const invalidData = [
          { name: 'John', age: 30 },
          { name: 123, age: 25 } // invalid name
        ];
        const result = validator.validate(invalidData);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Array item at index 1');
      });
    });
    
    test('should support custom error messages', () => {
      const validator = Schema.array(Schema.string()).minLength(1).withMessage('Please provide at least one tag');
      
      const result = validator.validate([]);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Please provide at least one tag');
    });
    
    test('should handle optional arrays', () => {
      const validator = Schema.array(Schema.string()).optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(null)).toEqual({ success: true, data: undefined });
      expect(validator.validate(['a', 'b']).success).toBe(true);
    });
  });
  
  // ==========================================
  // OBJECT VALIDATOR TESTS
  // ==========================================
  
  describe('ObjectValidator', () => {
    describe('Basic object validation', () => {
      const schema = {
        name: Schema.string(),
        age: Schema.number()
      };
      const validator = Schema.object(schema);
      
      test('should validate valid objects', () => {
        const validData = { name: 'John', age: 30 };
        expect(validator.validate(validData)).toEqual({
          success: true,
          data: validData
        });
      });
      
      test('should reject non-object types', () => {
        const testCases = ['string', 123, true, [], null, undefined];
        
        testCases.forEach(testCase => {
          const result = validator.validate(testCase);
          expect(result.success).toBe(false);
          expect(result.error).toBe('Value must be an object');
        });
      });
      
      test('should validate object fields', () => {
        const invalidData = { name: 123, age: 30 };
        const result = validator.validate(invalidData);
        expect(result.success).toBe(false);
        expect(result.error).toContain("Object field 'name'");
        expect(result.error).toContain('Value must be a string');
      });
      
      test('should handle missing required fields', () => {
        const incompleteData = { name: 'John' }; // missing age
        const result = validator.validate(incompleteData);
        expect(result.success).toBe(false);
        expect(result.error).toContain("Object field 'age'");
      });
      
      test('should ignore extra fields', () => {
        const dataWithExtra = { name: 'John', age: 30, extra: 'ignored' };
        const result = validator.validate(dataWithExtra);
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ name: 'John', age: 30 });
      });
    });
    
    describe('nested object validation', () => {
      test('should validate nested objects', () => {
        const addressSchema = Schema.object({
          street: Schema.string(),
          city: Schema.string(),
          zipCode: Schema.string().pattern(/^\d{5}$/)
        });
        
        const personSchema = Schema.object({
          name: Schema.string(),
          address: addressSchema
        });
        
        const validData = {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            zipCode: '12345'
          }
        };
        
        expect(personSchema.validate(validData).success).toBe(true);
        
        const invalidData = {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            zipCode: '123' // invalid zip code
          }
        };
        
        const result = personSchema.validate(invalidData);
        expect(result.success).toBe(false);
        expect(result.error).toContain("Object field 'address'");
      });
    });
    
    describe('optional fields in objects', () => {
      test('should handle optional fields', () => {
        const schema = Schema.object({
          name: Schema.string(),
          age: Schema.number().optional(),
          email: Schema.string().optional()
        });
        
        // All fields present
        expect(schema.validate({
          name: 'John',
          age: 30,
          email: 'john@example.com'
        }).success).toBe(true);
        
        // Optional fields missing
        expect(schema.validate({
          name: 'John'
        }).success).toBe(true);
        
        // Some optional fields present
        expect(schema.validate({
          name: 'John',
          age: 30
        }).success).toBe(true);
      });
    });
    
    test('should support custom error messages', () => {
      const validator = Schema.object({
        name: Schema.string()
      }).withMessage('Invalid user data');
      
      const result = validator.validate('not an object');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user data');
    });
    
    test('should handle optional objects', () => {
      const validator = Schema.object({
        name: Schema.string()
      }).optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(null)).toEqual({ success: true, data: undefined });
      expect(validator.validate({ name: 'John' }).success).toBe(true);
    });
  });
  
  // ==========================================
  // INTEGRATION TESTS
  // ==========================================
  
  describe('Integration Tests', () => {
    test('should handle complex real-world schema', () => {
      const addressSchema = Schema.object({
        street: Schema.string().minLength(1),
        city: Schema.string().minLength(1),
        state: Schema.string().pattern(/^[A-Z]{2}$/),
        zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
        country: Schema.string().withMessage('Country is required')
      });
      
      const userSchema = Schema.object({
        id: Schema.string().pattern(/^[a-zA-Z0-9]+$/),
        profile: Schema.object({
          firstName: Schema.string().minLength(1).maxLength(50),
          lastName: Schema.string().minLength(1).maxLength(50),
          email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          phone: Schema.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
          birthDate: Schema.date().max(new Date()).optional()
        }),
        address: addressSchema.optional(),
        preferences: Schema.object({
          newsletter: Schema.boolean(),
          notifications: Schema.boolean(),
          theme: Schema.string().pattern(/^(light|dark)$/).optional()
        }),
        tags: Schema.array(Schema.string().minLength(1)).minLength(0).maxLength(10),
        metadata: Schema.object({}).optional()
      });
      
      const validUser = {
        id: 'user123',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-123-4567',
          birthDate: new Date('1990-01-01')
        },
        address: {
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345-6789',
          country: 'USA'
        },
        preferences: {
          newsletter: true,
          notifications: false,
          theme: 'dark'
        },
        tags: ['developer', 'javascript', 'react'],
        metadata: {}
      };
      
      const result = userSchema.validate(validUser);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
    
    test('should provide detailed error paths for nested validation failures', () => {
      const schema = Schema.object({
        user: Schema.object({
          profile: Schema.object({
            email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
          })
        })
      });
      
      const invalidData = {
        user: {
          profile: {
            email: 'invalid-email'
          }
        }
      };
      
      const result = schema.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Object field 'user'");
    });
    
    test('should handle arrays of complex objects', () => {
      const itemSchema = Schema.object({
        id: Schema.string(),
        name: Schema.string().minLength(1),
        price: Schema.number().min(0),
        categories: Schema.array(Schema.string()),
        metadata: Schema.object({
          weight: Schema.number().optional(),
          dimensions: Schema.object({
            length: Schema.number(),
            width: Schema.number(),
            height: Schema.number()
          }).optional()
        }).optional()
      });
      
      const cartSchema = Schema.object({
        items: Schema.array(itemSchema).minLength(1),
        total: Schema.number().min(0)
      });
      
      const validCart = {
        items: [
          {
            id: 'item1',
            name: 'Widget',
            price: 19.99,
            categories: ['electronics', 'gadgets'],
            metadata: {
              weight: 0.5,
              dimensions: {
                length: 10,
                width: 5,
                height: 2
              }
            }
          },
          {
            id: 'item2',
            name: 'Gadget',
            price: 29.99,
            categories: ['electronics']
          }
        ],
        total: 49.98
      };
      
      const result = cartSchema.validate(validCart);
      expect(result.success).toBe(true);
    });
  });
  
  // ==========================================
  // EDGE CASES AND ERROR HANDLING
  // ==========================================
  
  describe('Edge Cases and Error Handling', () => {
    test('should handle circular references gracefully', () => {
      const obj: any = { name: 'test' };
      obj.self = obj; // circular reference
      
      const schema = Schema.object({
        name: Schema.string()
      });
      
      // Should not cause infinite recursion
      const result = schema.validate(obj);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'test' });
    });
    
    test('should handle very large arrays', () => {
      const validator = Schema.array(Schema.number());
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      
      const result = validator.validate(largeArray);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(10000);
    });
    
    test('should handle deeply nested objects', () => {
      const deepSchema = Schema.object({
        level1: Schema.object({
          level2: Schema.object({
            level3: Schema.object({
              level4: Schema.object({
                level5: Schema.string()
              })
            })
          })
        })
      });
      
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'deep value'
              }
            }
          }
        }
      };
      
      const result = deepSchema.validate(deepObject);
      expect(result.success).toBe(true);
    });
    
    test('should handle special numeric values', () => {
      const validator = Schema.number();
      
      expect(validator.validate(Number.MAX_VALUE).success).toBe(true);
      expect(validator.validate(Number.MIN_VALUE).success).toBe(true);
      expect(validator.validate(Number.EPSILON).success).toBe(true);
      expect(validator.validate(0).success).toBe(true);
      expect(validator.validate(-0).success).toBe(true);
    });
    
    test('should handle special string values', () => {
      const validator = Schema.string();
      
      expect(validator.validate('').success).toBe(true);
      expect(validator.validate(' ').success).toBe(true);
      expect(validator.validate('\n\t').success).toBe(true);
      expect(validator.validate('unicode: 🚀 ñ é').success).toBe(true);
    });
  });
  
  // ==========================================
  // SCHEMA FACTORY TESTS
  // ==========================================
  
  describe('Schema Factory Methods', () => {
    test('should create correct validator instances', () => {
      expect(Schema.string()).toBeDefined();
      expect(Schema.number()).toBeDefined();
      expect(Schema.boolean()).toBeDefined();
      expect(Schema.date()).toBeDefined();
      expect(Schema.array(Schema.string())).toBeDefined();
      expect(Schema.object({})).toBeDefined();
    });
    
    test('should maintain validator independence', () => {
      const validator1 = Schema.string().minLength(5);
      const validator2 = Schema.string().minLength(10);
      
      expect(validator1.validate('hello').success).toBe(true);
      expect(validator2.validate('hello').success).toBe(false);
    });
  });
}); 