/**
 * Lens module - Composable getters and setters for immutable updates.
 *
 * Lenses provide a functional approach to reading and updating nested data
 * structures without mutation. They compose naturally and work seamlessly
 * with Remeda's pipe.
 *
 * @module lens
 */

// Types
export type { Lens, Path, PathValue } from './types'

// Constructors
export { lens } from './lens'
export { prop } from './prop'
export { path } from './path'
export { index } from './indexLens'

// Operations
export { view } from './view'
export { set } from './set'
export { over } from './over'

// Composition
export { compose } from './compose'
export { optional } from './optional'
