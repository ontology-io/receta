# predicate

Predicate module - Composable predicates for filtering, validation, and type narrowing.

Predicates are functions that take a value and return a boolean.
They can be composed using combinators like `and`, `or`, and `not`.

## Example

```typescript
import * as R from 'remeda'
import { gt, lt, and, where } from 'receta/predicate'

// Basic filtering
const numbers = [1, 5, 10, 15, 20]
R.filter(numbers, and(gt(5), lt(15))) // => [10]

// Object filtering
const users = [
  { age: 25, active: true },
  { age: 17, active: true },
  { age: 30, active: false }
]
R.filter(users, where({
  age: gt(18),
  active: Boolean
})) // => [{ age: 25, active: true }]
```

## References

### always

Re-exports [always](combinators/functions/always.md)

***

### and

Re-exports [and](combinators/functions/and.md)

***

### between

Re-exports [between](comparison/functions/between.md)

***

### by

Re-exports [by](builders/functions/by.md)

***

### endsWith

Re-exports [endsWith](comparison/functions/endsWith.md)

***

### eq

Re-exports [eq](comparison/functions/eq.md)

***

### gt

Re-exports [gt](comparison/functions/gt.md)

***

### gte

Re-exports [gte](comparison/functions/gte.md)

***

### hasProperty

Re-exports [hasProperty](builders/functions/hasProperty.md)

***

### includes

Re-exports [includes](comparison/functions/includes.md)

***

### isArray

Re-exports [isArray](guards/variables/isArray.md)

***

### isBoolean

Re-exports [isBoolean](guards/variables/isBoolean.md)

***

### isDate

Re-exports [isDate](guards/variables/isDate.md)

***

### isDefined

Re-exports [isDefined](guards/functions/isDefined.md)

***

### isEmpty

Re-exports [isEmpty](comparison/variables/isEmpty.md)

***

### isError

Re-exports [isError](guards/variables/isError.md)

***

### isFiniteNumber

Re-exports [isFiniteNumber](guards/variables/isFiniteNumber.md)

***

### isFunction

Re-exports [isFunction](guards/variables/isFunction.md)

***

### isInstanceOf

Re-exports [isInstanceOf](guards/functions/isInstanceOf.md)

***

### isInteger

Re-exports [isInteger](guards/variables/isInteger.md)

***

### isNotEmpty

Re-exports [isNotEmpty](comparison/variables/isNotEmpty.md)

***

### isNull

Re-exports [isNull](guards/variables/isNull.md)

***

### isNullish

Re-exports [isNullish](guards/variables/isNullish.md)

***

### isNumber

Re-exports [isNumber](guards/variables/isNumber.md)

***

### isObject

Re-exports [isObject](guards/variables/isObject.md)

***

### isPromise

Re-exports [isPromise](guards/variables/isPromise.md)

***

### isRegExp

Re-exports [isRegExp](guards/variables/isRegExp.md)

***

### isString

Re-exports [isString](guards/variables/isString.md)

***

### isUndefined

Re-exports [isUndefined](guards/variables/isUndefined.md)

***

### lt

Re-exports [lt](comparison/functions/lt.md)

***

### lte

Re-exports [lte](comparison/functions/lte.md)

***

### matches

Re-exports [matches](comparison/functions/matches.md)

***

### matchesShape

Re-exports [matchesShape](builders/functions/matchesShape.md)

***

### neq

Re-exports [neq](comparison/functions/neq.md)

***

### never

Re-exports [never](combinators/functions/never.md)

***

### not

Re-exports [not](combinators/functions/not.md)

***

### oneOf

Re-exports [oneOf](builders/functions/oneOf.md)

***

### or

Re-exports [or](combinators/functions/or.md)

***

### Predicate

Re-exports [Predicate](types/type-aliases/Predicate.md)

***

### PredicateSchema

Re-exports [PredicateSchema](types/type-aliases/PredicateSchema.md)

***

### prop

Re-exports [prop](builders/functions/prop.md)

***

### satisfies

Re-exports [satisfies](builders/functions/satisfies.md)

***

### startsWith

Re-exports [startsWith](comparison/functions/startsWith.md)

***

### TypePredicate

Re-exports [TypePredicate](types/type-aliases/TypePredicate.md)

***

### where

Re-exports [where](builders/functions/where.md)

***

### xor

Re-exports [xor](combinators/functions/xor.md)
