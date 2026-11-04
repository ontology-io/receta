// #region sample
import * as R from 'remeda'
import { parseJSON, flatMap, map } from '@ontologyio/receta/result'
import type { Result } from '@ontologyio/receta/result'

type OrderError = { code: 'INVALID_ORDER'; message: string }

export const parseOrder = (
  raw: string,
): Result<Order, SyntaxError | OrderError> =>
  R.pipe(
    parseJSON(raw),
    flatMap(toOrder),
    map(keepOrderedLines),
  )
// #endregion

import { err, ok } from '@ontologyio/receta/result'

type Order = { readonly lines: readonly { readonly qty: number }[] }

const toOrder = (data: unknown): Result<Order, OrderError> =>
  R.isPlainObject(data) && Array.isArray(data['lines'])
    ? ok(data as unknown as Order)
    : err({ code: 'INVALID_ORDER', message: 'Not an order' })

const keepOrderedLines = (order: Order): Order => ({
  lines: R.filter(order.lines, (line) => line.qty > 0),
})
