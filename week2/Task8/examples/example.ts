import { Schema } from '../src/index';

/**
 * Example demonstrating various validation patterns
 */

console.log('🔍 Type-Safe Validation Library - Usage Examples\n');

// 1. Basic string validation
console.log('1. String Validation:');
const nameValidator = Schema.string().minLength(2).maxLength(30);
console.log('Valid name:', nameValidator.validate('John Doe'));
console.log('Invalid name:', nameValidator.validate('J'));
console.log('');

// 2. Email validation with pattern
console.log('2. Email Validation:');
const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please provide a valid email address');

console.log('Valid email:', emailValidator.validate('user@example.com'));
console.log('Invalid email:', emailValidator.validate('not-an-email'));
console.log('');

// 3. Number validation with range
console.log('3. Number Validation:');
const ageValidator = Schema.number().min(0).max(150);
console.log('Valid age:', ageValidator.validate(25));
console.log('Invalid age:', ageValidator.validate(-5));
console.log('');

// 4. Array validation
console.log('4. Array Validation:');
const skillsValidator = Schema.array(Schema.string()).minLength(1).maxLength(5);
console.log('Valid skills:', skillsValidator.validate(['JavaScript', 'TypeScript']));
console.log('Invalid skills (empty):', skillsValidator.validate([]));
console.log('');

// 5. Complex object validation
console.log('5. Complex Object Validation:');

// Define nested schemas
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  zipCode: Schema.string().pattern(/^\d{5}$/),
  country: Schema.string()
});

const personSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(0).optional(),
  isActive: Schema.boolean(),
  skills: Schema.array(Schema.string()),
  address: addressSchema.optional()
});

// Test with valid data
const validPerson = {
  id: 'user123',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  age: 28,
  isActive: true,
  skills: ['React', 'Node.js', 'TypeScript'],
  address: {
    street: '123 Tech Street',
    city: 'San Francisco',
    zipCode: '94105',
    country: 'USA'
  }
};

console.log('Valid person:', personSchema.validate(validPerson));
console.log('');

// Test with invalid data
const invalidPerson = {
  id: 123, // Should be string
  name: 'B', // Too short
  email: 'invalid-email',
  isActive: 'yes', // Should be boolean
  skills: ['React', 123], // Contains non-string
  address: {
    street: '123 Tech Street',
    city: 'San Francisco',
    zipCode: '941', // Invalid zip code
    country: 'USA'
  }
};

console.log('Invalid person:', personSchema.validate(invalidPerson));
console.log('');

// 6. Optional fields demonstration
console.log('6. Optional Fields:');
const profileSchema = Schema.object({
  username: Schema.string(),
  bio: Schema.string().optional(),
  website: Schema.string().pattern(/^https?:\/\//).optional()
});

console.log('Profile with optional fields:', profileSchema.validate({
  username: 'johndoe'
  // bio and website are optional
}));

console.log('Profile with all fields:', profileSchema.validate({
  username: 'johndoe',
  bio: 'Software developer',
  website: 'https://johndoe.dev'
}));
console.log('');

// 7. Date validation
console.log('7. Date Validation:');
const eventDateValidator = Schema.date()
  .min(new Date('2024-01-01'))
  .max(new Date('2025-12-31'));

console.log('Valid date:', eventDateValidator.validate(new Date('2024-06-15')));
console.log('Invalid date (too early):', eventDateValidator.validate(new Date('2023-12-31')));
console.log('');

// 8. Custom error messages
console.log('8. Custom Error Messages:');
const passwordValidator = Schema.string()
  .minLength(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .withMessage('Password must be at least 8 characters long and contain lowercase, uppercase, number, and special character');

console.log('Weak password:', passwordValidator.validate('123'));
console.log('Strong password:', passwordValidator.validate('MyP@ssw0rd'));
console.log('');

console.log('✅ All examples completed!'); 