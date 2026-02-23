# Function: partial()

## Call Signature

> **partial**\<`Args`, `R`\>(`fn`): (...`args`) => `R`

Defined in: [function/partial/index.ts:40](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/partial/index.ts#L40)

Creates a partially applied function by pre-filling arguments from the left.

Returns a new function that, when called, invokes the original function with
the pre-filled arguments followed by any new arguments.

### Type Parameters

#### Args

`Args` *extends* readonly `any`[]

#### R

`R`

### Parameters

#### fn

(...`args`) => `R`

### Returns

> (...`args`): `R`

#### Parameters

##### args

...`Args`

#### Returns

`R`

### Examples

```typescript
const greet = (greeting: string, name: string) => `${greeting}, ${name}!`

const sayHello = partial(greet, 'Hello')
sayHello('Alice')    // => 'Hello, Alice!'
sayHello('Bob')      // => 'Hello, Bob!'
```

```typescript
// Multiple arguments
const multiply = (a: number, b: number, c: number) => a * b * c

const double = partial(multiply, 2)
double(3, 4)         // => 24  (2 * 3 * 4)

const quadruple = partial(multiply, 2, 2)
quadruple(5)         // => 20  (2 * 2 * 5)
```

```typescript
// Creating specialized functions
const log = (level: string, module: string, message: string) =>
  `[${level}] ${module}: ${message}`

const logError = partial(log, 'ERROR')
const logUserError = partial(log, 'ERROR', 'UserModule')

logUserError('Invalid input')  // => '[ERROR] UserModule: Invalid input'
```

## Call Signature

> **partial**\<`Args`, `R`\>(`fn`, ...`prefilledArgs`): (...`args`) => `R`

Defined in: [function/partial/index.ts:43](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/partial/index.ts#L43)

Creates a partially applied function by pre-filling arguments from the left.

Returns a new function that, when called, invokes the original function with
the pre-filled arguments followed by any new arguments.

### Type Parameters

#### Args

`Args` *extends* readonly `any`[]

#### R

`R`

### Parameters

#### fn

(...`args`) => `R`

#### prefilledArgs

...`any`[]

### Returns

> (...`args`): `R`

#### Parameters

##### args

...`any`[]

#### Returns

`R`

### Examples

```typescript
const greet = (greeting: string, name: string) => `${greeting}, ${name}!`

const sayHello = partial(greet, 'Hello')
sayHello('Alice')    // => 'Hello, Alice!'
sayHello('Bob')      // => 'Hello, Bob!'
```

```typescript
// Multiple arguments
const multiply = (a: number, b: number, c: number) => a * b * c

const double = partial(multiply, 2)
double(3, 4)         // => 24  (2 * 3 * 4)

const quadruple = partial(multiply, 2, 2)
quadruple(5)         // => 20  (2 * 2 * 5)
```

```typescript
// Creating specialized functions
const log = (level: string, module: string, message: string) =>
  `[${level}] ${module}: ${message}`

const logError = partial(log, 'ERROR')
const logUserError = partial(log, 'ERROR', 'UserModule')

logUserError('Invalid input')  // => '[ERROR] UserModule: Invalid input'
```
