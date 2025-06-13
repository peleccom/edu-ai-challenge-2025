import { ValidationResult, Validator } from '../types';
import { BaseValidator } from './BaseValidator';

/**
 * Validator for arrays. It validates that the input is an array and that each
 * item in the array conforms to the provided item validator.
 * @template T The type of items in the array.
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
  constructor(private itemValidator: Validator<T>, other?: ArrayValidator<T>) {
    super(other);
    if(other) {
        this.itemValidator = other.itemValidator;
    }
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

  /**
   * Overrides the base `validate` method to handle item-by-item validation.
   */
  validate(value: unknown): ValidationResult<T[]> {
    const baseResult = super.validate(value);
    if (!baseResult.success) {
      return baseResult;
    }
    
    const arrayValue = baseResult.data!;
    const validatedArray: T[] = [];
    const errors: Record<string, any> = {};

    for (let i = 0; i < arrayValue.length; i++) {
      const itemResult = this.itemValidator.validate(arrayValue[i]);
      if (itemResult.success) {
        validatedArray.push(itemResult.data!);
      } else {
        errors[i] = itemResult.error;
      }
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, error: { message: 'Array contains invalid items', errors } };
    }

    return { success: true, data: validatedArray };
  }
} 