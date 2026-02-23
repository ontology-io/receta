# Type Alias: Result\<T, E\>

> **Result**\<`T`, `E`\> = [`Ok`](../interfaces/Ok.md)\<`T`\> \| [`Err`](../interfaces/Err.md)\<`E`\>

Defined in: [result/types.ts:31](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/result/types.ts#L31)

Result type representing either success (Ok) or failure (Err).

## Type Parameters

### T

`T`

The type of the success value

### E

`E`

The type of the error value

## Example

```typescript
type ParseResult = Result<number, string>

const success: ParseResult = { _tag: 'Ok', value: 42 }
const failure: ParseResult = { _tag: 'Err', error: 'Invalid number' }
```
