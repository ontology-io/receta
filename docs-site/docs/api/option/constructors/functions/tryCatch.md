# Function: tryCatch()

> **tryCatch**\<`T`\>(`fn`): [`Option`](../../types/type-aliases/Option.md)\<`T`\>

Defined in: [option/constructors/index.ts:101](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/option/constructors/index.ts#L101)

Wraps a potentially throwing function in an Option.

If the function executes successfully, returns Some with the value.
If it throws, returns None.

## Type Parameters

### T

`T`

## Parameters

### fn

() => `T`

Function that may throw

## Returns

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

Option containing either the return value or None

## Example

```typescript
const parseJSON = (str: string) =>
  tryCatch(() => JSON.parse(str))

parseJSON('{"name":"John"}')
// => Some({ name: 'John' })

parseJSON('invalid json')
// => None
```
