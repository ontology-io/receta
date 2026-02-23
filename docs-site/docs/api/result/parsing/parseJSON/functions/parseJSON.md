# Function: parseJSON()

> **parseJSON**\<`T`\>(`str`): [`Result`](../../../types/type-aliases/Result.md)\<`T`, `SyntaxError`\>

Defined in: [result/parsing/parseJSON.ts:48](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/parsing/parseJSON.ts#L48)

Safely parses a JSON string into a typed value.

Unlike JSON.parse which throws on invalid input, this function returns a Result
that either contains the parsed value or a SyntaxError.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### str

`string`

The JSON string to parse

## Returns

[`Result`](../../../types/type-aliases/Result.md)\<`T`, `SyntaxError`\>

Result containing the parsed value or a SyntaxError

## Example

```typescript
// Successful parsing
parseJSON('{"name":"John"}')
// => Ok({ name: 'John' })

parseJSON('[1, 2, 3]')
// => Ok([1, 2, 3])

// Failed parsing
parseJSON('invalid json')
// => Err(SyntaxError: Unexpected token 'i'...)

parseJSON('{"incomplete":')
// => Err(SyntaxError: Unexpected end of JSON input)

// With type annotation
interface User {
  name: string
  age: number
}

const result = parseJSON<User>('{"name":"Alice","age":30}')
// => Ok({ name: 'Alice', age: 30 })

// Use with pipe and map
pipe(
  parseJSON<User>('{"name":"Bob","age":25}'),
  Result.map(user => user.name.toUpperCase())
)
// => Ok('BOB')
```

## See

JSON.parse - The underlying native function
