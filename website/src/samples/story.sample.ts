import * as R from 'remeda'
import { flatMap, map, parseJSON, type Result } from '@ontologyio/receta/result'
import { keepOrderedLines, toOrder, type Order, type OrderError } from './order'

// #region sample
const parseOrder = (
  raw: string,
): Result<Order, SyntaxError | OrderError> =>
  R.pipe(
    parseJSON(raw),
    flatMap(toOrder),
    map(keepOrderedLines),
  )
// #endregion

export { parseOrder }
