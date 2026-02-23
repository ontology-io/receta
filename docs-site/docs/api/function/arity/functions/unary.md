# Function: unary()

> **unary**\<`A`, `R`\>(`fn`): (`a`) => `R`

Defined in: [function/arity/index.ts:37](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/arity/index.ts#L37)

Creates a function that only accepts one argument, ignoring additional arguments.

This is useful when passing functions to higher-order functions that provide
multiple arguments, but you only want to use the first one.

## Type Parameters

### A

`A`

### R

`R`

## Parameters

### fn

(`a`, ...`rest`) => `R`

## Returns

> (`a`): `R`

### Parameters

#### a

`A`

### Returns

`R`

## Examples

```typescript
// parseInt takes two arguments, which causes issues with map
['1', '2', '3'].map(parseInt)           // => [1, NaN, NaN] (unexpected!)
['1', '2', '3'].map(unary(parseInt))    // => [1, 2, 3] (correct)
```

```typescript
const logFirst = unary(console.log)

['a', 'b', 'c'].forEach(logFirst)
// Logs:
// a
// b
// c
// (without indices or array)
```

```typescript
// Wrapping functions for cleaner callbacks
const parseNumber = unary(Number)
const inputs = ['42', '3.14', '100']

inputs.map(parseNumber)  // => [42, 3.14, 100]
```
