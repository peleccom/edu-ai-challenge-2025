/**
 * Type-Safe Validation Library
 * 
 * A comprehensive validation library that provides type-safe validators for primitive types,
 * arrays, and objects with fluent API design and customizable error messages.
 */

/**
 * Base interface for all validators
 */
interface Validator<T> {
  validate(value: unknown): ValidationResult<T>;
  optional(): OptionalValidator<T>;
  withMessage(message: string): Validator<T>;
}

/**
 * Validation result type
 */
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Optional validator wrapper
 */
class OptionalValidator<T> implements Validator<T | undefined> {
  constructor(private validator: Validator<T>) {}

  validate(value: unknown): ValidationResult<T | undefined> {
    if (value === undefined || value === null) {
      return { success: true, data: undefined };
    }
    return this.validator.validate(value);
  }

  optional(): OptionalValidator<T | undefined> {
    return this;
  }

  withMessage(message: string): Validator<T | undefined> {
    return new OptionalValidator(this.validator.withMessage(message));
  }
}

/**
 * String validator with chainable methods for validation rules
 */
class StringValidator implements Validator<string> {
  private minLen?: number;
  private maxLen?: number;
  private regex?: RegExp;
  private customMessage?: string;

  /**
   * Set minimum length requirement
   * @param length Minimum length
   * @returns StringValidator instance for chaining
   */
  minLength(length: number): StringValidator {
    this.minLen = length;
    return this;
  }

  /**
   * Set maximum length requirement
   * @param length Maximum length
   * @returns StringValidator instance for chaining
   */
  maxLength(length: number): StringValidator {
    this.maxLen = length;
    return this;
  }

  /**
   * Set regex pattern requirement
   * @param pattern Regular expression pattern
   * @returns StringValidator instance for chaining
   */
  pattern(pattern: RegExp): StringValidator {
    this.regex = pattern;
    return this;
  }

  /**
   * Set custom error message
   * @param message Custom error message
   * @returns StringValidator instance for chaining
   */
  withMessage(message: string): StringValidator {
    this.customMessage = message;
    return this;
  }

  /**
   * Make this validator optional
   * @returns OptionalValidator wrapper
   */
  optional(): OptionalValidator<string> {
    return new OptionalValidator(this);
  }

  /**
   * Validate a value against string rules
   * @param value Value to validate
   * @returns Validation result
   */
  validate(value: unknown): ValidationResult<string> {
    if (typeof value !== 'string') {
      return {
        success: false,
        error: this.customMessage || 'Value must be a string'
      };
    }

    if (this.minLen !== undefined && value.length < this.minLen) {
      return {
        success: false,
        error: this.customMessage || `String must be at least ${this.minLen} characters long`
      };
    }

    if (this.maxLen !== undefined && value.length > this.maxLen) {
      return {
        success: false,
        error: this.customMessage || `String must be at most ${this.maxLen} characters long`
      };
    }

    if (this.regex && !this.regex.test(value)) {
      return {
        success: false,
        error: this.customMessage || 'String does not match required pattern'
      };
    }

    return { success: true, data: value };
  }
}

/**
 * Number validator with chainable methods for validation rules
 */
class NumberValidator implements Validator<number> {
  private minVal?: number;
  private maxVal?: number;
  private customMessage?: string;

  /**
   * Set minimum value requirement
   * @param value Minimum value
   * @returns NumberValidator instance for chaining
   */
  min(value: number): NumberValidator {
    this.minVal = value;
    return this;
  }

  /**
   * Set maximum value requirement
   * @param value Maximum value
   * @returns NumberValidator instance for chaining
   */
  max(value: number): NumberValidator {
    this.maxVal = value;
    return this;
  }

  /**
   * Set custom error message
   * @param message Custom error message
   * @returns NumberValidator instance for chaining
   */
  withMessage(message: string): NumberValidator {
    this.customMessage = message;
    return this;
  }

  /**
   * Make this validator optional
   * @returns OptionalValidator wrapper
   */
  optional(): OptionalValidator<number> {
    return new OptionalValidator(this);
  }

  /**
   * Validate a value against number rules
   * @param value Value to validate
   * @returns Validation result
   */
  validate(value: unknown): ValidationResult<number> {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        success: false,
        error: this.customMessage || 'Value must be a valid number'
      };
    }

    if (this.minVal !== undefined && value < this.minVal) {
      return {
        success: false,
        error: this.customMessage || `Number must be at least ${this.minVal}`
      };
    }

    if (this.maxVal !== undefined && value > this.maxVal) {
      return {
        success: false,
        error: this.customMessage || `Number must be at most ${this.maxVal}`
      };
    }

    return { success: true, data: value };
  }
}

