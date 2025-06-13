/**
 * @file A comprehensive, type-safe validation library for TypeScript.
 * @author Your Name
 * @version 2.0.0
 *
 * @description
 * This library provides a set of powerful and flexible validators for common data types.
 * It features a fluent, chainable API, immutable validator instances, and detailed, customizable
 * error messages. The design emphasizes type safety, ensuring that if validation passes,
 * the output is correctly typed.
 *
 * @example
 * import { Schema } from './schema';
 *
 * const userSchema = Schema.object({
 *   name: Schema.string().minLength(2, 'Name is too short.'),
 *   email: Schema.string().pattern(/@/, 'Invalid email format.'),
 *   age: Schema.number().min(18).optional(),
 * });
 *
 * const result = userSchema.validate({ name: 'John', email: 'john@example.com' });
 * if (result.success) {
 *   console.log('Validated data:', result.data);
 * } else {
 *   console.error('Validation error:', result.error);
 * }
 */

/**
 * Base interface for all validators.
 */
export interface Validator<T> {
  validate(value: unknown): ValidationResult<T>;
  optional(): Validator<T | undefined>;
   /**
   * @deprecated Provide custom messages directly to the rules (e.g., `minLength(5, 'Too short')`).
   */
  withMessage(message: string): Validator<T>;
}

/**
 * Describes the result of a validation.
 * `success` is true if validation passed, false otherwise.
 * `data` contains the validated and possibly transformed value on success.
 * `error` contains a descriptive message or an object of errors on failure.
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string | Record<string, any>;
}

type ValidationRule<T> = (value: T) => { success: boolean; error?: string };

/**
 * The base class for all validators. It provides the core logic for chaining rules
 * and executing the validation process. Validators are immutable; each method call
 * returns a new validator instance.
 * @template T The type of the value to validate.
 */
abstract class BaseValidator<T> implements Validator<T> {
  protected rules: ValidationRule<T>[] = [];
  protected isOptional: boolean = false;
  protected baseErrorMessage?: string;

  constructor(other?: BaseValidator<T>) {
    if (other) {
      this.rules = [...other.rules];
      this.isOptional = other.isOptional;
      this.baseErrorMessage = other.baseErrorMessage;
    }
  }

  /**
   * Creates a new validator instance with the provided properties.
   * This is used internally to maintain immutability.
   * @protected
   */
  protected abstract clone(): BaseValidator<T>;

  protected addRule(rule: ValidationRule<T>): this {
    const newValidator = this.clone() as this;
    newValidator.rules.push(rule);
    return newValidator;
  }

  /**
   * Marks the schema as optional. If the input value is `null` or `undefined`,
   * validation will pass and return `undefined`.
   * @returns A new validator instance that allows optional values.
   *
   * @example
   * const validator = Schema.string().optional();
   * validator.validate(null).success; // true
   * validator.validate(undefined).success; // true
   */
  optional(): Validator<T | undefined> {
    const newValidator = this.clone() as BaseValidator<T | undefined>;
    newValidator.isOptional = true;
    
    const originalValidate = newValidator.validate.bind(newValidator);
    newValidator.validate = (value: unknown): ValidationResult<T | undefined> => {
        if (value === null || value === undefined) {
            return { success: true, data: undefined };
        }
        return originalValidate(value);
    };

    return newValidator;
  }

  /**
   * @deprecated This method is deprecated. Provide custom messages directly to the rules.
   * @example
   * // Deprecated
   * Schema.string().minLength(5).withMessage('Must be 5 chars long.');
   * // Preferred
   * Schema.string().minLength(5, 'Must be 5 chars long.');
   */
  withMessage(message: string): this {
    const newValidator = this.clone() as this;
    // This message will be used for the base type check.
    newValidator.baseErrorMessage = message;
    return newValidator;
  }
  
