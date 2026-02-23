# Function: isNone()

> **isNone**\<`T`\>(`option`): `option is None`

Defined in: [option/guards/index.ts:41](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/guards/index.ts#L41)

Type guard to check if an Option is None.

Narrows the type to None.

## Type Parameters

### T

`T`

## Parameters

### option

[`Option`](../../types/type-aliases/Option.md)\<`T`\>

The Option to check

## Returns

`option is None`

True if the Option is None

## Example

```typescript
const opt = none()

if (isNone(opt)) {
  console.log('No value present')
}
```
