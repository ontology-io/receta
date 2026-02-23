# Function: compose()

## Call Signature

> **compose**\<`A`, `B`\>(`fn1`): (`a`) => `B`

Defined in: [function/compose/index.ts:51](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/compose/index.ts#L51)

Composes functions from right to left.

Creates a new function that applies the given functions in reverse order,
passing the result of each function as input to the next.

This is the mathematical composition: (f ∘ g)(x) = f(g(x))

**Note**: For left-to-right composition (more common in data pipelines),
use Remeda's `pipe` function instead.

### Type Parameters

#### A

`A`

#### B

`B`

### Parameters

#### fn1

(`a`) => `B`

### Returns

> (`a`): `B`

#### Parameters

##### a

`A`

#### Returns

`B`

### Examples

```typescript
const addOne = (n: number) => n + 1
const double = (n: number) => n * 2
const square = (n: number) => n * n

const f = compose(square, double, addOne)
f(2)  // => square(double(addOne(2))) => square(double(3)) => square(6) => 36
```

```typescript
// String transformations
const exclaim = (s: string) => `${s}!`
const toUpper = (s: string) => s.toUpperCase()
const trim = (s: string) => s.trim()

const shout = compose(exclaim, toUpper, trim)
shout('  hello  ')  // => 'HELLO!'
```

```typescript
// For left-to-right, use pipe instead
import { pipe } from 'remeda'

const result = pipe(
  '  hello  ',
  trim,
  toUpper,
  exclaim
)
// => 'HELLO!'
```

### See

https://remedajs.com/docs#pipe - For left-to-right composition

## Call Signature

> **compose**\<`A`, `B`, `C`\>(`fn2`, `fn1`): (`a`) => `C`

Defined in: [function/compose/index.ts:52](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/compose/index.ts#L52)

Composes functions from right to left.

Creates a new function that applies the given functions in reverse order,
passing the result of each function as input to the next.

This is the mathematical composition: (f ∘ g)(x) = f(g(x))

**Note**: For left-to-right composition (more common in data pipelines),
use Remeda's `pipe` function instead.

### Type Parameters

#### A

`A`

#### B

`B`

#### C

`C`

### Parameters

#### fn2

(`b`) => `C`

#### fn1

(`a`) => `B`

### Returns

> (`a`): `C`

#### Parameters

##### a

`A`

#### Returns

`C`

### Examples

```typescript
const addOne = (n: number) => n + 1
const double = (n: number) => n * 2
const square = (n: number) => n * n

const f = compose(square, double, addOne)
f(2)  // => square(double(addOne(2))) => square(double(3)) => square(6) => 36
```

```typescript
// String transformations
const exclaim = (s: string) => `${s}!`
const toUpper = (s: string) => s.toUpperCase()
const trim = (s: string) => s.trim()

const shout = compose(exclaim, toUpper, trim)
shout('  hello  ')  // => 'HELLO!'
```

```typescript
// For left-to-right, use pipe instead
import { pipe } from 'remeda'

const result = pipe(
  '  hello  ',
  trim,
  toUpper,
  exclaim
)
// => 'HELLO!'
```

### See

https://remedajs.com/docs#pipe - For left-to-right composition

## Call Signature

> **compose**\<`A`, `B`, `C`, `D`\>(`fn3`, `fn2`, `fn1`): (`a`) => `D`

Defined in: [function/compose/index.ts:53](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/compose/index.ts#L53)

Composes functions from right to left.

Creates a new function that applies the given functions in reverse order,
passing the result of each function as input to the next.

This is the mathematical composition: (f ∘ g)(x) = f(g(x))

**Note**: For left-to-right composition (more common in data pipelines),
use Remeda's `pipe` function instead.

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

#### fn3

(`c`) => `D`

#### fn2

(`b`) => `C`

#### fn1

(`a`) => `B`

### Returns

> (`a`): `D`

#### Parameters

##### a

`A`

#### Returns

`D`

### Examples

```typescript
const addOne = (n: number) => n + 1
const double = (n: number) => n * 2
const square = (n: number) => n * n

const f = compose(square, double, addOne)
f(2)  // => square(double(addOne(2))) => square(double(3)) => square(6) => 36
```

```typescript
// String transformations
const exclaim = (s: string) => `${s}!`
const toUpper = (s: string) => s.toUpperCase()
const trim = (s: string) => s.trim()

const shout = compose(exclaim, toUpper, trim)
shout('  hello  ')  // => 'HELLO!'
```

```typescript
// For left-to-right, use pipe instead
import { pipe } from 'remeda'

const result = pipe(
  '  hello  ',
  trim,
  toUpper,
  exclaim
)
// => 'HELLO!'
```

### See

https://remedajs.com/docs#pipe - For left-to-right composition

## Call Signature

> **compose**\<`A`, `B`, `C`, `D`, `E`\>(`fn4`, `fn3`, `fn2`, `fn1`): (`a`) => `E`

Defined in: [function/compose/index.ts:58](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/compose/index.ts#L58)

Composes functions from right to left.

Creates a new function that applies the given functions in reverse order,
passing the result of each function as input to the next.

This is the mathematical composition: (f ∘ g)(x) = f(g(x))

**Note**: For left-to-right composition (more common in data pipelines),
use Remeda's `pipe` function instead.

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

#### fn4

(`d`) => `E`

#### fn3

(`c`) => `D`

#### fn2

(`b`) => `C`

#### fn1

(`a`) => `B`

### Returns

> (`a`): `E`

#### Parameters

##### a

`A`

#### Returns

`E`

### Examples

```typescript
const addOne = (n: number) => n + 1
const double = (n: number) => n * 2
const square = (n: number) => n * n

const f = compose(square, double, addOne)
f(2)  // => square(double(addOne(2))) => square(double(3)) => square(6) => 36
```

```typescript
// String transformations
const exclaim = (s: string) => `${s}!`
const toUpper = (s: string) => s.toUpperCase()
const trim = (s: string) => s.trim()

const shout = compose(exclaim, toUpper, trim)
shout('  hello  ')  // => 'HELLO!'
```

```typescript
// For left-to-right, use pipe instead
import { pipe } from 'remeda'

const result = pipe(
  '  hello  ',
  trim,
  toUpper,
  exclaim
)
// => 'HELLO!'
```

### See

https://remedajs.com/docs#pipe - For left-to-right composition

## Call Signature

> **compose**\<`A`, `B`, `C`, `D`, `E`, `F`\>(`fn5`, `fn4`, `fn3`, `fn2`, `fn1`): (`a`) => `F`

Defined in: [function/compose/index.ts:64](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/function/compose/index.ts#L64)

Composes functions from right to left.

Creates a new function that applies the given functions in reverse order,
passing the result of each function as input to the next.

This is the mathematical composition: (f ∘ g)(x) = f(g(x))

**Note**: For left-to-right composition (more common in data pipelines),
use Remeda's `pipe` function instead.

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

#### fn5

(`e`) => `F`

#### fn4

(`d`) => `E`

#### fn3

(`c`) => `D`

#### fn2

(`b`) => `C`

#### fn1

(`a`) => `B`

### Returns

> (`a`): `F`

#### Parameters

##### a

`A`

#### Returns

`F`

### Examples

```typescript
const addOne = (n: number) => n + 1
const double = (n: number) => n * 2
const square = (n: number) => n * n

const f = compose(square, double, addOne)
f(2)  // => square(double(addOne(2))) => square(double(3)) => square(6) => 36
```

```typescript
// String transformations
const exclaim = (s: string) => `${s}!`
const toUpper = (s: string) => s.toUpperCase()
const trim = (s: string) => s.trim()

const shout = compose(exclaim, toUpper, trim)
shout('  hello  ')  // => 'HELLO!'
```

```typescript
// For left-to-right, use pipe instead
import { pipe } from 'remeda'

const result = pipe(
  '  hello  ',
  trim,
  toUpper,
  exclaim
)
// => 'HELLO!'
```

### See

https://remedajs.com/docs#pipe - For left-to-right composition
