import { Schema } from '../src/schema';

describe('ArrayValidator', () => {
  describe('Basic array validation', () => {
    const validator = Schema.array(Schema.string());
    
    test('should validate arrays with valid items', () => {
      expect(validator.validate([])).toEqual({ success: true, data: [] });
      expect(validator.validate(['a'])).toEqual({ success: true, data: ['a'] });
      expect(validator.validate(['hello', 'world'])).toEqual({ 
        success: true, 
        data: ['hello', 'world'] 
      });
    });
    
    test('should reject non-array types', () => {
      const testCases = ['string', 123, true, {}, null, undefined, Symbol('test')];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be an array');
      });
    });
    
    test('should validate array items individually', () => {
      const result = validator.validate(['valid', 123, 'also valid']);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ '1': 'Value must be a string' });
      
      const result2 = validator.validate(['valid', true, 'also valid']);
      expect(result2.success).toBe(false);
      expect(result2.error).toEqual({ '1': 'Value must be a string' });
      
      const result3 = validator.validate(['valid', 'valid', null]);
      expect(result3.success).toBe(false);
      expect(result3.error).toEqual({ '2': 'Value must be a string' });
    });
  });
  
  describe('Array length validation', () => {
    test('should validate minimum length', () => {
      const validator = Schema.array(Schema.string()).minLength(2);
      
      expect(validator.validate(['a', 'b']).success).toBe(true);
      expect(validator.validate(['a', 'b', 'c']).success).toBe(true);
      
      const result1 = validator.validate([]);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Array must contain at least 2 items');
      
      const result2 = validator.validate(['a']);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Array must contain at least 2 items');
    });
    
    test('should validate maximum length', () => {
      const validator = Schema.array(Schema.string()).maxLength(2);
      
      expect(validator.validate([]).success).toBe(true);
      expect(validator.validate(['a']).success).toBe(true);
      expect(validator.validate(['a', 'b']).success).toBe(true);
      
      const result = validator.validate(['a', 'b', 'c']);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Array must contain at most 2 items');
      
      const result2 = validator.validate(new Array(10).fill('test'));
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Array must contain at most 2 items');
    });
    
    test('should validate exact length range', () => {
      const validator = Schema.array(Schema.string()).minLength(1).maxLength(3);
      
      expect(validator.validate(['a']).success).toBe(true);
      expect(validator.validate(['a', 'b']).success).toBe(true);
      expect(validator.validate(['a', 'b', 'c']).success).toBe(true);
      
      expect(validator.validate([]).success).toBe(false);
      expect(validator.validate(['a', 'b', 'c', 'd']).success).toBe(false);
    });
    
    test('should handle zero-length requirements', () => {
      const validator = Schema.array(Schema.string()).maxLength(0);
      
      expect(validator.validate([])).toEqual({ success: true, data: [] });
      
      const result = validator.validate(['a']);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Array must contain at most 0 items');
    });
  });
  
  describe('Complex array validation', () => {
    test('should validate array of numbers with constraints', () => {
      const validator = Schema.array(Schema.number().min(0).max(100));
      
      expect(validator.validate([0, 50, 100]).success).toBe(true);
      expect(validator.validate([]).success).toBe(true);
      
      const result1 = validator.validate([50, -1, 75]);
      expect(result1.success).toBe(false);
      expect(result1.error).toEqual({ '1': 'Number must be at least 0' });
      
      const result2 = validator.validate([50, 150, 75]);
      expect(result2.success).toBe(false);
      expect(result2.error).toEqual({ '1': 'Number must be at most 100' });
    });
    
    test('should validate array of objects', () => {
      const itemValidator = Schema.object({
        id: Schema.string(),
        name: Schema.string().minLength(1),
        score: Schema.number().min(0).max(100)
      });
      const validator = Schema.array(itemValidator);
      
      const validData = [
        { id: '1', name: 'Alice', score: 85 },
        { id: '2', name: 'Bob', score: 92 }
      ];
      expect(validator.validate(validData).success).toBe(true);
      
      const invalidData = [
        { id: '1', name: 'Alice', score: 85 },
        { id: 2, name: 'Bob', score: 92 } // id should be string
      ];
      const result = validator.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ '1': { id: 'Value must be a string' } });
    });
    
    test('should validate nested arrays', () => {
      const validator = Schema.array(Schema.array(Schema.string()));
      
      const validData = [
        ['a', 'b'],
        ['c', 'd', 'e'],
        []
      ];
      expect(validator.validate(validData).success).toBe(true);
      
      const invalidData = [
        ['a', 'b'],
        ['c', 123, 'e'] // number in inner array
      ];
      const result = validator.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ '1': { '1': 'Value must be a string' } });
    });
    
    test('should validate arrays with optional item constraints', () => {
      const validator = Schema.array(Schema.string().minLength(2).optional());
      
      // This should work because array items are optional strings
      expect(validator.validate([]).success).toBe(true);
      expect(validator.validate(['hello', 'world']).success).toBe(true);
      
      // But invalid strings should still fail
      const result = validator.validate(['valid', 'x']); // 'x' too short
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ '1': 'String must be at least 2 characters long' });
    });
  });
  
  describe('Array error handling', () => {
    test('should provide detailed error information', () => {
      const validator = Schema.array(Schema.number().min(0));
      
      const result = validator.validate([1, 2, -3, 4, -5]);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({
        '2': 'Number must be at least 0',
        '4': 'Number must be at least 0'
      });
    });
    
    test('should handle custom error messages', () => {
      const typeValidator = Schema.array(Schema.string()).withMessage("Must be an array of strings");
      const lengthValidator = Schema.array(Schema.string()).minLength(1, 'Tags are required');
      
      const result1 = typeValidator.validate('not array');
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Must be an array of strings');
      
      const result2 = lengthValidator.validate([]);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Tags are required');
    });
  });
  
  describe('Optional arrays', () => {
    test('should handle optional arrays', () => {
      const validator = Schema.array(Schema.string()).optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(null)).toEqual({ success: true, data: undefined });
      expect(validator.validate(['a', 'b']).success).toBe(true);
      
      // Should still validate array contents when provided
      const result = validator.validate([123]);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ '0': 'Value must be a string' });
    });
  });
});

