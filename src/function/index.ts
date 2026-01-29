/**
 * Function combinators and utilities for composing, transforming, and controlling function behavior.
 * @module
 */

// Types
export type { Predicate, Mapper, CondPair, FunctionTuple, ReturnTypes } from './types'
export type { GuardPair } from './guard'

// Conditional combinators
export { ifElse } from './ifElse'
export { when } from './when'
export { unless } from './unless'
export { cond } from './cond'
export { guard } from './guard'
export { switchCase } from './switchCase'

// Composition utilities
export { compose } from './compose'
export { converge } from './converge'
export { juxt } from './juxt'
export { ap } from './ap'

// Function utilities
export { flip } from './flip'
export { partial } from './partial'
export { partialRight } from './partialRight'
export { unary, binary, nAry } from './arity'

// Control flow
export { tap } from './tap'
export { tryCatch } from './tryCatch'
export { memoize } from './memoize'
