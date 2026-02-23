# Function: pipeAsync()

## Call Signature

> **pipeAsync**\<`A`, `B`\>(`value`, `fn1`): `Promise`\<`B`\>

Defined in: [async/pipeAsync/index.ts:70](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L70)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

### Type Parameters

#### A

`A`

#### B

`B`

### Parameters

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

### Returns

`Promise`\<`B`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`\>(`value`, `fn1`, `fn2`): `Promise`\<`C`\>

Defined in: [async/pipeAsync/index.ts:75](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L75)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

### Type Parameters

#### A

`A`

#### B

`B`

#### C

`C`

### Parameters

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

### Returns

`Promise`\<`C`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`\>(`value`, `fn1`, `fn2`, `fn3`): `Promise`\<`D`\>

Defined in: [async/pipeAsync/index.ts:81](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L81)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

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

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

#### fn3

(`c`) => `D` \| `Promise`\<`D`\>

### Returns

`Promise`\<`D`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`\>(`value`, `fn1`, `fn2`, `fn3`, `fn4`): `Promise`\<`E`\>

Defined in: [async/pipeAsync/index.ts:88](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L88)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

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

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

#### fn3

(`c`) => `D` \| `Promise`\<`D`\>

#### fn4

(`d`) => `E` \| `Promise`\<`E`\>

### Returns

`Promise`\<`E`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`\>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`): `Promise`\<`F`\>

Defined in: [async/pipeAsync/index.ts:96](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L96)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

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

#### F

`F`

### Parameters

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

#### fn3

(`c`) => `D` \| `Promise`\<`D`\>

#### fn4

(`d`) => `E` \| `Promise`\<`E`\>

#### fn5

(`e`) => `F` \| `Promise`\<`F`\>

### Returns

`Promise`\<`F`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`\>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`): `Promise`\<`G`\>

Defined in: [async/pipeAsync/index.ts:105](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L105)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

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

#### F

`F`

#### G

`G`

### Parameters

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

#### fn3

(`c`) => `D` \| `Promise`\<`D`\>

#### fn4

(`d`) => `E` \| `Promise`\<`E`\>

#### fn5

(`e`) => `F` \| `Promise`\<`F`\>

#### fn6

(`f`) => `G` \| `Promise`\<`G`\>

### Returns

`Promise`\<`G`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`\>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`): `Promise`\<`H`\>

Defined in: [async/pipeAsync/index.ts:115](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L115)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

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

#### F

`F`

#### G

`G`

#### H

`H`

### Parameters

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

#### fn3

(`c`) => `D` \| `Promise`\<`D`\>

#### fn4

(`d`) => `E` \| `Promise`\<`E`\>

#### fn5

(`e`) => `F` \| `Promise`\<`F`\>

#### fn6

(`f`) => `G` \| `Promise`\<`G`\>

#### fn7

(`g`) => `H` \| `Promise`\<`H`\>

### Returns

`Promise`\<`H`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`\>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`): `Promise`\<`I`\>

Defined in: [async/pipeAsync/index.ts:126](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L126)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

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

#### F

`F`

#### G

`G`

#### H

`H`

#### I

`I`

### Parameters

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

#### fn3

(`c`) => `D` \| `Promise`\<`D`\>

#### fn4

(`d`) => `E` \| `Promise`\<`E`\>

#### fn5

(`e`) => `F` \| `Promise`\<`F`\>

#### fn6

(`f`) => `G` \| `Promise`\<`G`\>

#### fn7

(`g`) => `H` \| `Promise`\<`H`\>

#### fn8

(`h`) => `I` \| `Promise`\<`I`\>

### Returns

`Promise`\<`I`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`\>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`, `fn9`): `Promise`\<`J`\>

Defined in: [async/pipeAsync/index.ts:138](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L138)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

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

#### F

`F`

#### G

`G`

#### H

`H`

#### I

`I`

#### J

`J`

### Parameters

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

#### fn3

(`c`) => `D` \| `Promise`\<`D`\>

#### fn4

(`d`) => `E` \| `Promise`\<`E`\>

#### fn5

(`e`) => `F` \| `Promise`\<`F`\>

#### fn6

(`f`) => `G` \| `Promise`\<`G`\>

#### fn7

(`g`) => `H` \| `Promise`\<`H`\>

#### fn8

(`h`) => `I` \| `Promise`\<`I`\>

#### fn9

(`i`) => `J` \| `Promise`\<`J`\>

### Returns

`Promise`\<`J`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function

## Call Signature

> **pipeAsync**\<`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`, `K`\>(`value`, `fn1`, `fn2`, `fn3`, `fn4`, `fn5`, `fn6`, `fn7`, `fn8`, `fn9`, `fn10`): `Promise`\<`K`\>

Defined in: [async/pipeAsync/index.ts:151](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/pipeAsync/index.ts#L151)

Composes async functions from left to right.

Like Remeda's `pipe`, but handles async functions by awaiting each step
before passing the result to the next function. Useful for chaining
async transformations in a readable, sequential manner.

**Note**: All functions are executed sequentially (not in parallel).
For parallel execution, use `parallel` or `mapAsync`.

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

#### F

`F`

#### G

`G`

#### H

`H`

#### I

`I`

#### J

`J`

#### K

`K`

### Parameters

#### value

`A`

#### fn1

(`a`) => `B` \| `Promise`\<`B`\>

#### fn2

(`b`) => `C` \| `Promise`\<`C`\>

#### fn3

(`c`) => `D` \| `Promise`\<`D`\>

#### fn4

(`d`) => `E` \| `Promise`\<`E`\>

#### fn5

(`e`) => `F` \| `Promise`\<`F`\>

#### fn6

(`f`) => `G` \| `Promise`\<`G`\>

#### fn7

(`g`) => `H` \| `Promise`\<`H`\>

#### fn8

(`h`) => `I` \| `Promise`\<`I`\>

#### fn9

(`i`) => `J` \| `Promise`\<`J`\>

#### fn10

(`j`) => `K` \| `Promise`\<`K`\>

### Returns

`Promise`\<`K`\>

### Examples

```typescript
// Sequential API calls
const result = await pipeAsync(
  userId,
  (id) => fetchUser(id),
  (user) => fetchUserPosts(user.id),
  (posts) => posts.filter(p => p.published),
  (posts) => posts.map(p => p.title)
)
// => ['Post 1', 'Post 2', ...]
```

```typescript
// Mix sync and async functions
const processOrder = await pipeAsync(
  orderId,
  (id) => fetchOrder(id),          // async
  (order) => order.items,          // sync
  async (items) => {               // async
    const prices = await Promise.all(items.map(getPriceAsync))
    return prices
  },
  (prices) => prices.reduce((a, b) => a + b, 0)  // sync
)
```

```typescript
// Error handling with Result pattern
import { tryCatchAsync, map, unwrapOr } from 'receta/result'

const safeResult = await pipeAsync(
  userId,
  (id) => tryCatchAsync(() => fetchUser(id)),
  (userResult) => map(userResult, u => u.email)
)
const email = unwrapOr(safeResult, 'unknown@example.com')
```

```typescript
// Data transformation pipeline
const report = await pipeAsync(
  'raw-data.json',
  (file) => fs.readFile(file, 'utf-8'),
  (content) => JSON.parse(content),
  async (data) => {
    const enriched = await enrichData(data)
    return enriched
  },
  (data) => generateReport(data)
)
```

### See

 - sequential - for executing an array of async tasks in order
 - https://remedajs.com/docs#pipe - Remeda's sync pipe function
