# Function: matches()

> **matches**(`pattern`): [`Predicate`](../../types/type-aliases/Predicate.md)\<`string`\>

Defined in: [predicate/comparison/index.ts:283](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/predicate/comparison/index.ts#L283)

Creates a predicate that tests if a string matches a regular expression.

## Parameters

### pattern

`RegExp`

The regular expression to test against

## Returns

[`Predicate`](../../types/type-aliases/Predicate.md)\<`string`\>

A predicate that returns true if value matches pattern

## Example

```typescript
import * as R from 'remeda'

const emails = ['alice@example.com', 'invalid-email', 'bob@test.org']
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
R.filter(emails, matches(emailPattern)) // => valid emails

// Real-world: Validate input format
const phoneNumbers = ['+1-555-0100', '555-0100', 'not-a-phone']
R.filter(phoneNumbers, matches(/^\+?\d{1,3}-\d{3}-\d{4}$/))
// => ['+1-555-0100', '555-0100']
```

## See

includes - for simple substring testing
