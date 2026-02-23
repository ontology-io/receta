# validation

Validation module - Data validation with error accumulation.

The Validation type is similar to Result but optimized for error accumulation.
While Result short-circuits on the first error (fail-fast), Validation accumulates
all errors (fail-slow), making it ideal for form validation and multi-field data validation.

## Example

```typescript
import { valid, invalid, validate, schema } from 'receta/validation'

// Single field validation with multiple rules
const validatePassword = (password: string) =>
  validate(password, [
    fromPredicate(s => s.length >= 8, 'At least 8 characters'),
    fromPredicate(s => /[A-Z]/.test(s), 'At least one uppercase'),
    fromPredicate(s => /[0-9]/.test(s), 'At least one number')
  ])

// Multi-field validation (accumulates all errors)
const userSchema = schema({
  name: pipe(required, minLength(3)),
  email: pipe(required, email),
  age: pipe(required, min(18))
})

// Returns all field errors at once, not just the first one
validateForm(formData) // => Invalid([...all errors...])
```

## References

### alphanumeric

Re-exports [alphanumeric](validators/functions/alphanumeric.md)

***

### between

Re-exports [between](validators/functions/between.md)

***

### collectErrors

Re-exports [collectErrors](collectErrors/functions/collectErrors.md)

***

### defined

Re-exports [defined](validators/functions/defined.md)

***

### email

Re-exports [email](validators/functions/email.md)

***

### equals

Re-exports [equals](validators/functions/equals.md)

***

### FieldError

Re-exports [FieldError](types/interfaces/FieldError.md)

***

### finite

Re-exports [finite](validators/functions/finite.md)

***

### flatMap

Re-exports [flatMap](flatMap/functions/flatMap.md)

***

### flatten

Re-exports [flatten](flatten/functions/flatten.md)

***

### fromPredicate

Re-exports [fromPredicate](constructors/functions/fromPredicate.md)

***

### fromPredicateWithError

Re-exports [fromPredicateWithError](constructors/functions/fromPredicateWithError.md)

***

### fromResult

Re-exports [fromResult](constructors/functions/fromResult.md)

***

### integer

Re-exports [integer](validators/functions/integer.md)

***

### invalid

Re-exports [invalid](constructors/functions/invalid.md)

***

### Invalid

Re-exports [Invalid](types/interfaces/Invalid.md)

***

### isInvalid

Re-exports [isInvalid](guards/functions/isInvalid.md)

***

### isValid

Re-exports [isValid](guards/functions/isValid.md)

***

### lengthBetween

Re-exports [lengthBetween](validators/functions/lengthBetween.md)

***

### map

Re-exports [map](map/functions/map.md)

***

### mapInvalid

Re-exports [mapInvalid](mapInvalid/functions/mapInvalid.md)

***

### match

Re-exports [match](match/functions/match.md)

***

### matches

Re-exports [matches](validators/functions/matches.md)

***

### max

Re-exports [max](validators/functions/max.md)

***

### maxItems

Re-exports [maxItems](validators/functions/maxItems.md)

***

### maxLength

Re-exports [maxLength](validators/functions/maxLength.md)

***

### min

Re-exports [min](validators/functions/min.md)

***

### minItems

Re-exports [minItems](validators/functions/minItems.md)

***

### minLength

Re-exports [minLength](validators/functions/minLength.md)

***

### negative

Re-exports [negative](validators/functions/negative.md)

***

### nonEmpty

Re-exports [nonEmpty](validators/functions/nonEmpty.md)

***

### notNaN

Re-exports [notNaN](validators/functions/notNaN.md)

***

### oneOf

Re-exports [oneOf](validators/functions/oneOf.md)

***

### partial

Re-exports [partial](schema/functions/partial.md)

***

### positive

Re-exports [positive](validators/functions/positive.md)

***

### required

Re-exports [required](validators/functions/required.md)

***

### schema

Re-exports [schema](schema/functions/schema.md)

***

### tap

Re-exports [tap](tap/functions/tap.md)

***

### tapInvalid

Re-exports [tapInvalid](tap/functions/tapInvalid.md)

***

### toResult

Re-exports [toResult](toResult/functions/toResult.md)

***

### toResultWith

Re-exports [toResultWith](toResult/functions/toResultWith.md)

***

### tryCatch

Re-exports [tryCatch](constructors/functions/tryCatch.md)

***

### tryCatchAsync

Re-exports [tryCatchAsync](constructors/functions/tryCatchAsync.md)

***

### unwrap

Re-exports [unwrap](unwrap/functions/unwrap.md)

***

### unwrapOr

Re-exports [unwrapOr](unwrap/functions/unwrapOr.md)

***

### unwrapOrElse

Re-exports [unwrapOrElse](unwrap/functions/unwrapOrElse.md)

***

### url

Re-exports [url](validators/functions/url.md)

***

### valid

Re-exports [valid](constructors/functions/valid.md)

***

### Valid

Re-exports [Valid](types/interfaces/Valid.md)

***

### validate

Re-exports [validate](validate/functions/validate.md)

***

### validateAll

Re-exports [validateAll](validateAll/functions/validateAll.md)

***

### Validation

Re-exports [Validation](types/type-aliases/Validation.md)

***

### ValidationMatcher

Re-exports [ValidationMatcher](match/interfaces/ValidationMatcher.md)

***

### ValidationSchema

Re-exports [ValidationSchema](types/type-aliases/ValidationSchema.md)

***

### Validator

Re-exports [Validator](types/type-aliases/Validator.md)
