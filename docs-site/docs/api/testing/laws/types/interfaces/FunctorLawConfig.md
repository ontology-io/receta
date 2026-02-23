# Interface: FunctorLawConfig\<F, A\>

Defined in: [testing/laws/types.ts:20](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L20)

Configuration for testing functor laws.

## Example

```typescript
testFunctorLaws({
  type: 'Result',
  of: ok,
  map: Result.map,
  testCases: [
    { value: 5, transforms: [x => x * 2, x => x + 1] }
  ]
})
```

## Type Parameters

### F

`F`

### A

`A`

## Properties

### equals()?

> `optional` **equals**: (`a`, `b`) => `boolean`

Defined in: [testing/laws/types.ts:44](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L44)

Custom equality function for comparing functor values.
Defaults to deep equality check.

#### Parameters

##### a

`F`

##### b

`F`

#### Returns

`boolean`

***

### map()

> **map**: \<`B`\>(`fa`, `fn`) => `F`

Defined in: [testing/laws/types.ts:38](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L38)

Map function to test.

#### Type Parameters

##### B

`B`

#### Parameters

##### fa

`F`

##### fn

(`a`) => `B`

#### Returns

`F`

#### Example

```ts
Result.map, Option.map
```

***

### of()

> **of**: (`value`) => `F`

Defined in: [testing/laws/types.ts:31](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L31)

Constructor function to wrap values in the functor.

#### Parameters

##### value

`A`

#### Returns

`F`

#### Example

```ts
ok, some, Just
```

***

### testCases?

> `optional` **testCases**: [`FunctorTestCase`](FunctorTestCase.md)\<`A`\>[]

Defined in: [testing/laws/types.ts:50](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L50)

Specific test cases to run.
If not provided, uses default test cases.

***

### type

> **type**: `string`

Defined in: [testing/laws/types.ts:24](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/testing/laws/types.ts#L24)

Name of the type being tested (for test descriptions).
