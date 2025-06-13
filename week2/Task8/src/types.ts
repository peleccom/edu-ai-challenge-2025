/**
 * @file Shared types and interfaces for the validation library.
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

export type ValidationRule<T> = (value: T) => { success: boolean; error?: string }; 