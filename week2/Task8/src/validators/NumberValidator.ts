import { ValidationResult } from '../types';
import { BaseValidator } from './BaseValidator';

/**
 * Validator for `number` values.
 *
 * @example
 * const ageValidator = Schema.number()
 *   .min(0, 'Age cannot be negative.')
 *   .max(120, 'Age seems too high.');
 */
export class NumberValidator extends BaseValidator<number> {
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