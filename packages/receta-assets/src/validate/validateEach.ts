import * as R from 'remeda'
import { collectErrors, invalid, match, valid, type Validation, type Validator } from '@ontologyio/receta/validation'

/** Every problem with one item, and where the item sits in the list. */
export type ValidateEachError<E> = {
  readonly index: number
  readonly errors: readonly E[]
}

/**
 * Runs a validator on every item of a list and reports each failing item by its index.
 *
 * Use when: a list arrives from a form, CSV or request, such as invitees, line items or
 * rows to import, and the person must see which entries are wrong, not just that some are.
 * Every item is checked; each failing one gives one `{ index, errors }` with all its
 * messages. On success the validator's outputs come back, so a validator that trims or
 * parses changes the items.
 *
 * @example
 * ```ts
 * import { email } from '@ontologyio/receta/validation'
 *
 * validateEach(['ada@example.com', 'grace@example.com'], email())
 * // => Valid(['ada@example.com', 'grace@example.com'])
 *
 * validateEach(['ada@example.com', 'nope', 'grace@', 'alan@example.com'], email())
 * // => Invalid([
 * //   { index: 1, errors: ['Invalid email address'] },
 * //   { index: 2, errors: ['Invalid email address'] },
 * // ])
 *
 * R.pipe([], validateEach(email()))
 * // => Valid([])
 * ```
 *
 * @tags list, array, each, items, rows, index, bulk, import, invitees
 * @see validateAll - @ontologyio/receta/validation, the same checks with the indexes dropped
 * @see validateRows - rows of objects, with errors at paths like `lines[2].qty`
 */
export function validateEach<T, U, E>(
  items: readonly T[],
  validator: Validator<T, U, E>,
): Validation<U[], ValidateEachError<E>>
export function validateEach<T, U, E>(
  validator: Validator<T, U, E>,
): (items: readonly T[]) => Validation<U[], ValidateEachError<E>>
export function validateEach(...args: unknown[]): unknown {
  return R.purry(validateEachImplementation, args)
}

const validateEachImplementation = <T, U, E>(
  items: readonly T[],
  validator: Validator<T, U, E>,
): Validation<U[], ValidateEachError<E>> =>
  R.pipe(
    items,
    R.map((item, index) =>
      R.pipe(
        validator(item),
        match<U, E, Validation<U, ValidateEachError<E>>>({
          onValid: valid,
          onInvalid: (errors) => invalid({ index, errors }),
        }),
      ),
    ),
    collectErrors(),
  )
