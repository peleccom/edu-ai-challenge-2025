import { StringValidator } from './validators/StringValidator';
import { NumberValidator } from './validators/NumberValidator';
import { BooleanValidator } from './validators/BooleanValidator';
import { DateValidator } from './validators/DateValidator';
import { ArrayValidator } from './validators/ArrayValidator';
import { ObjectValidator } from './validators/ObjectValidator';
import { Validator } from './types';

/**
 * Main factory class for creating validator instances.
 * Use the static methods on this class to begin a validation chain.
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
   * @param schema The schema definition for the object's properties.
   * @returns An `ObjectValidator` instance.
   */
  static object<T>(schema: { [K in keyof T]: Validator<T[K]> }): ObjectValidator<T> {
    return new ObjectValidator<T>(schema as Record<string, Validator<any>>);
  }

  /**
   * Creates a new `ArrayValidator`.
   * @param itemValidator The validator for the items in the array.
   * @returns An `ArrayValidator` instance.
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }
} 