/**
 * Boolean validator
 */
class BooleanValidator implements Validator<boolean> {
  private customMessage?: string;

  /**
   * Set custom error message
   * @param message Custom error message
   * @returns BooleanValidator instance for chaining
   */
  withMessage(message: string): BooleanValidator {
    this.customMessage = message;
    return this;
  }

  /**
   * Make this validator optional
   * @returns OptionalValidator wrapper
   */
  optional(): OptionalValidator<boolean> {
    return new OptionalValidator(this);
  }

  /**
   * Validate a value as boolean
   * @param value Value to validate
   * @returns Validation result
   */
  validate(value: unknown): ValidationResult<boolean> {
    if (typeof value !== 'boolean') {
      return {
        success: false,
        error: this.customMessage || 'Value must be a boolean'
      };
    }

    return { success: true, data: value };
  }
}

/**
 * Date validator
 */
class DateValidator implements Validator<Date> {
  private minDate?: Date;
  private maxDate?: Date;
  private customMessage?: string;

  /**
   * Set minimum date requirement
   * @param date Minimum date
   * @returns DateValidator instance for chaining
   */
  min(date: Date): DateValidator {
    this.minDate = date;
    return this;
  }

  /**
   * Set maximum date requirement
   * @param date Maximum date
   * @returns DateValidator instance for chaining
   */
  max(date: Date): DateValidator {
    this.maxDate = date;
    return this;
  }

  /**
   * Set custom error message
   * @param message Custom error message
   * @returns DateValidator instance for chaining
   */
  withMessage(message: string): DateValidator {
    this.customMessage = message;
    return this;
  }

  /**
   * Make this validator optional
   * @returns OptionalValidator wrapper
   */
  optional(): OptionalValidator<Date> {
    return new OptionalValidator(this);
  }

  /**
   * Validate a value as Date
   * @param value Value to validate
   * @returns Validation result
   */
  validate(value: unknown): ValidationResult<Date> {
    let date: Date;
    
    // Only accept Date objects or strings
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else {
      return {
        success: false,
        error: this.customMessage || 'Value must be a valid date'
      };
    }
    
    if (isNaN(date.getTime())) {
      return {
        success: false,
        error: this.customMessage || 'Value must be a valid date'
      };
    }

    if (this.minDate && date < this.minDate) {
      return {
        success: false,
        error: this.customMessage || `Date must be after ${this.minDate.toISOString()}`
      };
    }

    if (this.maxDate && date > this.maxDate) {
      return {
        success: false,
        error: this.customMessage || `Date must be before ${this.maxDate.toISOString()}`
      };
    }

    return { success: true, data: date };
  }
}

/**
 * Array validator for validating arrays with item validation
 */
class ArrayValidator<T> implements Validator<T[]> {
  private minLen?: number;
  private maxLen?: number;
  private customMessage?: string;

  constructor(private itemValidator: Validator<T>) {}

  /**
   * Set minimum length requirement
   * @param length Minimum length
   * @returns ArrayValidator instance for chaining
   */
  minLength(length: number): ArrayValidator<T> {
    this.minLen = length;
    return this;
  }

  /**
   * Set maximum length requirement
   * @param length Maximum length
   * @returns ArrayValidator instance for chaining
   */
  maxLength(length: number): ArrayValidator<T> {
    this.maxLen = length;
    return this;
  }

  /**
   * Set custom error message
   * @param message Custom error message
   * @returns ArrayValidator instance for chaining
   */
  withMessage(message: string): ArrayValidator<T> {
    this.customMessage = message;
    return this;
  }

  /**
   * Make this validator optional
   * @returns OptionalValidator wrapper
   */
  optional(): OptionalValidator<T[]> {
    return new OptionalValidator(this);
  }

  /**
   * Validate an array and its items
   * @param value Value to validate
   * @returns Validation result
   */
  validate(value: unknown): ValidationResult<T[]> {
    if (!Array.isArray(value)) {
      return {
        success: false,
        error: this.customMessage || 'Value must be an array'
      };
    }

    if (this.minLen !== undefined && value.length < this.minLen) {
      return {
        success: false,
        error: this.customMessage || `Array must have at least ${this.minLen} items`
      };
    }

    if (this.maxLen !== undefined && value.length > this.maxLen) {
      return {
        success: false,
        error: this.customMessage || `Array must have at most ${this.maxLen} items`
      };
    }

    const validatedItems: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i]);
      if (!itemResult.success) {
        return {
          success: false,
          error: this.customMessage || `Array item at index ${i}: ${itemResult.error}`
        };
      }
      validatedItems.push(itemResult.data!);
    }

    return { success: true, data: validatedItems };
  }
}

