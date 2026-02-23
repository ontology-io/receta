# Interface: FieldError\<E\>

Defined in: [validation/types.ts:104](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/types.ts#L104)

Represents a validation error for a specific field.

Used when validating objects to track which field(s) failed validation.

## Example

```typescript
const fieldError: FieldError<string> = {
  field: 'email',
  errors: ['Invalid email format', 'Email already exists']
}
```

## Type Parameters

### E

`E`

The type of individual error messages

## Properties

### errors

> `readonly` **errors**: readonly `E`[]

Defined in: [validation/types.ts:106](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/types.ts#L106)

***

### field

> `readonly` **field**: `string`

Defined in: [validation/types.ts:105](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/validation/types.ts#L105)