  /**
   * Validates a value against the schema.
   * @param value The value to validate.
   * @returns A `ValidationResult` object.
   */
  validate(value: unknown): ValidationResult<T> {
    const typeCheckResult = this.validateType(value);
    if (!typeCheckResult.success) {
      return typeCheckResult;
    }

    const typedValue = typeCheckResult.data as T;
    for (const rule of this.rules) {
      const result = rule(typedValue);
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }

    return { success: true, data: typedValue };
  }

  /**
   * Abstract method for checking the base type of the value.
   * @param value The value to perform the type check on.
   * @protected
   */
  protected abstract validateType(value: unknown): ValidationResult<T>;
}

/**
 * Validator for `string` values.
 *
 * @example
 * const nameValidator = Schema.string()
 *   .minLength(2, 'Name must be at least 2 characters.')
 *   .maxLength(50, 'Name cannot exceed 50 characters.')
 *   .pattern(/^[a-zA-Z]+$/, 'Name can only contain letters.');
 */
class StringValidator extends BaseValidator<string> {

  protected clone(): BaseValidator<string> {
    return new StringValidator(this);
  }

  protected validateType(value: unknown): ValidationResult<string> {
    if (typeof value !== 'string') {
      return { success: false, error: this.baseErrorMessage || 'Value must be a string' };
    }
    return { success: true, data: value };
  }

  /**
   * Sets a minimum length for the string.
   * @param length The minimum required length.
   * @param message Optional custom error message.
   * @returns A new `StringValidator` instance.
   */
  minLength(length: number, message?: string): this {
    return this.addRule((value: string) => {
      if (value.length < length) {
        return { success: false, error: message || `String must be at least ${length} characters long` };
      }
      return { success: true };
    });
  }

  /**
   * Sets a maximum length for the string.
   * @param length The maximum allowed length.
   * @param message Optional custom error message.
   * @returns A new `StringValidator` instance.
   */
  maxLength(length: number, message?: string): this {
    return this.addRule((value: string) => {
      if (value.length > length) {
        return { success: false, error: message || `String must be at most ${length} characters long` };
      }
      return { success: true };
    });
  }

  /**
   * Requires the string to match a regular expression.
   * @param pattern The `RegExp` to match against.
   * @param message Optional custom error message.
   * @returns A new `StringValidator` instance.
   */
  pattern(pattern: RegExp, message?: string): this {
    return this.addRule((value: string) => {
      if (!pattern.test(value)) {
        return { success: false, error: message || 'String does not match required pattern' };
      }
      return { success: true };
    });
  }
}

/**
 * Validator for `number` values.
 *
 * @example
 * const ageValidator = Schema.number()
 *   .min(0, 'Age cannot be negative.')
 *   .max(120, 'Age seems too high.');
 */
class NumberValidator extends BaseValidator<number> {
  protected clone(): BaseValidator<number> {
    return new NumberValidator(this);
  }

  protected validateType(value: unknown): ValidationResult<number> {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { success: false, error: this.baseErrorMessage || 'Value must be a valid number' };
    }
    return { success: true, data: value };
  }

  /**
   * Sets a minimum value for the number.
   * @param value The minimum required value.
   * @param message Optional custom error message.
   * @returns A new `NumberValidator` instance.
   */
  min(value: number, message?: string): this {
    return this.addRule((val: number) => {
      if (val < value) {
        return { success: false, error: message || `Number must be at least ${value}` };
      }
      return { success: true };
    });
  }

  /**
   * Sets a maximum value for the number.
   * @param value The maximum allowed value.
   * @param message Optional custom error message.
   * @returns A new `NumberValidator` instance.
   */
  max(value: number, message?: string): this {
    return this.addRule((val: number) => {
      if (val > value) {
        return { success: false, error: message || `Number must be at most ${value}` };
      }
      return { success: true };
    });
  }
}

/**
 * Validator for `boolean` values.
 *
 * @example
 * const isActiveValidator = Schema.boolean().withMessage('Must be a true or false value.');
 */
class BooleanValidator extends BaseValidator<boolean> {
  protected clone(): BaseValidator<boolean> {
    return new BooleanValidator(this);
  }

