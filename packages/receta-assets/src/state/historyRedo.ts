import * as R from 'remeda'
import { over, prop, set } from '@ontologyio/receta/lens'

/** An undo history: the states before, the current one, and the ones an undo stepped back from. */
export type HistoryRedoState<T> = {
  readonly past: readonly T[]
  readonly present: T
  readonly future: readonly T[]
}

/**
 * Steps an undo history forward one state after an undo: the first redo state becomes present.
 *
 * Use when: handling Ctrl+Shift+Z or a redo button in an editor whose history
 * `historyPush` records and `historyUndo` steps back. The current present goes to the end of
 * `past`. With nothing in `future`, either because nothing was undone or because a new change
 * cleared it, the same history comes back.
 *
 * @example
 * ```ts
 * const history = { past: ['a'], present: 'ab', future: ['abc', 'abcd'] }
 *
 * historyRedo(history)
 * // => { past: ['a', 'ab'], present: 'abc', future: ['abcd'] }
 *
 * const latest = { past: ['a'], present: 'ab', future: [] }
 * historyRedo(latest) === latest
 * // => true
 * ```
 *
 * @tags redo, history, ctrl+shift+z, editor, forward, time travel, future, lens
 * @see historyUndo - the step back that fills `future`
 * @see historyPush - records each change and clears `future`
 * @see set - @ontologyio/receta/lens, writes each part of the history
 */
export function historyRedo<T>(history: HistoryRedoState<T>): HistoryRedoState<T> {
  const { present, future } = history
  if (R.isEmpty(future)) return history
  // future has at least one state here, so its first one is a T.
  const next = R.first(future) as T
  return R.pipe(
    history,
    over(prop<HistoryRedoState<T>, 'past'>('past'), (past) => [...past, present]),
    set(prop<HistoryRedoState<T>, 'present'>('present'), next),
    set(prop<HistoryRedoState<T>, 'future'>('future'), R.drop(future, 1)),
  )
}
