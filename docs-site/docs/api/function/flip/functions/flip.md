# Function: flip()

## Call Signature

> **flip**\<`A`, `B`, `R`\>(`fn`): (`b`, `a`) => `R`

Defined in: [function/flip/index.ts:36](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/flip/index.ts#L36)

Creates a function that reverses the order of the first two arguments.

This is useful when you have a function with arguments in an inconvenient order
for partial application or piping.

### Type Parameters

#### A

`A`

#### B

`B`

#### R

`R`

### Parameters

#### fn

(`a`, `b`) => `R`

### Returns

> (`b`, `a`): `R`

#### Parameters

##### b

`B`

##### a

`A`

#### Returns

`R`

### Examples

```typescript
const divide = (a: number, b: number) => a / b
const divideBy = flip(divide)

divide(10, 2)      // => 5
divideBy(2, 10)    // => 5  (same as divide(10, 2))
```

```typescript
// Useful for partial application
const subtract = (a: number, b: number) => a - b
const subtractFrom = flip(subtract)

const subtractFrom10 = (n: number) => subtractFrom(n, 10)
subtractFrom10(3)  // => 7  (10 - 3)
```

```typescript
// With object methods
const concat = (a: string, b: string) => a + b
const append = flip(concat)

concat('hello', ' world')   // => 'hello world'
append(' world', 'hello')   // => 'hello world'
```

## Call Signature

> **flip**\<`A`, `B`, `C`, `R`\>(`fn`): (`b`, `a`, `c`) => `R`

Defined in: [function/flip/index.ts:37](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/flip/index.ts#L37)

Creates a function that reverses the order of the first two arguments.

This is useful when you have a function with arguments in an inconvenient order
for partial application or piping.

### Type Parameters

#### A

`A`

#### B

`B`

#### C

`C`

#### R

`R`

### Parameters

#### fn

(`a`, `b`, `c`) => `R`

### Returns

> (`b`, `a`, `c`): `R`

#### Parameters

##### b

`B`

##### a

`A`

##### c

`C`

#### Returns

`R`

### Examples

```typescript
const divide = (a: number, b: number) => a / b
const divideBy = flip(divide)

divide(10, 2)      // => 5
divideBy(2, 10)    // => 5  (same as divide(10, 2))
```

```typescript
// Useful for partial application
const subtract = (a: number, b: number) => a - b
const subtractFrom = flip(subtract)

const subtractFrom10 = (n: number) => subtractFrom(n, 10)
subtractFrom10(3)  // => 7  (10 - 3)
```

```typescript
// With object methods
const concat = (a: string, b: string) => a + b
const append = flip(concat)

concat('hello', ' world')   // => 'hello world'
append(' world', 'hello')   // => 'hello world'
```

## Call Signature

> **flip**\<`A`, `B`, `C`, `D`, `R`\>(`fn`): (`b`, `a`, `c`, `d`) => `R`

Defined in: [function/flip/index.ts:38](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/flip/index.ts#L38)

Creates a function that reverses the order of the first two arguments.

This is useful when you have a function with arguments in an inconvenient order
for partial application or piping.

### Type Parameters

#### A

`A`

#### B

`B`

#### C

`C`

#### D

`D`

#### R

`R`

### Parameters

#### fn

(`a`, `b`, `c`, `d`) => `R`

### Returns

> (`b`, `a`, `c`, `d`): `R`

#### Parameters

##### b

`B`

##### a

`A`

##### c

`C`

##### d

`D`

#### Returns

`R`

### Examples

```typescript
const divide = (a: number, b: number) => a / b
const divideBy = flip(divide)

divide(10, 2)      // => 5
divideBy(2, 10)    // => 5  (same as divide(10, 2))
```

```typescript
// Useful for partial application
const subtract = (a: number, b: number) => a - b
const subtractFrom = flip(subtract)

const subtractFrom10 = (n: number) => subtractFrom(n, 10)
subtractFrom10(3)  // => 7  (10 - 3)
```

```typescript
// With object methods
const concat = (a: string, b: string) => a + b
const append = flip(concat)

concat('hello', ' world')   // => 'hello world'
append(' world', 'hello')   // => 'hello world'
```
