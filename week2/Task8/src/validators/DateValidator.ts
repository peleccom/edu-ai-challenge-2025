import { ValidationResult } from '../types';
import { BaseValidator } from './BaseValidator';

/**
 * Validator for `Date` objects. It can also parse date strings.
 *
 * @example
 * const dateValidator = Schema.date()
 *   .min(new Date('2023-01-01'), 'Date must be in 2023 or later.')
 *   .max(new Date('2023-12-31'), 'Date must be in 2023.');
 */
export class DateValidator extends BaseValidator<Date> {
  constructor(other?: DateValidator) {
    super(other);
  }

  protected clone(): DateValidator {
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
    return { success: false, error: this.baseErrorMessage || 'Value must be a valid Date object or an ISO date string' };
  }

  /**
   * Sets a minimum date.
   * @param date The minimum required date.
   * @param message Optional custom error message.
   * @returns A new `DateValidator` instance.
   */
  min(date: Date, message?: string): this {
    return this.addRule((value: Date) => {
        if (value.getTime() < date.getTime()) {
            return { success: false, error: message || `Date must be on or after ${date.toISOString()}` };
        }
        return { success: true };
    });
  }

  /**
   * Sets a maximum date.
   * @param date The maximum allowed date.
   * @param message Optional custom error message.
   * @returns A new `DateValidator` instance.
   */
  max(date: Date, message?: string): this {
    return this.addRule((value: Date) => {
        if (value.getTime() > date.getTime()) {
            return { success: false, error: message || `Date must be on or before ${date.toISOString()}` };
        }
        return { success: true };
    });
  }
} 