# Interface: RecetaMatchers\<R\>

Defined in: [testing/types.ts:87](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L87)

Combined matcher interface for all Receta types.

## Extends

- [`ResultMatchers`](ResultMatchers.md)\<`R`\>.[`OptionMatchers`](OptionMatchers.md)\<`R`\>

## Type Parameters

### R

`R` = `unknown`

## Methods

### toBeErr()

> **toBeErr**\<`E`\>(`expectedError?`): `R`

Defined in: [testing/types.ts:31](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L31)

Assert that a Result is Err, optionally checking the error.

#### Type Parameters

##### E

`E`

#### Parameters

##### expectedError?

`E`

#### Returns

`R`

#### Example

```typescript
expect(err('fail')).toBeErr()
expect(err('fail')).toBeErr('fail')
expect(ok(5)).not.toBeErr()
```

#### Inherited from

[`ResultMatchers`](ResultMatchers.md).[`toBeErr`](ResultMatchers.md#tobeerr)

***

### toBeNone()

> **toBeNone**(): `R`

Defined in: [testing/types.ts:70](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L70)

Assert that an Option is None.

#### Returns

`R`

#### Example

```typescript
expect(none()).toBeNone()
expect(some(5)).not.toBeNone()
```

#### Inherited from

[`OptionMatchers`](OptionMatchers.md).[`toBeNone`](OptionMatchers.md#tobenone)

***

### toBeOk()

> **toBeOk**\<`T`\>(`expectedValue?`): `R`

Defined in: [testing/types.ts:19](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L19)

Assert that a Result is Ok, optionally checking the value.

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
expect(ok(5)).toBeOk()
expect(ok(5)).toBeOk(5)
expect(err('fail')).not.toBeOk()
```

#### Inherited from

[`ResultMatchers`](ResultMatchers.md).[`toBeOk`](ResultMatchers.md#tobeok)

***

### toBeSome()

> **toBeSome**\<`T`\>(`expectedValue?`): `R`

Defined in: [testing/types.ts:59](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L59)

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

#### Inherited from

[`OptionMatchers`](OptionMatchers.md).[`toBeSome`](OptionMatchers.md#tobesome)

***

### toEqualOption()

> **toEqualOption**\<`T`\>(`expected`): `R`

Defined in: [testing/types.ts:81](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L81)

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

#### Inherited from

[`OptionMatchers`](OptionMatchers.md).[`toEqualOption`](OptionMatchers.md#toequaloption)

***

### toEqualResult()

> **toEqualResult**\<`T`, `E`\>(`expected`): `R`

Defined in: [testing/types.ts:42](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/types.ts#L42)

Deep equality check for Result types.

#### Type Parameters

##### T

`T`

##### E

`E`

#### Parameters

##### expected

`unknown`

#### Returns

`R`

#### Example

```typescript
expect(ok(5)).toEqualResult(ok(5))
expect(err('fail')).toEqualResult(err('fail'))
```

#### Inherited from

[`ResultMatchers`](ResultMatchers.md).[`toEqualResult`](ResultMatchers.md#toequalresult)
