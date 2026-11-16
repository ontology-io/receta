import * as R from 'remeda'
import { insertAt, moveIndex, removeAtIndex } from '@ontologyio/receta/collection'
import { index, over, prop, view } from '@ontologyio/receta/lens'
import { clamp } from '@ontologyio/receta/number'

/** Lists by id, such as the columns of a kanban board. */
export type MoveBetweenListsBoard<T> = Readonly<Record<string, readonly T[]>>

/** A position in one of the lists. */
export type MoveBetweenListsSpot = { readonly list: string; readonly index: number }

/**
 * Moves one item from a position in one list to a position in another, as a kanban drag and drop does.
 *
 * Use when: handling the drop of a card between kanban columns, a task between sprints, a
 * file between folders or a player between teams, where the lists live in one record by id.
 * The item leaves `from` and is inserted at `to`, and items after it shift. A `to.index` past
 * the end appends. Moving within one list works too. If either list is missing or nothing is
 * at `from`, the same board comes back. Lists that weren't touched are the same arrays.
 *
 * ```text
 *  board, from, to
 *        │
 *        ▼
 *  ⟨ both lists exist and an item at from? ⟩──no──▶ ╭─────────────────╮
 *        │ yes                                      │ board unchanged │
 *        ▼                                          ╰─────────────────╯
 *  ⟨ same list? ⟩──yes──▶ ╭──────────────────────────────────╮
 *        │ no             │ item moved within it, rest shift │
 *        ▼                ╰──────────────────────────────────╯
 *  ┌─────────────────────────┐  then  ┌─────────────────────────────────┐
 *  │ remove it from from.list│───────▶│ insert it in to.list at to.index│
 *  └─────────────────────────┘        └─────────────────────────────────┘
 * ```
 *
 * @example
 * ```ts
 * const board = { todo: ['spec', 'api', 'ui'], doing: ['db'], done: [] as string[] }
 *
 * moveBetweenLists(board, { list: 'todo', index: 1 }, { list: 'doing', index: 0 })
 * // => { todo: ['spec', 'ui'], doing: ['api', 'db'], done: [] }
 *
 * R.pipe(board, moveBetweenLists({ list: 'doing', index: 0 }, { list: 'done', index: 99 }))
 * // => { todo: ['spec', 'api', 'ui'], doing: [], done: ['db'] }
 *
 * moveBetweenLists(board, { list: 'todo', index: 0 }, { list: 'todo', index: 2 })
 * // => { todo: ['api', 'ui', 'spec'], doing: ['db'], done: [] }
 *
 * moveBetweenLists(board, { list: 'todo', index: 5 }, { list: 'done', index: 0 }) === board
 * // => true
 * ```
 *
 * @tags kanban, drag and drop, dnd, move, columns, board, lists, trello, reorder, lens
 * @see reorderAt - moves within one array at a dot path
 * @see insertAt - @ontologyio/receta/collection, puts the item in the target list
 * @see removeAtIndex - @ontologyio/receta/collection, takes it out of the source list
 */
export function moveBetweenLists<T>(
  board: MoveBetweenListsBoard<T>,
  from: MoveBetweenListsSpot,
  to: MoveBetweenListsSpot,
): MoveBetweenListsBoard<T>
export function moveBetweenLists(
  from: MoveBetweenListsSpot,
  to: MoveBetweenListsSpot,
): <T>(board: MoveBetweenListsBoard<T>) => MoveBetweenListsBoard<T>
export function moveBetweenLists(...args: unknown[]): unknown {
  return R.purry(moveBetweenListsImplementation, args)
}

const moveBetweenListsImplementation = <T>(
  board: MoveBetweenListsBoard<T>,
  from: MoveBetweenListsSpot,
  to: MoveBetweenListsSpot,
): MoveBetweenListsBoard<T> => {
  const listOf = (id: string) => prop<MoveBetweenListsBoard<T>, string>(id)
  const [source, target] = [board[from.list], board[to.list]]
  if (R.isNullish(source) || R.isNullish(target) || !Object.hasOwn(source, from.index)) return board
  if (from.list === to.list) {
    return over(listOf(from.list), moveIndex(from.index, clamp(to.index, 0, source.length - 1)), board)
  }
  const item = view(index<T>(from.index), source) as T
  return R.pipe(
    board,
    over(listOf(from.list), removeAtIndex(from.index)),
    over(listOf(to.list), insertAt(to.index, [item])),
  )
}
