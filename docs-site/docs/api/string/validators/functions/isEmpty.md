# Function: isEmpty()

> **isEmpty**(`str`): `boolean`

Defined in: [string/validators/index.ts:26](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/string/validators/index.ts#L26)

Checks if a string is empty or contains only whitespace.

## Parameters

### str

`string`

The string to check

## Returns

`boolean`

True if the string is empty or whitespace-only

## Example

```typescript
isEmpty('')
// => true

isEmpty('   ')
// => true

isEmpty('hello')
// => false

isEmpty('  hello  ')
// => false
```

## See

isBlank - alias for isEmpty
