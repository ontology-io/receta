import * as R from 'remeda'
import { switchCase } from '@ontologyio/receta/function'
import { lt } from '@ontologyio/receta/predicate'

export type PullRequestSizeLabel = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

const bySize = switchCase<number, PullRequestSizeLabel>(
  [
    [lt(10), R.constant('XS')],
    [lt(30), R.constant('S')],
    [lt(100), R.constant('M')],
    [lt(500), R.constant('L')],
    [lt(1000), R.constant('XL')],
  ],
  'XXL',
)

/**
 * Labels a pull request XS to XXL by the lines it changes, for size labels and review routing.
 *
 * Use when: a bot or a CI step labels pull requests, asks for a second reviewer on big ones, or
 * nudges authors to split them. Takes the `additions` and `deletions` the GitHub and GitLab APIs
 * report and adds them up. Bands follow the Kubernetes size labels: XS under 10, S under 30,
 * M under 100, L under 500, XL under 1000, XXL from 1000.
 *
 * @example
 * ```ts
 * pullRequestSize({ additions: 6, deletions: 2 })
 * // => 'XS'
 *
 * pullRequestSize({ additions: 240, deletions: 60 })
 * // => 'L'
 *
 * pullRequestSize({ additions: 1000, deletions: 0 })
 * // => 'XXL'
 * ```
 *
 * @tags pull request, pr, size, label, github, gitlab, review, diff, code review
 * @see switchCase - @ontologyio/receta/function, the bands in order with XXL as the fallback
 * @see bandOf - bands with thresholds you choose
 */
export function pullRequestSize(changes: {
  readonly additions: number
  readonly deletions: number
}): PullRequestSizeLabel {
  return bySize(changes.additions + changes.deletions)
}
