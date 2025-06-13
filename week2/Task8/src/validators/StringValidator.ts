import { ValidationResult } from '../types';
import { BaseValidator } from './BaseValidator';

/**
 * Validator for `string` values.
 *
 * @example
 * const nameValidator = Schema.string()
 *   .minLength(2, 'Name must be at least 2 characters.')
 *   .maxLength(50, 'Name cannot exceed 50 characters.')
 *   .pattern(/^[a-zA-Z]+$/, 'Name can only contain letters.');
 */
export class StringValidator extends BaseValidator<string> {

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