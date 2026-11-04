import * as R from 'remeda'
import { fromNullable, map, unwrapOr } from '@ontologyio/receta/option'

const users = new Map([['1', { email: 'ada@example.com' }]])

// #region sample
const emailOf = (id: string): string =>
  R.pipe(
    fromNullable(users.get(id)),
    map(user => user.email),
    unwrapOr('no email on file'),
  )
// #endregion

export { emailOf }
