# Interface: OptionMatchers\<R\>

Defined in: [testing/types.ts:48](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/types.ts#L48)

Extended Vitest matcher interface for Option types.

## Extended by

- [`RecetaMatchers`](RecetaMatchers.md)

## Type Parameters

### R

`R` = `unknown`

## Methods

### toBeNone()

> **toBeNone**(): `R`

Defined in: [testing/types.ts:70](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/types.ts#L70)

Assert that an Option is None.

#### Returns

`R`

#### Example

```typescript
expect(none()).toBeNone()
expect(some(5)).not.toBeNone()
```

***

### toBeSome()

> **toBeSome**\<`T`\>(`expectedValue?`): `R`

Defined in: [testing/types.ts:59](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/types.ts#L59)

Assert that an Option is Some, optionally checking the value.

#### Type Parameters

##### T

`T`

#### Parameters

##### expectedValue?

`T`

#### Returns

`R`

#### Example

```typescript
expect(some(5)).toBeSome()
expect(some(5)).toBeSome(5)
expect(none()).not.toBeSome()
```

***

### toEqualOption()

> **toEqualOption**\<`T`\>(`expected`): `R`

Defined in: [testing/types.ts:81](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/testing/types.ts#L81)

Deep equality check for Option types.

#### Type Parameters

##### T

`T`

#### Parameters

##### expected

`unknown`

#### Returns

`R`

#### Example

```typescript
expect(some(5)).toEqualOption(some(5))
expect(none()).toEqualOption(none())
```
