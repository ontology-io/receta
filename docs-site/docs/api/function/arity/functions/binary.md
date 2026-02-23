# Function: binary()

> **binary**\<`A`, `B`, `R`\>(`fn`): (`a`, `b`) => `R`

Defined in: [function/arity/index.ts:70](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/arity/index.ts#L70)

Creates a function that only accepts two arguments, ignoring additional arguments.

This is useful when you want to limit the number of arguments passed to a function
in callbacks or higher-order functions.

## Type Parameters

### A

`A`

### B

`B`

### R

`R`

## Parameters

### fn

(`a`, `b`, ...`rest`) => `R`

## Returns

> (`a`, `b`): `R`

### Parameters

#### a

`A`

#### b

`B`

### Returns

`R`

## Examples

```typescript
const add = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)

add(1, 2, 3, 4)           // => 10
binary(add)(1, 2, 3, 4)   // => 3 (only uses first two)
```

```typescript
// Limiting callback arguments
const logTwo = binary(console.log)

['a', 'b', 'c'].forEach(logTwo)
// Logs:
// a 0
// b 1
// c 2
// (ignores array parameter)
```
