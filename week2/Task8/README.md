# Type-Safe Validation Library

A comprehensive TypeScript validation library that provides type-safe validators for primitive types, arrays, and objects with a fluent API design and customizable error messages. This library is built with a modular structure, making it easy to extend and maintain.

## Features

- ✅ **Type-Safe**: Full TypeScript support with proper type inference.
- 🔗 **Fluent API**: Chainable methods for building complex validators.
- 🧱 **Modular & Immutable**: Validators are immutable and organized into a clean, modular structure.
- 🎯 **Comprehensive**: Support for `string`, `number`, `boolean`, `Date`, `Array`, and `Object`.
- 🛡️ **Robust Error Handling**: Detailed, structured error messages with custom message support.
- 📦 **Optional Fields**: Built-in support for optional validation at any level.
- 🏗️ **Composable**: Build complex schemas from simple, reusable validators.

## Project Structure

The project is organized into the following directories:

- `src/`: Contains the core library source code.
  - `index.ts`: The main entry point for the library.
  - `Schema.ts`: The main factory class for creating validators.
  - `types.ts`: Shared types and interfaces.
  - `validators/`: Directory for all validator classes.
    - `BaseValidator.ts`: The abstract base class for all validators.
    - `StringValidator.ts`, `NumberValidator.ts`, etc.
- `tests/`: Contains all Jest test files.
- `examples/`: Contains a usage example script.
- `dist/`: The compiled JavaScript output.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## How to Run

### Run the Example

To see the library in action, you can run the example script, which demonstrates various validation scenarios.

**Command:**
```bash
npm run example
```

This command uses `ts-node` to execute `examples/example.ts` directly, showcasing real-time validation results in your console.

**Expected Output:**
```
🔍 Type-Safe Validation Library - Usage Examples

1. String Validation:
Valid name: { success: true, data: 'John Doe' }
Invalid name: { success: false, error: 'String must be at least 2 characters long' }

... and more examples
```

### Build the Library

To compile the TypeScript source code into JavaScript, run the build command. The output will be placed in the `dist/` directory.

```bash
npm run build
```

## Running Tests

This library includes a comprehensive Jest test suite covering all validators and edge cases.

### Test Commands

-   **Run all tests once:**
    ```bash
    npm test
    ```
-   **Run tests in watch mode (re-runs on file changes):**
    ```bash
    npm run test:watch
    ```
-   **Run tests with a coverage report:**
    ```bash
    npm run test:coverage
    ```

### Test Coverage

The project is configured to enforce a **minimum of 80% test coverage**. The test suite includes:

-   **Unit Tests** for each validator (`StringValidator`, `NumberValidator`, etc.).
-   **Integration Tests** for complex, real-world schemas.
-   **Edge Case Tests** for handling `null`, `undefined`, and other special values.

## Usage

To use the library, import the `Schema` factory class and create validator instances using its static methods.

### Basic Example

```typescript
import { Schema } from './src/index';

// 1. Define a validator
const nameValidator = Schema.string()
  .minLength(2, 'Name must be at least 2 characters.')
  .maxLength(50, 'Name cannot exceed 50 characters.');

// 2. Validate data
const result = nameValidator.validate('John Doe');

// 3. Check the result
if (result.success) {
  console.log('Validation successful:', result.data); // "John Doe"
} else {
  console.error('Validation failed:', result.error);
}
```

### Complex Object Validation

You can easily compose validators to handle complex, nested data structures.

```typescript
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  zipCode: Schema.string().pattern(/^\d{5}$/, 'Must be a 5-digit ZIP code.'),
});

const userSchema = Schema.object({
  name: Schema.string().minLength(2),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(18).optional(),
  address: addressSchema,
});

const userData = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    zipCode: '12345',
  },
};

const validationResult = userSchema.validate(userData);
console.log(validationResult);
// { success: true, data: { ... } }
```

### Array Validation

Validate arrays and ensure each item conforms to a specific schema.

