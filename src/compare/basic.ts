import * as R from 'remeda'
import type { Comparator, ComparableExtractor } from './types'

/**
 * Creates a comparator that sorts in ascending order based on an extracted value.
 *
 * Works with numbers, strings, dates, and any comparable values.
 *
 * @param fn - Function to extract the comparable value
 * @returns A comparator function for ascending order
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string
 *   age: number
 * }
 *
 * const users = [
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 },
 *   { name: 'Charlie', age: 35 }
 * ]
 *
 * // Sort by age ascending
 * users.sort(ascending(u => u.age))
 * // => [{ name: 'Bob', age: 25 }, { name: 'Alice', age: 30 }, { name: 'Charlie', age: 35 }]
 *
 * // Sort by name ascending
 * users.sort(ascending(u => u.name))
 * // => [{ name: 'Alice', ... }, { name: 'Bob', ... }, { name: 'Charlie', ... }]
 * ```
 *
 * @see descending - for descending order
 * @see byKey - for sorting by object key directly
 */
export function ascending<T, C extends number | string | Date>(
  fn: ComparableExtractor<T, C>
): Comparator<T>
export function ascending<T, C extends number | string | Date>(
  fn: ComparableExtractor<T, C>
): Comparator<T> {
  return (a, b) => {
    const aVal = fn(a)
    const bVal = fn(b)

    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
    return 0
  }
}

/**
 * Creates a comparator that sorts in descending order based on an extracted value.
 *
 * Works with numbers, strings, dates, and any comparable values.
 *
 * @param fn - Function to extract the comparable value
 * @returns A comparator function for descending order
 *
 * @example
 * ```typescript
 * interface Transaction {
 *   amount: number
 *   date: Date
 * }
 *
 * const transactions = [
 *   { amount: 100, date: new Date('2024-01-01') },
 *   { amount: 500, date: new Date('2024-01-03') },
 *   { amount: 200, date: new Date('2024-01-02') }
 * ]
 *
 * // Sort by amount descending (highest first)
 * transactions.sort(descending(t => t.amount))
 * // => [{ amount: 500, ... }, { amount: 200, ... }, { amount: 100, ... }]
 *
 * // Sort by date descending (most recent first)
 * transactions.sort(descending(t => t.date))
 * // => [2024-01-03, 2024-01-02, 2024-01-01]
 * ```
 *
 * @see ascending - for ascending order
 * @see byKey - for sorting by object key directly
 */
export function descending<T, C extends number | string | Date>(
  fn: ComparableExtractor<T, C>
): Comparator<T>
export function descending<T, C extends number | string | Date>(
  fn: ComparableExtractor<T, C>
): Comparator<T> {
  return (a, b) => {
    const aVal = fn(a)
    const bVal = fn(b)

    if (aVal < bVal) return 1
    if (aVal > bVal) return -1
    return 0
  }
}

/**
 * Creates a comparator for natural string sorting.
 *
 * Natural sorting handles numbers within strings intelligently:
 * - "file2.txt" comes before "file10.txt" (not after as with lexicographic sort)
 * - Properly handles mixed alphanumeric strings
 *
 * @param fn - Function to extract the string value
 * @returns A comparator function for natural string sorting
 *
 * @example
 * ```typescript
 * const files = ['file10.txt', 'file2.txt', 'file1.txt', 'file20.txt']
 *
 * // Lexicographic sort (incorrect for numbers)
 * files.sort() // => ['file1.txt', 'file10.txt', 'file2.txt', 'file20.txt']
 *
 * // Natural sort (correct for numbers)
 * files.sort(natural(x => x))
 * // => ['file1.txt', 'file2.txt', 'file10.txt', 'file20.txt']
 *
 * // With objects
 * interface File {
 *   name: string
 *   size: number
 * }
 *
 * const fileObjects = [
 *   { name: 'image10.png', size: 1024 },
 *   { name: 'image2.png', size: 2048 },
 *   { name: 'image1.png', size: 512 }
 * ]
 *
 * fileObjects.sort(natural(f => f.name))
 * // => [{ name: 'image1.png', ... }, { name: 'image2.png', ... }, { name: 'image10.png', ... }]
 * ```
 *
 * @see ascending - for standard ascending sort
 * @see caseInsensitive - for case-insensitive comparison
 */
export function natural<T>(fn: ComparableExtractor<T, string>): Comparator<T>
export function natural<T>(fn: ComparableExtractor<T, string>): Comparator<T> {
  return (a, b) => {
    const aVal = fn(a)
    const bVal = fn(b)

    // Use locale compare with numeric option for natural sorting
    return aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' })
  }
}

/**
 * Creates a comparator that sorts by a specific object key.
 *
 * Convenience function for the common case of sorting objects by a property.
 *
 * @param key - The object key to sort by
 * @returns A comparator function
 *
 * @example
 * ```typescript
 * interface Product {
 *   id: string
 *   name: string
 *   price: number
 *   stock: number
 * }
 *
 * const products = [
 *   { id: 'c', name: 'Keyboard', price: 80, stock: 5 },
 *   { id: 'a', name: 'Mouse', price: 25, stock: 10 },
 *   { id: 'b', name: 'Monitor', price: 300, stock: 3 }
 * ]
 *
 * // Sort by price
 * products.sort(byKey('price'))
 * // => [{ name: 'Mouse', price: 25, ... }, { name: 'Keyboard', price: 80, ... }, ...]
 *
 * // Sort by name
 * products.sort(byKey('name'))
 * // => [{ name: 'Keyboard', ... }, { name: 'Monitor', ... }, { name: 'Mouse', ... }]
 *
 * // Sort by ID
 * products.sort(byKey('id'))
 * // => [{ id: 'a', ... }, { id: 'b', ... }, { id: 'c', ... }]
 * ```
 *
 * @see ascending - for custom extraction with ascending order
 * @see descending - for custom extraction with descending order
 */
export function byKey<T, K extends keyof T>(key: K): Comparator<T> {
  return (a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
    return 0
  }
}
