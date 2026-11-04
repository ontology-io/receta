import type { Lens } from '../types'
import { lens } from '../lens'

/**
 * Composes two lenses to create a lens that focuses deeper into a structure.
 *
 * Lens composition follows the mathematical composition pattern:
 * `compose(outer, inner)` creates a lens that first applies `outer`, then `inner`.
 *
 * This allows you to build complex lenses from simple ones.
 *
 * @param outer - The outer lens (applied first)
 * @param inner - The inner lens (applied to the focus of outer)
 * @returns A composed lens focusing on the inner value
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string
 *   address: Address
 * }
 *
 * interface Address {
 *   street: string
 *   city: string
 * }
 *
 * const addressLens = prop<User, 'address'>('address')
 * const cityLens = prop<Address, 'city'>('city')
 * const userCityLens = compose(addressLens, cityLens)
 *
 * const user = {
 *   name: 'Alice',
 *   address: { street: '123 Main', city: 'Boston' }
 * }
 *
 * view(userCityLens, user) // 'Boston'
 * set(userCityLens, 'NYC', user)
 * // => { name: 'Alice', address: { street: '123 Main', city: 'NYC' } }
 * ```
 *
 * @example
 * ```typescript
 * // Multiple composition
 * interface State {
 *   ui: { modal: { title: string } }
 * }
 *
 * const uiLens = prop<State, 'ui'>('ui')
 * const modalLens = prop<State['ui'], 'modal'>('modal')
 * const titleLens = prop<State['ui']['modal'], 'title'>('title')
 *
 * const modalTitleLens = compose(
 *   compose(uiLens, modalLens),
 *   titleLens
 * )
 * ```
 *
 * @example
 * ```typescript
 * // With array index: index works on readonly arrays and its focus may be undefined
 * interface Todo {
 *   text: string
 *   done: boolean
 * }
 *
 * interface TodoList {
 *   todos: readonly Todo[]
 * }
 *
 * const firstTodoLens = compose(prop<TodoList, 'todos'>('todos'), index<Todo>(0))
 *
 * const list: TodoList = { todos: [{ text: 'Buy milk', done: false }] }
 *
 * over(firstTodoLens, todo => todo && { ...todo, done: true }, list)
 * // => { todos: [{ text: 'Buy milk', done: true }] }
 * ```
 *
 * @see prop - To create property lenses
 * @see path - For nested paths (alternative to manual composition)
 */
export function compose<S, A, B>(
  outer: Lens<S, A>,
  inner: Lens<A, B>
): Lens<S, B> {
  return lens(
    (source) => inner.get(outer.get(source)),
    (value) => (source) => {
      const outerValue = outer.get(source)
      const newOuterValue = inner.set(value)(outerValue)
      return outer.set(newOuterValue)(source)
    }
  )
}
