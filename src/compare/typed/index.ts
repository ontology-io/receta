import type { Comparator, ComparableExtractor, StringCompareOptions } from '../types'

/**
 * Creates a comparator for date values.
 *
 * Sorts dates chronologically (earliest to latest by default).
 * Handles Date objects correctly for temporal sorting.
 *
 * @param fn - Function to extract the date value
 * @returns A comparator for dates
 *
 * @example
 * ```typescript
 * interface Event {
 *   name: string
 *   occurredAt: Date
 *   scheduledFor: Date
 * }
 *
 * const events = [
 *   { name: 'Meeting', occurredAt: new Date('2024-01-15'), scheduledFor: new Date('2024-02-01') },
 *   { name: 'Launch', occurredAt: new Date('2024-01-10'), scheduledFor: new Date('2024-03-01') },
 *   { name: 'Review', occurredAt: new Date('2024-01-20'), scheduledFor: new Date('2024-02-15') }
 * ]
 *
 * // Sort by occurred date (earliest first)
 * events.sort(byDate(e => e.occurredAt))
 * // => [Launch (Jan 10), Meeting (Jan 15), Review (Jan 20)]
 *
 * // Sort by scheduled date descending (latest first)
 * events.sort(reverse(byDate(e => e.scheduledFor)))
 * // => [Launch (Mar 1), Review (Feb 15), Meeting (Feb 1)]
 * ```
 *
 * @see ascending - for generic ascending sort
 * @see descending - for generic descending sort
 */
export function byDate<T>(fn: ComparableExtractor<T, Date>): Comparator<T> {
  return (a, b) => {
    const aDate = fn(a)
    const bDate = fn(b)

    const aTime = aDate.getTime()
    const bTime = bDate.getTime()

    return aTime - bTime
  }
}

/**
 * Creates a comparator for numeric values.
 *
 * Handles all numeric types including integers, floats, and special values
 * (NaN, Infinity). NaN values are treated as equal and sorted to the end.
 *
 * @param fn - Function to extract the numeric value
 * @returns A comparator for numbers
 *
 * @example
 * ```typescript
 * interface Metric {
 *   name: string
 *   value: number
 *   change: number
 * }
 *
 * const metrics = [
 *   { name: 'CPU', value: 45.2, change: 1.5 },
 *   { name: 'Memory', value: 78.9, change: -2.3 },
 *   { name: 'Disk', value: 23.1, change: 0.8 }
 * ]
 *
 * // Sort by value (lowest first)
 * metrics.sort(byNumber(m => m.value))
 * // => [Disk (23.1), CPU (45.2), Memory (78.9)]
 *
 * // Sort by change (highest first)
 * metrics.sort(reverse(byNumber(m => m.change)))
 * // => [CPU (+1.5), Disk (+0.8), Memory (-2.3)]
 * ```
 *
 * @see ascending - for generic ascending sort
 * @see descending - for generic descending sort
 */
export function byNumber<T>(fn: ComparableExtractor<T, number>): Comparator<T> {
  return (a, b) => {
    const aNum = fn(a)
    const bNum = fn(b)

    // Handle NaN - treat as equal and sort to end
    if (Number.isNaN(aNum) && Number.isNaN(bNum)) return 0
    if (Number.isNaN(aNum)) return 1
    if (Number.isNaN(bNum)) return -1

    return aNum - bNum
  }
}

/**
 * Creates a comparator for string values with optional configuration.
 *
 * Supports case-sensitive/insensitive comparison and locale-aware sorting.
 *
 * @param fn - Function to extract the string value
 * @param options - String comparison options
 * @returns A comparator for strings
 *
 * @example
 * ```typescript
 * interface User {
 *   firstName: string
 *   lastName: string
 *   email: string
 * }
 *
 * const users = [
 *   { firstName: 'alice', lastName: 'Smith', email: 'alice@example.com' },
 *   { firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' },
 *   { firstName: 'Charlie', lastName: 'Adams', email: 'charlie@example.com' }
 * ]
 *
 * // Case-sensitive sort (default)
 * users.sort(byString(u => u.firstName))
 * // => [Bob, Charlie, alice] (uppercase comes first)
 *
 * // Case-insensitive sort
 * users.sort(byString(u => u.firstName, { caseSensitive: false }))
 * // => [alice, Bob, Charlie]
 *
 * // Locale-aware sort
 * const germanNames = [
 *   { name: 'Müller' },
 *   { name: 'Mueller' },
 *   { name: 'Möller' }
 * ]
 * germanNames.sort(byString(n => n.name, { locale: 'de-DE' }))
 * ```
 *
 * @see caseInsensitive - convenience function for case-insensitive sorting
 * @see localeCompare - convenience function for locale-aware sorting
 */
export function byString<T>(
  fn: ComparableExtractor<T, string>,
  options: StringCompareOptions = {}
): Comparator<T> {
  const { caseSensitive = true, locale } = options

  return (a, b) => {
    const aStr = fn(a)
    const bStr = fn(b)

    if (locale) {
      return aStr.localeCompare(bStr, locale, {
        sensitivity: caseSensitive ? 'variant' : 'accent'
      })
    }

    if (!caseSensitive) {
      return aStr.toLowerCase().localeCompare(bStr.toLowerCase())
    }

    return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
  }
}

/**
 * Creates a comparator for boolean values.
 *
 * By default, false comes before true (false < true).
 * Use `reverse()` for true-first sorting.
 *
 * @param fn - Function to extract the boolean value
 * @returns A comparator for booleans
 *
 * @example
 * ```typescript
 * interface Task {
 *   title: string
 *   completed: boolean
 *   urgent: boolean
 * }
 *
 * const tasks = [
 *   { title: 'Review PR', completed: true, urgent: false },
 *   { title: 'Fix bug', completed: false, urgent: true },
 *   { title: 'Write docs', completed: false, urgent: false },
 *   { title: 'Deploy', completed: true, urgent: true }
 * ]
 *
 * // Sort by completed (incomplete first)
 * tasks.sort(byBoolean(t => t.completed))
 * // => [Fix bug (false), Write docs (false), Review PR (true), Deploy (true)]
 *
 * // Sort by urgent (urgent first)
 * tasks.sort(reverse(byBoolean(t => t.urgent)))
 * // => [Fix bug (true), Deploy (true), Review PR (false), Write docs (false)]
 *
 * // Multi-level: urgent first, then incomplete first
 * tasks.sort(
 *   compose(
 *     reverse(byBoolean(t => t.urgent)),
 *     byBoolean(t => t.completed)
 *   )
 * )
 * ```
 *
 * @see reverse - to sort true values first
 */
export function byBoolean<T>(fn: ComparableExtractor<T, boolean>): Comparator<T> {
  return (a, b) => {
    const aBool = fn(a)
    const bBool = fn(b)

    // false (0) < true (1)
    return Number(aBool) - Number(bBool)
  }
}
