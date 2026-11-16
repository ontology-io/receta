import * as R from 'remeda'
import { over, prop, set } from '@ontologyio/receta/lens'

/** An undo history: the states before, the current one, and the ones an undo stepped back from. */
export type HistoryPushState<T> = {
  readonly past: readonly T[]
  readonly present: T
  readonly future: readonly T[]
}

/**
 * Records a new present state in an undo history, keeping at most `limit` past states and clearing redo.
 *
 * Use when: an editor, canvas, form builder or spreadsheet needs undo and redo, and each
 * committed change goes through here. The old present moves to the end of `past`, the oldest
 * past states beyond `limit` are dropped, and `future` empties because a new change ends the
 * redo trail. A `next` deep-equal to the present is not a change: the same history comes back.
 *
 * @example
 * ```ts
 * const history = { past: [1, 2], present: 3, future: [4] }
 *
 * historyPush(history, 10, 5)
 * // => { past: [1, 2, 3], present: 10, future: [] }
 *
 * R.pipe(history, historyPush(10, 2))
 * // => { past: [2, 3], present: 10, future: [] }
 *
 * historyPush(history, 3, 5) === history
 * // => true
 * ```
 *
 * @tags undo, redo, history, time travel, editor, snapshot, past, future, limit, lens
 * @see historyUndo - steps back to the previous state
 * @see historyRedo - steps forward again after an undo
 * @see over - @ontologyio/receta/lens, moves the present into `past`
 */
export function historyPush<T>(history: HistoryPushState<T>, next: T, limit: number): HistoryPushState<T>
export function historyPush<T>(next: T, limit: number): (history: HistoryPushState<T>) => HistoryPushState<T>
export function historyPush(...args: unknown[]): unknown {
  return R.purry(historyPushImplementation, args)
}

const historyPushImplementation = <T>(history: HistoryPushState<T>, next: T, limit: number): HistoryPushState<T> => {
  if (R.isDeepEqual(history.present, next)) return history
  return R.pipe(
    history,
    over(prop<HistoryPushState<T>, 'past'>('past'), (past) => R.takeLast([...past, history.present], limit)),
    set(prop<HistoryPushState<T>, 'present'>('present'), next),
    set(prop<HistoryPushState<T>, 'future'>('future'), []),
  )
}