```typescript
const skillsValidator = Schema.array(
    Schema.string().minLength(1)
).minLength(1, 'At least one skill is required.');

const skillsData = ['TypeScript', 'Node.js', 'React'];
const skillsResult = skillsValidator.validate(skillsData);

console.log(skillsResult);
// { success: true, data: [ 'TypeScript', 'Node.js', 'React' ] }
```

## API Reference

### Schema Class

The main entry point for creating validators.

#### Static Methods

- `Schema.string()` - Creates a string validator
- `Schema.number()` - Creates a number validator  
- `Schema.boolean()` - Creates a boolean validator
- `Schema.date()` - Creates a date validator
- `Schema.array(itemValidator)` - Creates an array validator
- `Schema.object(schema)` - Creates an object validator

### StringValidator

Validates string values with optional constraints.

#### Methods

- `.minLength(length: number)` - Set minimum length
- `.maxLength(length: number)` - Set maximum length
- `.pattern(regex: RegExp)` - Set regex pattern requirement
- `.withMessage(message: string)` - Set custom error message
- `.optional()` - Make validator optional
- `.validate(value: unknown)` - Validate a value

### NumberValidator

Validates numeric values with optional constraints.

#### Methods

- `.min(value: number)` - Set minimum value
- `.max(value: number)` - Set maximum value
- `.withMessage(message: string)` - Set custom error message
- `.optional()` - Make validator optional
- `.validate(value: unknown)` - Validate a value

### BooleanValidator

Validates boolean values.

#### Methods

- `.withMessage(message: string)` - Set custom error message
- `.optional()` - Make validator optional
- `.validate(value: unknown)` - Validate a value

### DateValidator

Validates Date objects and date strings.

#### Methods

- `.min(date: Date)` - Set minimum date
- `.max(date: Date)` - Set maximum date
- `.withMessage(message: string)` - Set custom error message
- `.optional()` - Make validator optional
- `.validate(value: unknown)` - Validate a value

### ArrayValidator

Validates arrays with item validation.

#### Methods

- `.minLength(length: number)` - Set minimum array length
- `.maxLength(length: number)` - Set maximum array length
- `.withMessage(message: string)` - Set custom error message
- `.optional()` - Make validator optional
- `.validate(value: unknown)` - Validate a value

### ObjectValidator

Validates objects against a schema.

#### Methods

- `.withMessage(message: string)` - Set custom error message
- `.optional()` - Make validator optional
- `.validate(value: unknown)` - Validate a value

### ValidationResult<T>

The result type returned by all validators.

```typescript
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Best Practices

1. **Chain validations**: Use method chaining to build complex validators
   ```typescript
   const validator = Schema.string().minLength(3).maxLength(20).pattern(/^[a-zA-Z]+$/);
   ```

2. **Use custom messages**: Provide user-friendly error messages
   ```typescript
   const validator = Schema.string().minLength(3).withMessage('Name is too short');
   ```

3. **Compose schemas**: Build complex objects from smaller schemas
   ```typescript
   const addressSchema = Schema.object({ /* ... */ });
   const userSchema = Schema.object({
     name: Schema.string(),
     address: addressSchema
   });
   ```

4. **Handle validation results**: Always check the success property
   ```typescript
   const result = validator.validate(data);
   if (result.success) {
     // Use result.data (properly typed)
   } else {
     // Handle result.error
   }
   ```

## TypeScript Benefits

This library provides full TypeScript support:

- **Type Inference**: Validated data is properly typed
- **Compile-time Safety**: Catch validation errors at compile time
- **IntelliSense**: Full autocomplete and type checking in your IDE
- **Generic Support**: Type-safe validation for complex nested structures

## Error Handling

All validators return a `ValidationResult<T>` object:

- **Success case**: `{ success: true, data: T }`
- **Error case**: `{ success: false, error: string }`

This makes error handling explicit and type-safe.

## Contributing

1. Make sure all TypeScript compiles without errors
2. Add tests for new validators
3. Update documentation for new features
4. Follow the existing code style and patterns

## License

MIT License - feel free to use this library in your projects!
