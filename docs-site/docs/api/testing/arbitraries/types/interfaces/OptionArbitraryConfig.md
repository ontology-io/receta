# Interface: OptionArbitraryConfig

Defined in: [testing/arbitraries/types.ts:37](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/arbitraries/types.ts#L37)

Configuration for Option arbitrary generation.

## Example

```typescript
option(fc.integer(), { someWeight: 0.7 })
// → 70% Some, 30% None
```

## Properties

### someWeight?

> `optional` **someWeight**: `number`

Defined in: [testing/arbitraries/types.ts:48](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/arbitraries/types.ts#L48)

Weight for Some values (0-1).
Default: 0.5 (50% Some, 50% None)

#### Example

```typescript
{ someWeight: 0.8 }  // 80% Some, 20% None
{ someWeight: 0.2 }  // 20% Some, 80% None
```
