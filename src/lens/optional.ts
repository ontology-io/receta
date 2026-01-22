import type { Lens } from './types'
import type { Option } from '../option/types'
import { some, none } from '../option/constructors'
import { lens } from './lens'

/**
 * Creates a lens that handles potentially undefined values using Option.
 *
 * This is useful when you have nullable fields and want to work with them
 * safely using the Option pattern. The lens will return Some(value) if the
 * value exists, or None if it's undefined/null.
 *
 * @param baseLens - The underlying lens that may return undefined
 * @returns A lens that wraps the value in Option
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string
 *   email?: string
 *   phone?: string
 * }
 *
 * const emailLens = prop<User>('email')
 * const optionalEmailLens = optional(emailLens)
 *
 * const user1 = { name: 'Alice', email: 'alice@example.com' }
 * const user2 = { name: 'Bob' }
 *
 * view(optionalEmailLens, user1) // Some('alice@example.com')
 * view(optionalEmailLens, user2) // None
 * ```
 *
 * @example
 * ```typescript
 * // Setting through optional lens
 * import { some, none } from 'receta/option'
 *
 * const user = { name: 'Alice' }
 *
 * set(optionalEmailLens, some('alice@example.com'), user)
 * // => { name: 'Alice', email: 'alice@example.com' }
 *
 * set(optionalEmailLens, none, user)
 * // => { name: 'Alice', email: undefined }
 * ```
 *
 * @example
 * ```typescript
 * // Transforming optional values
 * over(
 *   optionalEmailLens,
 *   emailOpt => map(emailOpt, email => email.toLowerCase()),
 *   user
 * )
 * ```
 *
 * @see prop - To create the base lens
 * @see path - For nested optional paths
 */
export function optional<S, A>(
  baseLens: Lens<S, A | undefined>
): Lens<S, Option<A>> {
  return lens<S, Option<A>>(
    (source) => {
      const value = baseLens.get(source)
      return value !== undefined && value !== null ? some(value) : none()
    },
    (optionValue: Option<A>) => (source) => {
      if (optionValue._tag === 'Some') {
        return baseLens.set(optionValue.value)(source)
      } else {
        return baseLens.set(undefined)(source)
      }
    }
  )
}
