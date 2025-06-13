import { ValidationResult, Validator, ValidationRule } from '../types';

/**
 * The base class for all validators. It provides the core logic for chaining rules
 * and executing the validation process. Validators are immutable; each method call
 * returns a new validator instance.
 * @template T The type of the value to validate.
 */
export abstract class BaseValidator<T> implements Validator<T> {
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