/**
 * Object validator for validating objects with schema
 */
class ObjectValidator<T> implements Validator<T> {
  private customMessage?: string;

  constructor(private schema: Record<string, Validator<any>>) {}

  /**
   * Set custom error message
   * @param message Custom error message
   * @returns ObjectValidator instance for chaining
   */
  withMessage(message: string): ObjectValidator<T> {
    this.customMessage = message;
    return this;
  }

  /**
   * Make this validator optional
   * @returns OptionalValidator wrapper
   */
  optional(): OptionalValidator<T> {
    return new OptionalValidator(this);
  }

  /**
   * Validate an object against schema
   * @param value Value to validate
   * @returns Validation result
   */
  validate(value: unknown): ValidationResult<T> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        success: false,
        error: this.customMessage || 'Value must be an object'
      };
    }

    const obj = value as Record<string, unknown>;
    const validatedObject: Record<string, any> = {};

    for (const [key, validator] of Object.entries(this.schema)) {
      const fieldResult = validator.validate(obj[key]);
      if (!fieldResult.success) {
        return {
          success: false,
          error: this.customMessage || `Object field '${key}': ${fieldResult.error}`
        };
      }
      if (fieldResult.data !== undefined) {
        validatedObject[key] = fieldResult.data;
      }
    }

    return { success: true, data: validatedObject as T };
  }
}

/**
 * Main Schema class providing static factory methods for creating validators
 */
class Schema {
  /**
   * Create a string validator
   * @returns StringValidator instance
   */
  static string(): StringValidator {
    return new StringValidator();
  }

  /**
   * Create a number validator
   * @returns NumberValidator instance
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }

  /**
   * Create a boolean validator
   * @returns BooleanValidator instance
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  /**
   * Create a date validator
   * @returns DateValidator instance
   */
  static date(): DateValidator {
    return new DateValidator();
  }

  /**
   * Create an object validator with schema
   * @param schema Object schema defining field validators
   * @returns ObjectValidator instance
   */
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }

  /**
   * Create an array validator
   * @param itemValidator Validator for array items
   * @returns ArrayValidator instance
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }
}

// Export the main Schema class and types
export { Schema, ValidationResult, Validator };

// Example usage and demonstrations
function runExamples() {
  console.log('=== Type-Safe Validation Library Examples ===\n');

  // Define a complex schema
  const addressSchema = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
    country: Schema.string()
  });

  const userSchema = Schema.object({
    id: Schema.string().withMessage('ID must be a string'),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    age: Schema.number().optional(),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()),
    address: addressSchema.optional(),
    metadata: Schema.object({}).optional()
  });

  // Test data
  const validUserData = {
    id: "12345",
    name: "John Doe",
    email: "john@example.com",
    isActive: true,
    tags: ["developer", "designer"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      postalCode: "12345",
      country: "USA"
    }
  };

  const invalidUserData = {
    id: 12345, // Should be string
    name: "J", // Too short
    email: "invalid-email", // Invalid format
    isActive: "yes", // Should be boolean
    tags: ["developer", 12345], // Array contains non-string
    address: {
      street: "123 Main St",
      city: "Anytown",
      postalCode: "1234", // Invalid postal code
      country: "USA"
    }
  };

  // Validate valid data
  console.log('1. Validating valid user data:');
  const validResult = userSchema.validate(validUserData);
  console.log('Result:', validResult);
  console.log('');

  // Validate invalid data
  console.log('2. Validating invalid user data:');
  const invalidResult = userSchema.validate(invalidUserData);
  console.log('Result:', invalidResult);
  console.log('');

  // Individual validator examples
  console.log('3. Individual validator examples:');
  
  // String validator
  const nameValidator = Schema.string().minLength(2).maxLength(10);
  console.log('Name "John":', nameValidator.validate("John"));
  console.log('Name "J":', nameValidator.validate("J"));
  
  // Number validator
  const ageValidator = Schema.number().min(0).max(120);
  console.log('Age 25:', ageValidator.validate(25));
  console.log('Age -5:', ageValidator.validate(-5));
  
  // Array validator
  const tagsValidator = Schema.array(Schema.string()).minLength(1);
  console.log('Tags ["dev", "ui"]:', tagsValidator.validate(["dev", "ui"]));
  console.log('Tags []:', tagsValidator.validate([]));
  
  console.log('\n=== Examples Complete ===');
}

// Run examples when this file is executed directly
runExamples(); 