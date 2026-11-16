import * as R from 'remeda'
import { not, oneOf } from '@ontologyio/receta/predicate'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type SortTopologicallyError<K> = {
  readonly code: 'MISSING_DEPENDENCY' | 'CYCLE'
  /** The missing ids, or every id that couldn't be placed because of a cycle. */
  readonly ids: readonly K[]
  readonly message: string
}

/**
 * Orders items so each comes after everything it depends on, or reports the missing or circular dependencies.
 *
 * Use when: running database migrations, build steps, setup tasks or plugin initialisation in
 * dependency order. Items that become ready together keep their input order, so the output is
 * stable. A dependency on an id that isn't in the list fails with `MISSING_DEPENDENCY`. Items
 * that wait on each other fail with `CYCLE`, listing every item left unplaced, including those
 * that only depend on the cycle.
 *
 * ```text
 *  items ──▶ ⟨ all dependencies listed? ⟩──no───▶ ╭─────────────────────────╮
 *                         │ yes                   │ Err(MISSING_DEPENDENCY) │
 *                         ▼                       ╰─────────────────────────╯
 *            ⟨ items left to place? ⟩──no───▶ ╭──────────────────╮
 *                         │ yes               │ Ok(placed items) │
 *                         ▼                   ╰──────────────────╯
 *   ┌───────────────────────────────────────────┐
 *   │ take every item whose dependencies are    │
 *   │ all placed, in input order                │
 *   └─────────────────────┬─────────────────────┘
 *                         ▼
 *               ⟨ any item taken? ⟩──no──▶ ╭──────────────────────╮
 *                         │ yes            │ Err(CYCLE, ids left) │
 *                         ▼                ╰──────────────────────╯
 *   place them ──▶ next round: ⟨ items left to place? ⟩
 * ```
 *
 * @example
 * ```ts
 * import { map } from '@ontologyio/receta/result'
 *
 * const steps = [
 *   { name: 'deploy', needs: ['build', 'test'] },
 *   { name: 'build', needs: ['install'] },
 *   { name: 'test', needs: ['build'] },
 *   { name: 'install', needs: [] },
 * ]
 *
 * R.pipe(sortTopologically(steps, (step) => step.name, (step) => step.needs), map(R.map(R.prop('name'))))
 * // => Ok(['install', 'build', 'test', 'deploy'])
 *
 * const loop = [{ name: 'a', needs: ['b'] }, { name: 'b', needs: ['a'] }, { name: 'c', needs: [] }]
 * R.pipe(loop, sortTopologically((step) => step.name, (step) => step.needs))
 * // => Err({ code: 'CYCLE', ids: ['a', 'b'], message: 'These items depend on each other in a cycle, or on one that does: a, b' })
 *
 * sortTopologically([{ name: 'ship', needs: ['lint'] }], (step) => step.name, (step) => step.needs)
 * // => Err({ code: 'MISSING_DEPENDENCY', ids: ['lint'], message: 'These dependencies are not in the list: lint' })
 * ```
 *
 * @tags sort, topological, dependencies, dependency order, dag, graph, migrations, build order, cycle
 * @see sortByCustomOrder - a fixed order when there is no dependency graph
 * @see oneOf - @ontologyio/receta/predicate, checks dependencies against what is placed
 */
export function sortTopologically<T, K extends string | number>(
  items: readonly T[],
  id: (item: T) => K,
  dependsOn: (item: T) => readonly K[],
): Result<readonly T[], SortTopologicallyError<K>>
export function sortTopologically<T, K extends string | number>(
  id: (item: T) => K,
  dependsOn: (item: T) => readonly K[],
): (items: readonly T[]) => Result<readonly T[], SortTopologicallyError<K>>
export function sortTopologically(...args: unknown[]): unknown {
  return R.purry(sortTopologicallyImplementation, args)
}

const sortTopologicallyImplementation = <T, K extends string | number>(
  items: readonly T[],
  id: (item: T) => K,
  dependsOn: (item: T) => readonly K[],
): Result<readonly T[], SortTopologicallyError<K>> => {
  const missing = R.pipe(items, R.flatMap(dependsOn), R.unique(), R.filter(not(oneOf(R.map(items, id)))))
  if (missing.length > 0) {
    const message = `These dependencies are not in the list: ${R.join(missing, ', ')}`
    return err({ code: 'MISSING_DEPENDENCY', ids: missing, message })
  }

  // Each round places every item whose dependencies are already placed.
  const placeRounds = (placed: readonly T[], remaining: readonly T[]): Result<readonly T[], SortTopologicallyError<K>> => {
    if (remaining.length === 0) return ok(placed)
    const isPlaced = oneOf(R.map(placed, id))
    const [ready, waiting] = R.partition(remaining, (item) => dependsOn(item).every(isPlaced))
    if (ready.length === 0) {
      const ids = R.map(waiting, id)
      const message = `These items depend on each other in a cycle, or on one that does: ${R.join(ids, ', ')}`
      return err({ code: 'CYCLE', ids, message })
    }
    return placeRounds([...placed, ...ready], waiting)
  }
  return placeRounds([], items)
}
