import * as R from 'remeda'
import { guard } from '@ontologyio/receta/function'
import { and, endsWith, eq, or, where } from '@ontologyio/receta/predicate'
import { flatMap, fromNullable, type Result } from '@ontologyio/receta/result'

export type AuthorizeActionActor = {
  readonly id: string
  readonly suspended: boolean
  /** Exact permissions such as `posts:delete`, a scope such as `posts:*`, or `*` for all. */
  readonly permissions: readonly string[]
}

export type AuthorizeActionError = {
  readonly code: 'NOT_SIGNED_IN' | 'SUSPENDED' | 'FORBIDDEN'
  /** The permission that was asked for. */
  readonly input: string
  readonly message: string
}

/** Whether one granted permission covers the one asked for: exact, `scope:*` or `*`. */
const covers = (permission: string): ((granted: string) => boolean) =>
  or(
    eq('*'),
    eq(permission),
    and(endsWith(':*'), (scope: string) => permission.startsWith(scope.slice(0, -1))),
  )

/**
 * Checks that someone may perform an action: signed in, not suspended, and holding the permission.
 *
 * Use when: an API handler, a server action or a UI button needs a yes or a reason before it
 * acts. The checks run in that order, so the error code maps straight to a response:
 * `NOT_SIGNED_IN` is a 401, `SUSPENDED` and `FORBIDDEN` are 403s. A granted `posts:*` covers
 * every `posts:` permission and `*` covers all. The `Ok` holds the actor, typed as passed in.
 *
 * @example
 * ```ts
 * const editor = { id: 'u1', suspended: false, permissions: ['posts:*', 'comments:read'] }
 *
 * authorizeAction(editor, 'posts:delete')
 * // => Ok({ id: 'u1', suspended: false, permissions: ['posts:*', 'comments:read'] })
 *
 * authorizeAction(editor, 'comments:delete')
 * // => Err({ code: 'FORBIDDEN', input: 'comments:delete', message: 'Missing permission "comments:delete"' })
 *
 * R.pipe({ ...editor, suspended: true }, authorizeAction('posts:read'))
 * // => Err({ code: 'SUSPENDED', input: 'posts:read', message: 'Account u1 is suspended' })
 *
 * authorizeAction(undefined, 'posts:read')
 * // => Err({ code: 'NOT_SIGNED_IN', input: 'posts:read', message: 'Sign in to continue' })
 * ```
 *
 * @tags auth, authorize, permission, rbac, access control, scope, 401, 403, guard
 * @see guard - @ontologyio/receta/function, the suspended and permission checks in order
 * @see fromNullable - @ontologyio/receta/result, a missing actor becomes `NOT_SIGNED_IN`
 */
export function authorizeAction<A extends AuthorizeActionActor>(
  actor: A | null | undefined,
  permission: string,
): Result<A, AuthorizeActionError>
export function authorizeAction<A extends AuthorizeActionActor>(
  permission: string,
): (actor: A | null | undefined) => Result<A, AuthorizeActionError>
export function authorizeAction(...args: unknown[]): unknown {
  return R.purry(authorizeActionImplementation, args)
}

const authorizeActionImplementation = <A extends AuthorizeActionActor>(
  actor: A | null | undefined,
  permission: string,
): Result<A, AuthorizeActionError> => {
  const refuse = (code: AuthorizeActionError['code'], message: string): AuthorizeActionError => ({
    code,
    input: permission,
    message,
  })
  return R.pipe(
    actor,
    fromNullable(refuse('NOT_SIGNED_IN', 'Sign in to continue')),
    flatMap((signedIn) =>
      guard<A, AuthorizeActionError>(
        [
          [
            where<AuthorizeActionActor>({ suspended: eq(false) }),
            refuse('SUSPENDED', `Account ${signedIn.id} is suspended`),
          ],
          [
            (who) => who.permissions.some(covers(permission)),
            refuse('FORBIDDEN', `Missing permission "${permission}"`),
          ],
        ],
        signedIn,
      ),
    ),
  )
}
