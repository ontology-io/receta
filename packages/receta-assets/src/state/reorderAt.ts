import * as R from 'remeda'
import { moveIndex } from '@ontologyio/receta/collection'
import { over, path, view } from '@ontologyio/receta/lens'

type Step<T, K extends string> = T extends readonly (infer Item)[]
  ? K extends `${number}`
    ? Item
    : never
  : K extends keyof T
    ? T[K]
    : never

type ValueAt<S, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? ValueAt<NonNullable<Step<NonNullable<S>, Head>>, Rest>
  : Step<NonNullable<S>, P>

/** `P` when it is a dot path to an array inside `S`, otherwise `never`, so the call doesn't compile. */
export type ReorderAtPath<S, P extends string> = NonNullable<ValueAt<S, P>> extends readonly unknown[] ? P : never

/**
 * Returns new state with one item of the array at a dot path moved from one position to another.
 *
 * Use when: handling the drop of a drag-and-drop list, such as reordering playlist tracks,
 * form fields, dashboard widgets or the cards of one kanban column. The item is taken out at
 * `from` and put at `to`, and the others shift to make room. Negative positions count from
 * the end. If either position is outside the array, or the array is missing, the state comes
 * back unchanged.
 *
 * @example
 * ```ts
 * const state = { playlist: { tracks: ['intro', 'verse', 'chorus', 'outro'] } }
 *
 * reorderAt(state, 'playlist.tracks', 0, 2).playlist
 * // => { tracks: ['verse', 'chorus', 'intro', 'outro'] }
 *
 * R.pipe(state, reorderAt('playlist.tracks', -1, 0)).playlist
 * // => { tracks: ['outro', 'intro', 'verse', 'chorus'] }
 *
 * reorderAt(state, 'playlist.tracks', 1, 9) === state
 * // => true
 * ```
 *
 * @tags reorder, move, drag and drop, dnd, sortable, position, rearrange, array, list, lens
 * @see swapAt - exchanges two items instead of shifting the rest
 * @see moveBetweenLists - moves an item into another list
 * @see moveIndex - @ontologyio/receta/collection, the move inside the array
 */
export function reorderAt<S, P extends string>(state: S, at: ReorderAtPath<S, P>, from: number, to: number): S
export function reorderAt<S, P extends string>(at: ReorderAtPath<S, P>, from: number, to: number): (state: S) => S
export function reorderAt(...args: unknown[]): unknown {
  return R.purry(reorderAtImplementation, args)
}

const reorderAtImplementation = <S>(state: S, at: string, from: number, to: number): S => {
  const listLens = path<S, readonly unknown[] | undefined>(at)
  const list = view(listLens, state)
  if (R.isNullish(list)) return state
  const moved = moveIndex(list, from, to)
  // moveIndex hands back the same array when there is nothing to move: keep the same state too.
  return moved === list ? state : over(listLens, () => moved, state)
}
