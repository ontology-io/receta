# Function: partition()

## Call Signature

> **partition**\<`T`\>(`options`): \[`T`[], `number`\]

Defined in: [option/partition/index.ts:34](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/partition/index.ts#L34)

Partitions an array of Options into Some values and count of Nones.

Returns a tuple of [Some values[], None count].

### Type Parameters

#### T

`T`

### Parameters

#### options

readonly [`Option`](../../types/type-aliases/Option.md)\<`T`\>[]

Array of Options to partition

### Returns

\[`T`[], `number`\]

Tuple of [values from Some, count of None]

### Example

```typescript
const results = [some(1), none(), some(2), none(), some(3)]

partition(results)
// => [[1, 2, 3], 2]

// Real-world: processing batch operations
const processUsers = async (ids: string[]) => {
  const results = await Promise.all(
    ids.map(id => fetchUser(id))
  )

  const [users, failedCount] = partition(results)
  console.log(`Processed ${users.length}, failed ${failedCount}`)
  return users
}
```

### See

collect - for requiring all to be Some

## Call Signature

> **partition**\<`T`\>(): (`options`) => \[`T`[], `number`\]

Defined in: [option/partition/index.ts:35](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/option/partition/index.ts#L35)

Partitions an array of Options into Some values and count of Nones.

Returns a tuple of [Some values[], None count].

### Type Parameters

#### T

`T`

### Returns

Tuple of [values from Some, count of None]

> (`options`): \[`T`[], `number`\]

#### Parameters

##### options

readonly [`Option`](../../types/type-aliases/Option.md)\<`T`\>[]

#### Returns

\[`T`[], `number`\]

### Example

```typescript
const results = [some(1), none(), some(2), none(), some(3)]

partition(results)
// => [[1, 2, 3], 2]

// Real-world: processing batch operations
const processUsers = async (ids: string[]) => {
  const results = await Promise.all(
    ids.map(id => fetchUser(id))
  )

  const [users, failedCount] = partition(results)
  console.log(`Processed ${users.length}, failed ${failedCount}`)
  return users
}
```

### See

collect - for requiring all to be Some