  protected validateType(value: unknown): ValidationResult<boolean> {
    if (typeof value !== 'boolean') {
      return { success: false, error: this.baseErrorMessage || 'Value must be a boolean' };
    }
    return { success: true, data: value };
  }
}

/**
 * Validator for `Date` objects. It can parse valid date strings into `Date` objects.
 *
 * @example
 * const dateValidator = Schema.date()
 *   .min(new Date('2023-01-01'), 'Date must be in 2023 or later.')
 *   .max(new Date('2023-12-31'), 'Date must be in 2023.');
 */
class DateValidator extends BaseValidator<Date> {
  private minDateVal?: { date: Date, message?: string };
  private maxDateVal?: { date: Date, message?: string };

  constructor(other?: DateValidator) {
    super(other);
    if(other) {
        this.minDateVal = other.minDateVal;
        this.maxDateVal = other.maxDateVal;
    }
  }

  protected clone(): BaseValidator<Date> {
    return new DateValidator(this);
  }

  protected validateType(value: unknown): ValidationResult<Date> {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return { success: true, data: value };
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return { success: true, data: date };
      }
    }
    return { success: false, error: this.baseErrorMessage || 'Value must be a valid date' };
  }
  
  /**
   * Sets a minimum date.
   * @param date The minimum allowed date.
   * @param message Optional custom error message.
   * @returns A new `DateValidator` instance.
   */
  min(date: Date, message?: string): this {
    const newValidator = this.clone() as DateValidator;
    newValidator.minDateVal = { date, message };

    if (newValidator.maxDateVal && newValidator.maxDateVal.date < date) {
        throw new Error('Min date cannot be after max date');
    }

    return newValidator.addRule((value: Date) => {
        if (value < date) {
            return { success: false, error: message || `Date must be after ${date.toISOString()}`};
        }
        return { success: true };
    }) as this;
  }
  
  /**
   * Sets a maximum date.
   * @param date The maximum allowed date.
   * @param message Optional custom error message.
   * @returns A new `DateValidator` instance.
   */
  max(date: Date, message?: string): this {
    const newValidator = this.clone() as DateValidator;
    newValidator.maxDateVal = { date, message };
    
    if (newValidator.minDateVal && newValidator.minDateVal.date > date) {
        throw new Error('Min date cannot be after max date');
    }

    return newValidator.addRule((value: Date) => {
        if (value > date) {
            return { success: false, error: message || `Date must be before ${date.toISOString()}`};
        }
        return { success: true };
    }) as this;
  }
}

/**
 * Validator for arrays.
 * @template T The type of the items in the array.
 *
 * @example
 * const tagsValidator = Schema.array(Schema.string().maxLength(15))
 *   .minLength(1, 'At least one tag is required.')
 *   .maxLength(5, 'No more than 5 tags are allowed.');
 */
class ArrayValidator<T> extends BaseValidator<T[]> {
  constructor(private itemValidator: Validator<T>, other?: ArrayValidator<T>) {
    super(other);
  }

  protected clone(): BaseValidator<T[]> {
    return new ArrayValidator<T>(this.itemValidator, this);
  }
  
  protected validateType(value: unknown): ValidationResult<T[]> {
    if (!Array.isArray(value)) {
      return { success: false, error: this.baseErrorMessage || 'Value must be an array' };
    }
    return { success: true, data: value };
  }

  /**
   * Sets a minimum length for the array.
   * @param length The minimum required length.
   * @param message Optional custom error message.
   * @returns A new `ArrayValidator` instance.
   */
  minLength(length: number, message?: string): this {
      return this.addRule((value: T[]) => {
          if (value.length < length) {
              return { success: false, error: message || `Array must contain at least ${length} items` };
          }
          return { success: true };
      });
  }

