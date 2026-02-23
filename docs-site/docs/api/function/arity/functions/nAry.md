# Function: nAry()

> **nAry**\<`R`\>(`n`, `fn`): (...`args`) => `R`

Defined in: [function/arity/index.ts:114](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/arity/index.ts#L114)

Creates a function that only accepts N arguments, ignoring additional arguments.

This is the generalized version of `unary` and `binary`, allowing you to specify
exactly how many arguments should be accepted.

## Type Parameters

### R

`R`

## Parameters

### n

`number`

### fn

(...`args`) => `R`

## Returns

> (...`args`): `R`

### Parameters

#### args

...`any`[]

### Returns

`R`

## Examples

```typescript
const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)

const sumTwo = nAry(2, sum)
sumTwo(1, 2, 3, 4, 5)  // => 3 (only sums first two)

const sumThree = nAry(3, sum)
sumThree(1, 2, 3, 4, 5)  // => 6 (only sums first three)
```

```typescript
// Controlling variadic functions
const max = (...nums: number[]) => Math.max(...nums)

const maxOfTwo = nAry(2, max)
maxOfTwo(5, 10, 2, 8)  // => 10 (only considers first two)
```

```typescript
// Creating specialized versions
const log = (...args: any[]) => console.log(...args)

const logOne = nAry(1, log)
const logThree = nAry(3, log)

logOne('a', 'b', 'c')      // Logs: a
logThree('a', 'b', 'c', 'd')  // Logs: a b c
```
