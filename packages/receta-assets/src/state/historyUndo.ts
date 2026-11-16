import * as R from 'remeda'
import { over, prop, set } from '@ontologyio/receta/lens'

/** An undo history: the states before, the current one, and the ones an undo stepped back from. */
export type HistoryUndoState<T> = {
  readonly past: readonly T[]
  readonly present: T
  readonly future: readonly T[]
}

/**
 * Steps an undo history back one state: the last past state becomes present, and the present goes to redo.
 *
 * Use when: handling Ctrl+Z or an undo button in an editor whose history `historyPush`
 * records. The current present is put at the front of `future`, so `historyRedo` can bring it
 * back. With nothing in `past`, the same history comes back, which also tells a button to show
 * as disabled: `history.past.length === 0`.
 *
 * @example
 * ```ts
 * const history = { past: ['a', 'ab'], present: 'abc', future: [] as string[] }
 *
 * historyUndo(history)
 * // => { past: ['a'], present: 'ab', future: ['abc'] }
 *
 * historyUndo(historyUndo(history))
 * // => { past: [], present: 'a', future: ['ab', 'abc'] }
 *
 * const fresh = { past: [], present: 'a', future: [] }
 * historyUndo(fresh) === fresh
 * // => true
 * ```
 *
 * @tags undo, history, ctrl+z, editor, back, revert, time travel, past, lens
 * @see historyRedo - the step forward again
 * @see historyPush - records each change
 * @see set - @ontologyio/receta/lens, writes each part of the history
 */
export function historyUndo<T>(history: HistoryUndoState<T>): HistoryUndoState<T> {
  const { past, present } = history
  if (R.isEmpty(past)) return history
  // past has at least one state here, so its last one is a T.
  const previous = R.last(past) as T
  return R.pipe(
    history,
    set(prop<HistoryUndoState<T>, 'past'>('past'), R.dropLast(past, 1)),
    set(prop<HistoryUndoState<T>, 'present'>('present'), previous),
    over(prop<HistoryUndoState<T>, 'future'>('future'), (future) => [present, ...future]),
  )
}
