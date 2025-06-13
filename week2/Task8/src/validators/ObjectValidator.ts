import { ValidationResult, Validator } from '../types';
import { BaseValidator } from './BaseValidator';

/**
 * Validator for `object` values. It ensures the input is an object and validates
 * its properties against a provided schema.
 * @template T The expected type of the object.
 */
export class ObjectValidator<T> extends BaseValidator<T> {
  constructor(private schema: Record<string, Validator<any>>, other?: ObjectValidator<T>) {
    super(other);
    if(other) {
        this.schema = other.schema;
    }
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

  /**
   * Overrides the base `validate` method to handle property-by-property validation.
   */
  validate(value: unknown): ValidationResult<T> {
    const baseResult = super.validate(value);
    if (!baseResult.success) {
      return baseResult;
    }
    
    const objectValue = baseResult.data! as Record<string, unknown>;
    const validatedObject: Partial<T> = {};
    const errors: Record<string, any> = {};

    for (const key in this.schema) {
      if (Object.prototype.hasOwnProperty.call(this.schema, key)) {
        const validator = this.schema[key];
        const result = validator.validate(objectValue[key]);
        
        if (result.success) {
          if(result.data !== undefined) {
            (validatedObject as any)[key] = result.data;
          }
        } else {
          errors[key] = result.error;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, error: { message: 'Object validation failed', errors } };
    }

    return { success: true, data: validatedObject as T };
  }
} 