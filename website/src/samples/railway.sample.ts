import * as R from 'remeda'
import { flatMap, map, match, type Result } from '@ontologyio/receta/result'
import { checkStock, priceOrder, saveOrder, type OrderError, type PricedOrder } from './order'
import { parseOrder } from './story.sample'

export const placeOrder = (raw: string): Result<PricedOrder, SyntaxError | OrderError> =>
  R.pipe(parseOrder(raw), flatMap(checkStock), map(priceOrder), flatMap(saveOrder))

const showReceipt = (order: PricedOrder): string => `Order ${order.id} placed`
const showError = (error: SyntaxError | OrderError): string =>
  'code' in error ? error.code : error.name

export const renderOrder = (raw: string): string =>
// #region sample
R.pipe(
  placeOrder(raw),
  match({ onOk: showReceipt, onErr: showError }),
)
// #endregion
