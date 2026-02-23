# Type Alias: Validation\<T, E\>

> **Validation**\<`T`, `E`\> = [`Valid`](../interfaces/Valid.md)\<`T`\> \| [`Invalid`](../interfaces/Invalid.md)\<`E`\>

Defined in: [validation/types.ts:39](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/validation/types.ts#L39)

Validation type representing either success (Valid) or failure (Invalid).

Validation is similar to Result but optimized for error accumulation.
While Result short-circuits on the first error (fail-fast), Validation
accumulates all errors (fail-slow), making it ideal for form validation
and multi-field data validation.

## Type Parameters

### T

`T`

The type of the success value

### E

`E`

The type of error values (stored as array)

## Example

```typescript
type FormValidation = Validation<User, string>

const success: FormValidation = { _tag: 'Valid', value: { name: 'John', email: 'john@example.com' } }
const failure: FormValidation = { _tag: 'Invalid', errors: ['Name too short', 'Invalid email'] }
```
