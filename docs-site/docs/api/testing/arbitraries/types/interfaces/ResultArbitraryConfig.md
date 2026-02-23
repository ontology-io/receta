# Interface: ResultArbitraryConfig

Defined in: [testing/arbitraries/types.ts:14](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/arbitraries/types.ts#L14)

Configuration for Result arbitrary generation.

## Example

```typescript
result(fc.integer(), fc.string(), { okWeight: 0.8 })
// → 80% Ok, 20% Err
```

## Properties

### okWeight?

> `optional` **okWeight**: `number`

Defined in: [testing/arbitraries/types.ts:25](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/arbitraries/types.ts#L25)

Weight for Ok values (0-1).
Default: 0.5 (50% Ok, 50% Err)

#### Example

```typescript
{ okWeight: 0.9 }  // 90% Ok, 10% Err
{ okWeight: 0.1 }  // 10% Ok, 90% Err
```
