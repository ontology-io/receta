// The domain behind the samples. Not shown on the page: it only exists so the samples
// compile and run against the published package.
import * as R from 'remeda'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type Line = { readonly sku: string; readonly qty: number }
export type Order = { readonly id: string; readonly lines: readonly Line[] }
export type PricedOrder = Order & { readonly total: number }
export type OrderError = {
  readonly code: 'INVALID_ORDER' | 'OUT_OF_STOCK'
  readonly message: string
}

const UNIT_PRICE = 10

export const toOrder = (data: unknown): Result<Order, OrderError> =>
  R.isPlainObject(data) && Array.isArray(data['lines'])
    ? ok(data as unknown as Order)
    : err({ code: 'INVALID_ORDER', message: 'Not an order' })

export const keepOrderedLines = (order: Order): Order => ({
  ...order,
  lines: R.filter(order.lines, (line) => line.qty > 0),
})

export const checkStock = (order: Order): Result<Order, OrderError> =>
  order.lines.length > 0
    ? ok(order)
    : err({ code: 'OUT_OF_STOCK', message: 'Nothing left to ship' })

export const priceOrder = (order: Order): PricedOrder => ({
  ...order,
  total: R.sumBy(order.lines, (line) => line.qty * UNIT_PRICE),
})

export const saveOrder = (order: PricedOrder): Result<PricedOrder, OrderError> => ok(order)
