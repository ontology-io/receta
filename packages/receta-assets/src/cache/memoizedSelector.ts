import * as R from 'remeda'
import { isSome, none, some, type Option } from '@ontologyio/receta/option'

/**
 * Builds a selector that derives a value from state, and recomputes only when the inputs it picks out change.
 *
 * Use when: a component or a subscriber derives data from a store, such as visible todos
 * from the todos and the filter, and the derived value must stay the same object while
 * its inputs do, so React and friends skip the re-render. `select` picks the inputs as a
 * tuple; they are compared one by one by identity, the way immutable stores change.
 * `combine` runs only when one of them changed. It remembers only the last inputs.
 *
 * @example
 * ```ts
 * type Todo = { readonly title: string; readonly done: boolean }
 * type State = { readonly todos: readonly Todo[]; readonly filter: 'all' | 'done'; readonly theme: string }
 *
 * let runs = 0
 * const visibleTodos = memoizedSelector(
 *   (state: State) => [state.todos, state.filter],
 *   (todos, filter) => {
 *     runs += 1
 *     return filter === 'all' ? todos : R.filter(todos, R.prop('done'))
 *   },
 * )
 *
 * const todos = [{ title: 'ship', done: true }, { title: 'test', done: false }]
 * const state: State = { todos, filter: 'done', theme: 'light' }
 *
 * visibleTodos(state)
 * // => [{ title: 'ship', done: true }]
 *
 * visibleTodos({ ...state, theme: 'dark' }) === visibleTodos(state)
 * // => true
 *
 * runs
 * // => 1
 * ```
 *
 * @tags selector, reselect, derived state, redux, zustand, react, memoize, store
 * @see memoizeLatest - compares a function's arguments deeply instead
 * @see weakDerived - derives once per object and keeps every object's result
 */
export function memoizedSelector<S, const I extends readonly unknown[], T>(
  select: (state: S) => I,
  combine: (...inputs: I) => T,
): (state: S) => T {
  let last: Option<{ readonly inputs: I; readonly value: T }> = none()
  return (state) => {
    const inputs = select(state)
    if (isSome(last) && R.isShallowEqual(last.value.inputs, inputs)) return last.value.value
    const value = combine(...inputs)
    last = some({ inputs, value })
    return value
  }
}
