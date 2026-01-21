# API Reference

> Complete reference for all predicate functions.

## Quick Navigation

- [Decision Tree](#decision-tree)
- [Comparison Predicates](#comparison-predicates)
- [Combinators](#combinators)
- [Builders](#builders)
- [Type Guards](#type-guards)
- [Quick Lookup](#quick-lookup-table)
- [Cheat Sheet](#cheat-sheet)

---

## Decision Tree

**What do you want to do?**

```
Are you comparing a single value?
├─ YES → Use Comparison Predicates
│  ├─ Numbers: gt, gte, lt, lte, between
│  ├─ Values: eq, neq, oneOf
│  └─ Strings: startsWith, endsWith, includes, matches
│
├─ NO → Are you testing multiple fields on an object?
   ├─ YES → Use Builders
   │  ├─ Multiple fields: where({ field1: pred1, field2: pred2 })
   │  ├─ Single field: prop('field', predicate)
   │  ├─ Value in list: oneOf([val1, val2, val3])
   │  ├─ Derived value: by(selector, predicate)
   │  └─ Exact match: matchesShape({ field: value })
   │
   └─ NO → Are you combining predicates?
      ├─ YES → Use Combinators
      │  ├─ All must pass: and(pred1, pred2, pred3)
      │  ├─ Any can pass: or(pred1, pred2, pred3)
      │  ├─ Invert: not(predicate)
      │  └─ Exactly one: xor(pred1, pred2)
      │
      └─ NO → Are you checking types?
         └─ YES → Use Type Guards
            ├─ Primitives: isString, isNumber, isBoolean
            ├─ Nullish: isNull, isUndefined, isNullish, isDefined
            ├─ Structures: isArray, isObject, isFunction
            └─ Instances: isDate, isError, isPromise, isInstanceOf
```

---

## Comparison Predicates

### Numeric Comparisons

#### gt

```typescript
const gt = <T extends number | bigint>(threshold: T): Predicate<T>
```

Greater than (`>`).

```typescript
gt(18)(25)  // => true
gt(18)(18)  // => false
gt(18)(15)  // => false
```

**Use case**: Age requirements, minimum values, thresholds.

---

#### gte

```typescript
const gte = <T extends number | bigint>(threshold: T): Predicate<T>
```

Greater than or equal (`>=`).

```typescript
gte(18)(25)  // => true
gte(18)(18)  // => true
gte(18)(15)  // => false
```

**Use case**: Inclusive minimums, age checks, scores.

---

#### lt

```typescript
const lt = <T extends number | bigint>(threshold: T): Predicate<T>
```

Less than (`<`).

```typescript
lt(100)(50)   // => true
lt(100)(100)  // => false
lt(100)(150)  // => false
```

**Use case**: Budget limits, maximum values, capacity checks.

---

#### lte

```typescript
const lte = <T extends number | bigint>(threshold: T): Predicate<T>
```

Less than or equal (`<=`).

```typescript
lte(100)(50)   // => true
lte(100)(100)  // => true
lte(100)(150)  // => false
```

**Use case**: Inclusive maximums, price caps.

---

#### between

```typescript
const between = <T extends number | bigint>(min: T, max: T): Predicate<T>
```

Range check (inclusive on both ends).

```typescript
between(18, 65)(25)  // => true
between(18, 65)(18)  // => true
between(18, 65)(65)  // => true
between(18, 65)(70)  // => false
```

**Use case**: Age ranges, price ranges, working hours.

---

### Equality

#### eq

```typescript
const eq = <T>(value: T): Predicate<T>
```

Strict equality (`===`).

```typescript
eq('active')('active')  // => true
eq('active')('pending') // => false
eq(5)(5)                // => true
eq(5)('5')              // => false (different types)
```

**Use case**: Status checks, exact matching, flags.

---

#### neq

```typescript
const neq = <T>(value: T): Predicate<T>
```

Strict inequality (`!==`).

```typescript
neq(null)(undefined)  // => true
neq(null)(null)       // => false
neq('a')('b')         // => true
```

**Use case**: Exclude specific values, "not cancelled" checks.

---

### String Predicates

#### startsWith

```typescript
const startsWith = (prefix: string): Predicate<string>
```

String starts with prefix.

```typescript
startsWith('app')('application')  // => true
startsWith('app')('mobile')       // => false
```

**Use case**: File paths, prefixes, URL routing.

---

#### endsWith

```typescript
const endsWith = (suffix: string): Predicate<string>
```

String ends with suffix.

```typescript
endsWith('.ts')('app.ts')    // => true
endsWith('.ts')('app.js')    // => false
```

**Use case**: File extensions, domains, suffixes.

---

#### includes

```typescript
const includes = (substring: string): Predicate<string>
```

String contains substring.

```typescript
includes('error')('error: failed')  // => true
includes('error')('success')        // => false
```

**Use case**: Search, log filtering, text matching.

---

#### matches

```typescript
const matches = (regex: RegExp): Predicate<string>
```

String matches regex pattern.

```typescript
const isEmail = matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
isEmail('user@example.com')  // => true
isEmail('invalid')           // => false
```

**Use case**: Email validation, pattern matching, complex formats.

---

### Empty Checks

#### isEmpty

```typescript
const isEmpty: Predicate<string | unknown[] | Record<string, unknown>>
```

Check if string, array, or object is empty.

```typescript
isEmpty('')        // => true
isEmpty('hello')   // => false
isEmpty([])        // => true
isEmpty([1])       // => false
isEmpty({})        // => true
isEmpty({ a: 1 })  // => false
```

---

#### isNotEmpty

```typescript
const isNotEmpty: Predicate<string | unknown[] | Record<string, unknown>>
```

Check if not empty (inverse of isEmpty).

```typescript
isNotEmpty('hello')  // => true
isNotEmpty('')       // => false
isNotEmpty([1, 2])   // => true
isNotEmpty([])       // => false
```

---

## Combinators

### and

```typescript
const and = <T>(...predicates: Predicate<T>[]): Predicate<T>
```

Logical AND - all predicates must pass. Short-circuits on first false.

```typescript
and(gt(18), lt(65))(25)  // => true
and(gt(18), lt(65))(70)  // => false
```

**Use case**: Multiple conditions, range checks, compound requirements.

---

### or

```typescript
const or = <T>(...predicates: Predicate<T>[]): Predicate<T>
```

Logical OR - any predicate can pass. Short-circuits on first true.

```typescript
or(eq('admin'), eq('owner'))('admin')  // => true
or(eq('admin'), eq('owner'))('user')   // => false
```

**Use case**: Alternative values, fallbacks, multi-status checks.

---

### not

```typescript
const not = <T>(predicate: Predicate<T>): Predicate<T>
```

Logical NOT - inverts predicate result.

```typescript
not(isEmpty)('hello')  // => true
not(isEmpty)('')       // => false
```

**Use case**: Exclusions, inverse conditions, negation.

---

### xor

```typescript
const xor = <T>(...predicates: Predicate<T>[]): Predicate<T>
```

Exclusive OR - exactly one predicate must be true.

```typescript
xor(lt(10), gt(90))(5)    // => true (< 10)
xor(lt(10), gt(90))(95)   // => true (> 90)
xor(lt(10), gt(90))(50)   // => false (neither)
xor(lt(100), gt(0))(50)   // => false (both!)
```

**Use case**: Mutually exclusive features, either/or logic.

---

### always

```typescript
const always = <T>(): Predicate<T>
```

Always returns true.

```typescript
always()(anything)  // => true
```

**Use case**: Default predicates, conditional filtering, no-op cases.

---

### never

```typescript
const never = <T>(): Predicate<T>
```

Always returns false.

```typescript
never()(anything)  // => false
```

**Use case**: Disable filtering, reject all, maintenance mode.

---

## Builders

### where

```typescript
const where = <T extends Record<string, unknown>>(
  schema: PredicateSchema<T>
): Predicate<T>
```

Multi-field object predicate. All schema predicates must pass.

```typescript
where({
  age: gt(18),
  status: eq('active'),
  verified: Boolean
})({ age: 25, status: 'active', verified: true })  // => true
```

**Use case**: Database-like queries, multi-field validation, object filtering.

---

### oneOf

```typescript
const oneOf = <T>(values: readonly T[]): Predicate<T>
```

Check if value is in list (strict equality).

```typescript
oneOf(['admin', 'moderator'])('admin')  // => true
oneOf(['admin', 'moderator'])('user')   // => false
oneOf([1, 2, 3])(2)                     // => true
```

**Use case**: Whitelists, allowed values, multi-status checks.

---

### prop

```typescript
const prop = <T, K extends keyof T>(
  key: K,
  predicate: Predicate<T[K]>
): Predicate<T>
```

Test a specific property.

```typescript
prop('age', gt(18))({ age: 25, name: 'Alice' })  // => true
prop('age', gt(18))({ age: 15, name: 'Bob' })    // => false
```

**Use case**: Single-field checks, pipeline filtering, property access.

---

### matchesShape

```typescript
const matchesShape = <T extends Record<string, unknown>>(
  pattern: Partial<T>
): Predicate<T>
```

Exact shape matching (strict equality).

```typescript
matchesShape({ type: 'click' })({ type: 'click', x: 100 })  // => true
matchesShape({ type: 'click' })({ type: 'keypress' })       // => false
```

**Use case**: Event filtering, pattern matching, discriminated unions.

---

### hasProperty

```typescript
const hasProperty = <T extends Record<string, unknown>, K extends string>(
  key: K
): Predicate<T>
```

Check if object has property (regardless of value).

```typescript
hasProperty('email')({ email: 'a@b.c', name: 'A' })  // => true
hasProperty('email')({ name: 'A' })                  // => false
```

**Use case**: Optional fields, presence checks, object shape validation.

---

### satisfies

```typescript
const satisfies = <T>(predicate: Predicate<T>): Predicate<T>
```

Identity function for readability.

```typescript
satisfies((n: number) => n % 2 === 0)(4)  // => true
```

**Use case**: Inline predicates, custom logic, readability.

---

### by

```typescript
const by = <T, U>(
  selector: (value: T) => U,
  predicate: Predicate<U>
): Predicate<T>
```

Test derived/computed value.

```typescript
by((s: string) => s.length, gt(5))('hello')      // => false
by((s: string) => s.length, gt(5))('hello!')     // => true
by((arr: number[]) => arr.length, eq(0))([])     // => true
```

**Use case**: Array lengths, computed properties, derived values.

---

## Type Guards

### Primitives

#### isString

```typescript
const isString: TypePredicate<unknown, string>
```

Narrows to `string`.

```typescript
isString('hello')  // => true
isString(42)       // => false
```

---

#### isNumber

```typescript
const isNumber: TypePredicate<unknown, number>
```

Narrows to `number`. Excludes `NaN`.

```typescript
isNumber(42)    // => true
isNumber(NaN)   // => false
isNumber('42')  // => false
```

---

#### isFiniteNumber

```typescript
const isFiniteNumber: TypePredicate<unknown, number>
```

Narrows to finite `number`. Excludes `NaN`, `Infinity`, `-Infinity`.

```typescript
isFiniteNumber(42)         // => true
isFiniteNumber(Infinity)   // => false
isFiniteNumber(-Infinity)  // => false
isFiniteNumber(NaN)        // => false
```

---

#### isInteger

```typescript
const isInteger: TypePredicate<unknown, number>
```

Narrows to integer.

```typescript
isInteger(42)    // => true
isInteger(42.5)  // => false
```

---

#### isBoolean

```typescript
const isBoolean: TypePredicate<unknown, boolean>
```

Narrows to `boolean`.

```typescript
isBoolean(true)   // => true
isBoolean(1)      // => false
isBoolean('true') // => false
```

---

### Nullish

#### isNull

```typescript
const isNull: TypePredicate<unknown, null>
```

Exactly `null`.

```typescript
isNull(null)       // => true
isNull(undefined)  // => false
isNull(0)          // => false
```

---

#### isUndefined

```typescript
const isUndefined: TypePredicate<unknown, undefined>
```

Exactly `undefined`.

```typescript
isUndefined(undefined)  // => true
isUndefined(null)       // => false
```

---

#### isNullish

```typescript
const isNullish: TypePredicate<unknown, null | undefined>
```

`null` OR `undefined`.

```typescript
isNullish(null)       // => true
isNullish(undefined)  // => true
isNullish(0)          // => false
isNullish('')         // => false
```

---

#### isDefined

```typescript
const isDefined = <T>(value: T): value is NonNullable<T>
```

Not `null` or `undefined`.

```typescript
isDefined('hello')    // => true
isDefined(0)          // => true
isDefined(null)       // => false
isDefined(undefined)  // => false
```

---

### Structural

#### isArray

```typescript
const isArray: TypePredicate<unknown, unknown[]>
```

Narrows to array.

```typescript
isArray([1, 2, 3])  // => true
isArray('array')    // => false
```

---

#### isObject

```typescript
const isObject: TypePredicate<unknown, Record<string, unknown>>
```

Narrows to plain object (not array, not null).

```typescript
isObject({})         // => true
isObject({ a: 1 })   // => true
isObject([])         // => false
isObject(null)       // => false
```

---

#### isFunction

```typescript
const isFunction: TypePredicate<unknown, Function>
```

Narrows to function.

```typescript
isFunction(() => {})         // => true
isFunction(function() {})    // => true
isFunction('function')       // => false
```

---

### Instances

#### isDate

```typescript
const isDate: TypePredicate<unknown, Date>
```

Instance of `Date`.

```typescript
isDate(new Date())      // => true
isDate('2024-01-01')    // => false
```

---

#### isRegExp

```typescript
const isRegExp: TypePredicate<unknown, RegExp>
```

Instance of `RegExp`.

```typescript
isRegExp(/test/)            // => true
isRegExp(new RegExp('a'))   // => true
isRegExp('/test/')          // => false
```

---

#### isError

```typescript
const isError: TypePredicate<unknown, Error>
```

Instance of `Error`.

```typescript
isError(new Error('fail'))  // => true
isError('error')            // => false
```

---

#### isPromise

```typescript
const isPromise: TypePredicate<unknown, Promise<unknown>>
```

Instance of `Promise`.

```typescript
isPromise(Promise.resolve(1))  // => true
isPromise(async () => {})      // => false (function)
```

---

#### isInstanceOf

```typescript
const isInstanceOf = <T>(
  constructor: new (...args: any[]) => T
): TypePredicate<unknown, T>
```

Custom instance check.

```typescript
class User {}
const isUser = isInstanceOf(User)

isUser(new User())  // => true
isUser({})          // => false
```

---

## Quick Lookup Table

| Need | Function |
|------|----------|
| Number > threshold | `gt(threshold)` |
| Number >= threshold | `gte(threshold)` |
| Number < threshold | `lt(threshold)` |
| Number <= threshold | `lte(threshold)` |
| Number in range | `between(min, max)` |
| Exact value | `eq(value)` |
| Not this value | `neq(value)` |
| Value in list | `oneOf([...])` |
| String starts with | `startsWith(prefix)` |
| String ends with | `endsWith(suffix)` |
| String contains | `includes(substring)` |
| String matches regex | `matches(regex)` |
| Is empty | `isEmpty` |
| Is not empty | `isNotEmpty` |
| All conditions | `and(...)` |
| Any condition | `or(...)` |
| Invert condition | `not(pred)` |
| Exactly one true | `xor(...)` |
| Multiple fields | `where({ ... })` |
| Single field | `prop(key, pred)` |
| Derived value | `by(selector, pred)` |
| Exact shape | `matchesShape(pattern)` |
| Has property | `hasProperty(key)` |
| Is string | `isString` |
| Is number | `isNumber` |
| Is defined | `isDefined` |
| Is nullish | `isNullish` |
| Is array | `isArray` |
| Is object | `isObject` |

---

## Cheat Sheet

```typescript
// Comparison
gt(18)                      // > 18
gte(18)                     // >= 18
lt(100)                     // < 100
lte(100)                    // <= 100
between(18, 65)             // 18 <= x <= 65
eq('active')                // === 'active'
neq('cancelled')            // !== 'cancelled'
oneOf(['a', 'b', 'c'])      // in ['a', 'b', 'c']

// Strings
startsWith('app')           // starts with 'app'
endsWith('.ts')             // ends with '.ts'
includes('error')           // contains 'error'
matches(/^\d+$/)            // matches regex

// Combinators
and(pred1, pred2)           // pred1 AND pred2
or(pred1, pred2)            // pred1 OR pred2
not(pred)                   // NOT pred
xor(pred1, pred2)           // pred1 XOR pred2

// Builders
where({ age: gt(18) })      // Multi-field check
prop('age', gt(18))         // Single field
by(x => x.length, gt(5))    // Derived value

// Type Guards
isString                    // typeof === 'string'
isNumber                    // typeof === 'number'
isDefined                   // != null
isNullish                   // == null
isArray                     // Array.isArray
isObject                    // plain object
```

---

## Next Steps

- **[Overview](./00-overview.md)** - Introduction and motivation
- **[Common Patterns](./05-patterns.md)** - Real-world recipes
- **[Migration Guide](./06-migration.md)** - Refactoring guide