  /**
   * Sets a maximum length for the array.
   * @param length The maximum allowed length.
   * @param message Optional custom error message.
   * @returns A new `ArrayValidator` instance.
   */
  maxLength(length: number, message?: string): this {
      return this.addRule((value: T[]) => {
          if (value.length > length) {
              return { success: false, error: message || `Array must contain at most ${length} items` };
          }
          return { success: true };
      });
  }

  validate(value: unknown): ValidationResult<T[]> {
    const arrayResult = super.validate(value);
    if (!arrayResult.success) {
      return arrayResult;
    }

    const validatedItems: T[] = [];
    const errors: Record<number, string> = {};
    let hasErrors = false;

    for (let i = 0; i < (arrayResult.data as T[]).length; i++) {
      const item = (arrayResult.data as T[])[i];
      const itemResult = this.itemValidator.validate(item);
      if (itemResult.success) {
        validatedItems.push(itemResult.data as T);
      } else {
        hasErrors = true;
        errors[i] = itemResult.error as string;
      }
    }

    if (hasErrors) {
      return { success: false, error: errors };
    }

    return { success: true, data: validatedItems };
  }
}

/**
 * Validator for `object` values.
 * @template T The expected type of the object.
 *
 * @example
 * interface User {
 *   id: string;
 *   name: string;
 *   email?: string;
 * }
 *
 * const userValidator = Schema.object<User>({
 *   id: Schema.string(),
 *   name: Schema.string().minLength(2),
 *   email: Schema.string().pattern(/@/).optional(),
 * });
 */
class ObjectValidator<T> extends BaseValidator<T> {
  constructor(private schema: Record<string, Validator<any>>, other?: ObjectValidator<T>) {
    super(other);
  }

  protected clone(): BaseValidator<T> {
    return new ObjectValidator<T>(this.schema, this);
  }

  protected validateType(value: unknown): ValidationResult<T> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { success: false, error: this.baseErrorMessage || 'Value must be an object' };
    }
    return { success: true, data: value as T };
  }

  validate(value: unknown): ValidationResult<T> {
    const objectResult = super.validate(value);
    if (!objectResult.success) {
      return objectResult;
    }

    const validatedObject: Partial<T> = {};
    const errors: Record<string, string> = {};
    let hasErrors = false;
    const obj = objectResult.data as Record<string, unknown>;

    for (const key in this.schema) {
      const validator = this.schema[key];
      const result = validator.validate(obj[key]);

      if (result.success) {
        if (result.data !== undefined) {
          (validatedObject as any)[key] = result.data;
        }
      } else {
        hasErrors = true;
        errors[key] = result.error as string;
      }
    }

    if (hasErrors) {
      return { success: false, error: errors };
    }

    return { success: true, data: validatedObject as T };
  }
}

/**
 * The `Schema` class is the entry point for creating validators.
 * It provides static methods for each validator type.
 *
 * @example
 * const stringValidator = Schema.string();
 * const numberValidator = Schema.number();
 */
export class Schema {
  /**
   * Creates a new `StringValidator`.
   * @returns A `StringValidator` instance.
   */
  static string(): StringValidator {
    return new StringValidator();
  }

  /**
   * Creates a new `NumberValidator`.
   * @returns A `NumberValidator` instance.
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }

  /**
   * Creates a new `BooleanValidator`.
   * @returns A `BooleanValidator` instance.
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  /**
   * Creates a new `DateValidator`.
   * @returns A `DateValidator` instance.
   */
  static date(): DateValidator {
    return new DateValidator();
  }

  /**
   * Creates a new `ObjectValidator`.
   * @template T The expected type of the object.
   * @param schema A schema definition where keys are property names and values are validators.
   * @returns An `ObjectValidator` instance.
   */
  static object<T>(schema: { [K in keyof T]: Validator<T[K]> }): ObjectValidator<T> {
    return new ObjectValidator<T>(schema as any);
  }

  /**
   * Creates a new `ArrayValidator`.
   * @template T The type of items in the array.
   * @param itemValidator A validator for the items in the array.
   * @returns An `ArrayValidator` instance.
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator(itemValidator);
  }
} 