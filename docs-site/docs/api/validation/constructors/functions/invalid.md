# Function: invalid()

> **invalid**\<`E`\>(`errors`): [`Invalid`](../../types/interfaces/Invalid.md)\<`E`\>

Defined in: [validation/constructors/index.ts:57](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/constructors/index.ts#L57)

Creates an Invalid validation containing one or more errors.

Accepts either a single error or an array of errors for convenience.
All errors are stored as an array internally for accumulation.

## Type Parameters

### E

`E`

## Parameters

### errors

The error(s) to wrap

`E` | readonly `E`[]

## Returns

[`Invalid`](../../types/interfaces/Invalid.md)\<`E`\>

An Invalid validation containing the errors

## Example

```typescript
// Single error
invalid('Name is required')
// => { _tag: 'Invalid', errors: ['Name is required'] }

// Multiple errors
invalid(['Name is required', 'Email is invalid'])
// => { _tag: 'Invalid', errors: ['Name is required', 'Email is invalid'] }

// Real-world: Form validation
const validatePassword = (password: string) =>
  password.length < 8
    ? invalid(['Password too short', 'Must be at least 8 characters'])
    : valid(password)
```
