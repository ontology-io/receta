# Function: cartesianProduct()

## Call Signature

> **cartesianProduct**\<`A`, `B`\>(`arr1`, `arr2`): readonly \[`A`, `B`\][]

Defined in: [collection/cartesianProduct/index.ts:64](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/cartesianProduct/index.ts#L64)

Generates the Cartesian product of multiple arrays.

Creates all possible combinations by taking one element from each input array.
Useful for generating test matrices, A/B test variants, configuration combinations,
or any scenario requiring all possible combinations.

Type-safe for 2-5 arrays with specific tuple types, falls back to generic array
for more than 5 arrays.

### Type Parameters

#### A

`A`

#### B

`B`

### Parameters

#### arr1

readonly `A`[]

#### arr2

readonly `B`[]

### Returns

readonly \[`A`, `B`\][]

Array of tuples containing all combinations

### Example

```typescript
// Two arrays
cartesianProduct(['a', 'b'], [1, 2, 3])
// => [['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['b', 3]]

// Three arrays (A/B test variants)
const sizes = ['S', 'M', 'L']
const colors = ['red', 'blue']
const materials = ['cotton', 'polyester']

cartesianProduct(sizes, colors, materials)
// => [
//   ['S', 'red', 'cotton'],
//   ['S', 'red', 'polyester'],
//   ['S', 'blue', 'cotton'],
//   ['S', 'blue', 'polyester'],
//   ['M', 'red', 'cotton'],
//   ...
// ]

// Test matrix generation
const browsers = ['chrome', 'firefox', 'safari']
const platforms = ['mac', 'windows', 'linux']
const versions = ['v1', 'v2']

cartesianProduct(browsers, platforms, versions)
// => [
//   ['chrome', 'mac', 'v1'],
//   ['chrome', 'mac', 'v2'],
//   ['chrome', 'windows', 'v1'],
//   ...
// ]

// Configuration combinations
pipe(
  cartesianProduct(['dev', 'prod'], ['us', 'eu'], ['v1', 'v2']),
  R.map(([env, region, version]) => ({
    env,
    region,
    version,
    url: `https://${env}-${region}.example.com/${version}`
  }))
)
```

### See

zip - for pairing elements at same index

## Call Signature

> **cartesianProduct**\<`A`, `B`, `C`\>(`arr1`, `arr2`, `arr3`): readonly \[`A`, `B`, `C`\][]

Defined in: [collection/cartesianProduct/index.ts:69](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/cartesianProduct/index.ts#L69)

Generates the Cartesian product of multiple arrays.

Creates all possible combinations by taking one element from each input array.
Useful for generating test matrices, A/B test variants, configuration combinations,
or any scenario requiring all possible combinations.

Type-safe for 2-5 arrays with specific tuple types, falls back to generic array
for more than 5 arrays.

### Type Parameters

#### A

`A`

#### B

`B`

#### C

`C`

### Parameters

#### arr1

readonly `A`[]

#### arr2

readonly `B`[]

#### arr3

readonly `C`[]

### Returns

readonly \[`A`, `B`, `C`\][]

Array of tuples containing all combinations

### Example

```typescript
// Two arrays
cartesianProduct(['a', 'b'], [1, 2, 3])
// => [['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['b', 3]]

// Three arrays (A/B test variants)
const sizes = ['S', 'M', 'L']
const colors = ['red', 'blue']
const materials = ['cotton', 'polyester']

cartesianProduct(sizes, colors, materials)
// => [
//   ['S', 'red', 'cotton'],
//   ['S', 'red', 'polyester'],
//   ['S', 'blue', 'cotton'],
//   ['S', 'blue', 'polyester'],
//   ['M', 'red', 'cotton'],
//   ...
// ]

// Test matrix generation
const browsers = ['chrome', 'firefox', 'safari']
const platforms = ['mac', 'windows', 'linux']
const versions = ['v1', 'v2']

cartesianProduct(browsers, platforms, versions)
// => [
//   ['chrome', 'mac', 'v1'],
//   ['chrome', 'mac', 'v2'],
//   ['chrome', 'windows', 'v1'],
//   ...
// ]

// Configuration combinations
pipe(
  cartesianProduct(['dev', 'prod'], ['us', 'eu'], ['v1', 'v2']),
  R.map(([env, region, version]) => ({
    env,
    region,
    version,
    url: `https://${env}-${region}.example.com/${version}`
  }))
)
```

### See

zip - for pairing elements at same index

## Call Signature

> **cartesianProduct**\<`A`, `B`, `C`, `D`\>(`arr1`, `arr2`, `arr3`, `arr4`): readonly \[`A`, `B`, `C`, `D`\][]

Defined in: [collection/cartesianProduct/index.ts:75](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/cartesianProduct/index.ts#L75)

Generates the Cartesian product of multiple arrays.

Creates all possible combinations by taking one element from each input array.
Useful for generating test matrices, A/B test variants, configuration combinations,
or any scenario requiring all possible combinations.

Type-safe for 2-5 arrays with specific tuple types, falls back to generic array
for more than 5 arrays.

### Type Parameters

#### A

`A`

#### B

`B`

#### C

`C`

#### D

`D`

### Parameters

#### arr1

readonly `A`[]

#### arr2

readonly `B`[]

#### arr3

readonly `C`[]

#### arr4

readonly `D`[]

### Returns

readonly \[`A`, `B`, `C`, `D`\][]

Array of tuples containing all combinations

### Example

```typescript
// Two arrays
cartesianProduct(['a', 'b'], [1, 2, 3])
// => [['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['b', 3]]

