import { ValidationResult } from '../types';
import { BaseValidator } from './BaseValidator';

/**
 * Validator for `boolean` values.
 *
 * @example
 * const isActiveValidator = Schema.boolean();
 */
export class BooleanValidator extends BaseValidator<boolean> {
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