describe('ObjectValidator', () => {
  describe('Basic object validation', () => {
    const schema = {
      name: Schema.string(),
      age: Schema.number(),
      active: Schema.boolean()
    };
    const validator = Schema.object(schema);
    
    test('should validate valid objects', () => {
      const validData = { name: 'John', age: 30, active: true };
      expect(validator.validate(validData)).toEqual({
        success: true,
        data: validData
      });
    });
    
    test('should reject non-object types', () => {
      const testCases = ['string', 123, true, [], null, undefined, Symbol('test')];
      
      testCases.forEach(testCase => {
        const result = validator.validate(testCase);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Value must be an object');
      });
    });
    
    test('should validate individual object fields', () => {
      const invalidData1 = { name: 123, age: 30, active: true };
      const result1 = validator.validate(invalidData1);
      expect(result1.success).toBe(false);
      expect(result1.error).toEqual({ name: 'Value must be a string' });
      
      const invalidData2 = { name: 'John', age: '30', active: true };
      const result2 = validator.validate(invalidData2);
      expect(result2.success).toBe(false);
      expect(result2.error).toEqual({ age: 'Value must be a valid number' });
      
      const invalidData3 = { name: 'John', age: 30, active: 'yes' };
      const result3 = validator.validate(invalidData3);
      expect(result3.success).toBe(false);
      expect(result3.error).toEqual({ active: 'Value must be a boolean' });
    });
    
    test('should handle missing required fields', () => {
      const incompleteData1 = { name: 'John', age: 30 }; // missing active
      const result1 = validator.validate(incompleteData1);
      expect(result1.success).toBe(false);
      expect(result1.error).toEqual({ active: 'Value must be a boolean' });
      
      const incompleteData2 = { active: true }; // missing name and age
      const result2 = validator.validate(incompleteData2);
      expect(result2.success).toBe(false);
      expect(result2.error).toEqual({
        name: 'Value must be a string',
        age: 'Value must be a valid number'
      });
    });
    
    test('should ignore extra fields', () => {
      const dataWithExtra = { 
        name: 'John', 
        age: 30, 
        active: true, 
        extra: 'ignored',
        another: 123
      };
      const result = validator.validate(dataWithExtra);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30, active: true });
      expect(result.data).not.toHaveProperty('extra');
      expect(result.data).not.toHaveProperty('another');
    });
  });
  
  describe('Nested object validation', () => {
    test('should validate simple nested objects', () => {
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
      
      const result = personSchema.validate(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });
    
    test('should validate deeply nested objects', () => {
      const deepSchema = Schema.object({
        level1: Schema.object({
          level2: Schema.object({
            level3: Schema.object({
              level4: Schema.string()
            })
          })
        })
      });
      
      const validData = {
        level1: {
          level2: {
            level3: {
              level4: 'deep value'
            }
          }
        }
      };
      
      expect(deepSchema.validate(validData).success).toBe(true);
      
      const invalidData = {
        level1: {
          level2: {
            level3: {
              level4: 123 // should be string
            }
          }
        }
      };
      
      const result = deepSchema.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({
        level1: { level2: { level3: { level4: 'Value must be a string' } } }
      });
    });
    
    test('should handle nested validation errors', () => {
      const personSchema = Schema.object({
        name: Schema.string(),
        address: Schema.object({
          city: Schema.string(),
          zipCode: Schema.string().pattern(/^\d{5}$/)
        })
      });
      
      const invalidData = { name: 'John', address: { city: 'Anytown', zipCode: '123' } };
      const result = personSchema.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ address: { zipCode: 'String does not match required pattern' } });
    });
  });
  
  describe('Optional fields in objects', () => {
    test('should handle optional fields correctly', () => {
      const schema = Schema.object({
        name: Schema.string(),
        age: Schema.number().optional(),
        email: Schema.string().optional(),
        phone: Schema.string().optional()
      });
      
      // All fields present
      const result1 = schema.validate({
        name: 'John',
        age: 30,
        email: 'john@example.com',
        phone: '555-1234'
      });
      expect(result1.success).toBe(true);
      
      // Only required field present
      const result2 = schema.validate({ name: 'John' });
      expect(result2.success).toBe(true);
      expect(result2.data).toEqual({ name: 'John' });
      
      // Some optional fields present
      const result3 = schema.validate({
        name: 'John',
        age: 30,
        email: 'john@example.com'
      });
      expect(result3.success).toBe(true);
      expect(result3.data).toEqual({
        name: 'John',
        age: 30,
        email: 'john@example.com'
      });
      
      // Optional field with invalid value
      const result4 = schema.validate({
        name: 'John',
        age: 'invalid', // should be number
      });
      expect(result4.success).toBe(false);
      expect(result4.error).toEqual({ age: 'Value must be a valid number' });
    });
    
    test('should not include undefined optional fields in result', () => {
      const schema = Schema.object({
        name: Schema.string(),
        age: Schema.number().optional()
      });
      
      const result = schema.validate({ name: 'John', age: undefined });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John' });
      expect(result.data).not.toHaveProperty('age');
    });
  });
  
  describe('Object with arrays and complex validation', () => {
    test('should validate objects containing arrays', () => {
      const userSchema = Schema.object({
        name: Schema.string(),
        tags: Schema.array(Schema.string()),
        scores: Schema.array(Schema.number().min(0).max(100))
      });
      
      const validData = {
        name: 'John',
        tags: ['developer', 'typescript'],
        scores: [85, 92, 78]
      };
      
      expect(userSchema.validate(validData).success).toBe(true);
      
      const invalidData = {
        name: 'John',
        tags: ['developer', 123], // invalid tag
        scores: [85, 92, 78]
      };
      
      const result = userSchema.validate(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ tags: { '1': 'Value must be a string' } });
    });
    
    test('should validate objects with nested arrays of objects', () => {
      const itemSchema = Schema.object({
        id: Schema.string(),
        name: Schema.string(),
        price: Schema.number().min(0)
      });
      
      const orderSchema = Schema.object({
        orderId: Schema.string(),
        items: Schema.array(itemSchema).minLength(1),
        total: Schema.number().min(0)
      });
      
      const validOrder = {
        orderId: 'ORD123',
        items: [
          { id: 'item1', name: 'Widget', price: 19.99 },
          { id: 'item2', name: 'Gadget', price: 29.99 }
        ],
        total: 49.98
      };
      
      expect(orderSchema.validate(validOrder).success).toBe(true);
      
      const invalidOrder = {
        orderId: 'ORD123',
        items: [
          { id: 'item1', name: 'Widget', price: -19.99 } // negative price
        ],
        total: 49.98
      };
      
      const result = orderSchema.validate(invalidOrder);
      expect(result.success).toBe(false);
      expect(result.error).toEqual({ items: { '0': { price: 'Number must be at least 0' } } });
    });
  });
  
  describe('Object error handling and edge cases', () => {
    test('should handle empty object schemas', () => {
      const emptySchema = Schema.object({});
      
      expect(emptySchema.validate({}).success).toBe(true);
      expect(emptySchema.validate({ extra: 'ignored' }).success).toBe(true);
      expect(emptySchema.validate('not object').success).toBe(false);
    });
    
    test('should handle custom error messages', () => {
      const validator = Schema.object({ name: Schema.string() }).withMessage('Invalid user object');
      
      const result1 = validator.validate('not an object');
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Invalid user object');
      
      const result2 = validator.validate({ name: 123 });
      expect(result2.success).toBe(false);
      // The custom message only applies to the top-level type check.
      // Field errors will have their own messages.
      expect(result2.error).toEqual({ name: 'Value must be a string' });
    });
    
    test('should handle objects with special property names', () => {
      const schema = Schema.object({
        'special-key': Schema.string(),
        'with spaces': Schema.number(),
        '123numeric': Schema.boolean(),
        'unicode-ñäme': Schema.string()
      });
      
      const validData = {
        'special-key': 'value',
        'with spaces': 42,
        '123numeric': true,
        'unicode-ñäme': 'test'
      };
      
      expect(schema.validate(validData).success).toBe(true);
    });
    
    test('should handle circular reference objects gracefully', () => {
      const schema = Schema.object({
        name: Schema.string(),
        value: Schema.number()
      });
      
      const obj: any = { name: 'test', value: 42 };
      obj.self = obj; // Create circular reference
      
      // Should extract only the defined schema fields
      const result = schema.validate(obj);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'test', value: 42 });
      expect(result.data).not.toHaveProperty('self');
    });
  });
  
  describe('Optional objects', () => {
    test('should handle optional objects', () => {
      const validator = Schema.object({
        name: Schema.string()
      }).optional();
      
      expect(validator.validate(undefined)).toEqual({ success: true, data: undefined });
      expect(validator.validate(null)).toEqual({ success: true, data: undefined });
      expect(validator.validate({ name: 'John' }).success).toBe(true);
      
      // Should still validate object contents when provided
      const result = validator.validate({ name: 123 });
      expect(result.success).toBe(false);
    });
  });
}); 