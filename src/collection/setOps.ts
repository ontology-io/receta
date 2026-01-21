import * as R from 'remeda'
import type { Comparator } from './types'

/**
 * Merges two collections, removing duplicates using a custom comparator.
 *
 * Similar to Set union operation but works with objects and custom equality.
 *
 * @param items1 - First collection
 * @param items2 - Second collection
 * @param isEqual - Custom equality function (defaults to reference equality)
 * @returns Union of both collections without duplicates
 *
 * @example
 * ```typescript
 * // Data-first - with primitive values
 * union([1, 2, 3], [3, 4, 5])
 * // => [1, 2, 3, 4, 5]
 *
 * // With objects and custom comparator
 * const users1 = [{ id: 1, name: 'Alice' }]
 * const users2 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
 *
 * union(users1, users2, (a, b) => a.id === b.id)
 * // => [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
 *
 * // Data-last (in pipe)
 * pipe(
 *   users1,
 *   union(users2, (a, b) => a.id === b.id)
 * )
 * ```
 *
 * @see intersect - for finding common elements
 * @see symmetricDiff - for finding differences
 */
export function union<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual?: Comparator<T>
): T[]
export function union<T>(
  items2: readonly T[],
  isEqual?: Comparator<T>
): (items1: readonly T[]) => T[]
export function union(...args: unknown[]): unknown {
  // Handle data-first: union(items1, items2, isEqual?)
  if (Array.isArray(args[0]) && Array.isArray(args[1])) {
    return unionImplementation(
      args[0] as readonly unknown[],
      args[1] as readonly unknown[],
      args[2] as Comparator<unknown> | undefined
    )
  }

  // Handle data-last: union(items2, isEqual?)
  const items2 = args[0] as readonly unknown[]
  const isEqual = args[1] as Comparator<unknown> | undefined
  return (items1: readonly unknown[]) => unionImplementation(items1, items2, isEqual)
}

function unionImplementation<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual: Comparator<T> = defaultComparator
): T[] {
  const result = [...items1]

  for (const item2 of items2) {
    const exists = result.some((item1) => isEqual(item1, item2))
    if (!exists) {
      result.push(item2)
    }
  }

  return result
}

/**
 * Finds elements that exist in both collections using a custom comparator.
 *
 * Similar to Set intersection but works with objects and custom equality.
 *
 * @param items1 - First collection
 * @param items2 - Second collection
 * @param isEqual - Custom equality function (defaults to reference equality)
 * @returns Elements present in both collections
 *
 * @example
 * ```typescript
 * // Data-first - with primitive values
 * intersect([1, 2, 3], [2, 3, 4])
 * // => [2, 3]
 *
 * // With objects and custom comparator
 * const assigned = [{ taskId: 1 }, { taskId: 2 }]
 * const completed = [{ taskId: 2 }, { taskId: 3 }]
 *
 * intersect(assigned, completed, (a, b) => a.taskId === b.taskId)
 * // => [{ taskId: 2 }] // tasks that are both assigned and completed
 *
 * // Data-last (in pipe)
 * pipe(
 *   assigned,
 *   intersect(completed, (a, b) => a.taskId === b.taskId)
 * )
 * ```
 *
 * @see union - for merging collections
 * @see diff - for finding all types of differences
 */
export function intersect<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual?: Comparator<T>
): T[]
export function intersect<T>(
  items2: readonly T[],
  isEqual?: Comparator<T>
): (items1: readonly T[]) => T[]
export function intersect(...args: unknown[]): unknown {
  // Handle data-first: intersect(items1, items2, isEqual?)
  if (Array.isArray(args[0]) && Array.isArray(args[1])) {
    return intersectImplementation(
      args[0] as readonly unknown[],
      args[1] as readonly unknown[],
      args[2] as Comparator<unknown> | undefined
    )
  }

  // Handle data-last: intersect(items2, isEqual?)
  const items2 = args[0] as readonly unknown[]
  const isEqual = args[1] as Comparator<unknown> | undefined
  return (items1: readonly unknown[]) => intersectImplementation(items1, items2, isEqual)
}

function intersectImplementation<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual: Comparator<T> = defaultComparator
): T[] {
  const result: T[] = []

  for (const item1 of items1) {
    const existsInBoth = items2.some((item2) => isEqual(item1, item2))
    if (existsInBoth) {
      result.push(item1)
    }
  }

  return result
}

/**
 * Finds elements that exist in either collection but not both (symmetric difference).
 *
 * Similar to XOR operation on sets.
 *
 * @param items1 - First collection
 * @param items2 - Second collection
 * @param isEqual - Custom equality function (defaults to reference equality)
 * @returns Elements that are in either collection, but not both
 *
 * @example
 * ```typescript
 * // Data-first - with primitive values
 * symmetricDiff([1, 2, 3], [2, 3, 4])
 * // => [1, 4] // 1 only in first, 4 only in second
 *
 * // With objects
 * const planned = [{ id: 1 }, { id: 2 }]
 * const actual = [{ id: 2 }, { id: 3 }]
 *
 * symmetricDiff(planned, actual, (a, b) => a.id === b.id)
 * // => [{ id: 1 }, { id: 3 }] // id 1 not executed, id 3 not planned
 *
 * // Data-last (in pipe)
 * pipe(
 *   planned,
 *   symmetricDiff(actual, (a, b) => a.id === b.id)
 * )
 * ```
 *
 * @see diff - for categorized differences (added/removed/updated)
 * @see union - for combining collections
 */
export function symmetricDiff<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual?: Comparator<T>
): T[]
export function symmetricDiff<T>(
  items2: readonly T[],
  isEqual?: Comparator<T>
): (items1: readonly T[]) => T[]
export function symmetricDiff(...args: unknown[]): unknown {
  // Handle data-first: symmetricDiff(items1, items2, isEqual?)
  if (Array.isArray(args[0]) && Array.isArray(args[1])) {
    return symmetricDiffImplementation(
      args[0] as readonly unknown[],
      args[1] as readonly unknown[],
      args[2] as Comparator<unknown> | undefined
    )
  }

  // Handle data-last: symmetricDiff(items2, isEqual?)
  const items2 = args[0] as readonly unknown[]
  const isEqual = args[1] as Comparator<unknown> | undefined
  return (items1: readonly unknown[]) => symmetricDiffImplementation(items1, items2, isEqual)
}

function symmetricDiffImplementation<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual: Comparator<T> = defaultComparator
): T[] {
  const onlyInFirst = items1.filter(
    (item1) => !items2.some((item2) => isEqual(item1, item2))
  )

  const onlyInSecond = items2.filter(
    (item2) => !items1.some((item1) => isEqual(item1, item2))
  )

  return [...onlyInFirst, ...onlyInSecond]
}

function defaultComparator<T>(a: T, b: T): boolean {
  return a === b
}