// Three arrays (A/B test variants)
const sizes = ['S', 'M', 'L']
const colors = ['red', 'blue']
const materials = ['cotton', 'polyester']

cartesianProduct(sizes, colors, materials)
// => [
//   ['S', 'red', 'cotton'],
//   ['S', 'red', 'polyester'],
//   ['S', 'blue', 'cotton'],
//   ['S', 'blue', 'polyester'],
//   ['M', 'red', 'cotton'],
//   ...
// ]

// Test matrix generation
const browsers = ['chrome', 'firefox', 'safari']
const platforms = ['mac', 'windows', 'linux']
const versions = ['v1', 'v2']

cartesianProduct(browsers, platforms, versions)
// => [
//   ['chrome', 'mac', 'v1'],
//   ['chrome', 'mac', 'v2'],
//   ['chrome', 'windows', 'v1'],
//   ...
// ]

// Configuration combinations
pipe(
  cartesianProduct(['dev', 'prod'], ['us', 'eu'], ['v1', 'v2']),
  R.map(([env, region, version]) => ({
    env,
    region,
    version,
    url: `https://${env}-${region}.example.com/${version}`
  }))
)
```

### See

zip - for pairing elements at same index

## Call Signature

> **cartesianProduct**\<`A`, `B`, `C`, `D`, `E`\>(`arr1`, `arr2`, `arr3`, `arr4`, `arr5`): readonly \[`A`, `B`, `C`, `D`, `E`\][]

Defined in: [collection/cartesianProduct/index.ts:82](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/cartesianProduct/index.ts#L82)

Generates the Cartesian product of multiple arrays.

Creates all possible combinations by taking one element from each input array.
Useful for generating test matrices, A/B test variants, configuration combinations,
or any scenario requiring all possible combinations.

Type-safe for 2-5 arrays with specific tuple types, falls back to generic array
for more than 5 arrays.

### Type Parameters

#### A

`A`

#### B

`B`

#### C

`C`

#### D

`D`

#### E

`E`

### Parameters

#### arr1

readonly `A`[]

#### arr2

readonly `B`[]

#### arr3

readonly `C`[]

#### arr4

readonly `D`[]

#### arr5

readonly `E`[]

### Returns

readonly \[`A`, `B`, `C`, `D`, `E`\][]

Array of tuples containing all combinations

### Example

```typescript
// Two arrays
cartesianProduct(['a', 'b'], [1, 2, 3])
// => [['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['b', 3]]

// Three arrays (A/B test variants)
const sizes = ['S', 'M', 'L']
const colors = ['red', 'blue']
const materials = ['cotton', 'polyester']

cartesianProduct(sizes, colors, materials)
// => [
//   ['S', 'red', 'cotton'],
//   ['S', 'red', 'polyester'],
//   ['S', 'blue', 'cotton'],
//   ['S', 'blue', 'polyester'],
//   ['M', 'red', 'cotton'],
//   ...
// ]

// Test matrix generation
const browsers = ['chrome', 'firefox', 'safari']
const platforms = ['mac', 'windows', 'linux']
const versions = ['v1', 'v2']

cartesianProduct(browsers, platforms, versions)
// => [
//   ['chrome', 'mac', 'v1'],
//   ['chrome', 'mac', 'v2'],
//   ['chrome', 'windows', 'v1'],
//   ...
// ]

// Configuration combinations
pipe(
  cartesianProduct(['dev', 'prod'], ['us', 'eu'], ['v1', 'v2']),
  R.map(([env, region, version]) => ({
    env,
    region,
    version,
    url: `https://${env}-${region}.example.com/${version}`
  }))
)
```

### See

zip - for pairing elements at same index

## Call Signature

> **cartesianProduct**\<`T`\>(...`arrays`): readonly `T`[][]

Defined in: [collection/cartesianProduct/index.ts:91](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/collection/cartesianProduct/index.ts#L91)

Generates the Cartesian product of multiple arrays.

Creates all possible combinations by taking one element from each input array.
Useful for generating test matrices, A/B test variants, configuration combinations,
or any scenario requiring all possible combinations.

Type-safe for 2-5 arrays with specific tuple types, falls back to generic array
for more than 5 arrays.

### Type Parameters

#### T

`T`

### Parameters

#### arrays

...readonly readonly `T`[][]

Two or more arrays to combine

### Returns

readonly `T`[][]

Array of tuples containing all combinations

### Example

```typescript
// Two arrays
cartesianProduct(['a', 'b'], [1, 2, 3])
// => [['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['b', 3]]

// Three arrays (A/B test variants)
const sizes = ['S', 'M', 'L']
const colors = ['red', 'blue']
const materials = ['cotton', 'polyester']

cartesianProduct(sizes, colors, materials)
// => [
//   ['S', 'red', 'cotton'],
//   ['S', 'red', 'polyester'],
//   ['S', 'blue', 'cotton'],
//   ['S', 'blue', 'polyester'],
//   ['M', 'red', 'cotton'],
//   ...
// ]

// Test matrix generation
const browsers = ['chrome', 'firefox', 'safari']
const platforms = ['mac', 'windows', 'linux']
const versions = ['v1', 'v2']

cartesianProduct(browsers, platforms, versions)
// => [
//   ['chrome', 'mac', 'v1'],
//   ['chrome', 'mac', 'v2'],
//   ['chrome', 'windows', 'v1'],
//   ...
// ]

// Configuration combinations
pipe(
  cartesianProduct(['dev', 'prod'], ['us', 'eu'], ['v1', 'v2']),
  R.map(([env, region, version]) => ({
    env,
    region,
    version,
    url: `https://${env}-${region}.example.com/${version}`
  }))
)
```

### See

zip - for pairing elements at same index
