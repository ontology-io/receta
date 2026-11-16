import * as R from 'remeda'
import { compose, descending } from '@ontologyio/receta/compare'
import { fromNullable, isSome, map, type Option } from '@ontologyio/receta/option'

/**
 * Picks the newest stable version from a list of version strings, ignoring pre-releases.
 *
 * Use when: deciding what to show as "latest", whether an upgrade is available, or which
 * release a "stable" channel points to. Pre-releases like '2.0.0-rc.1' and strings that aren't
 * versions are skipped. A leading `v` is allowed and kept in the result. Returns `None` when no
 * stable version is in the list.
 *
 * @example
 * ```ts
 * latestVersion(['1.9.0', 'v1.10.2', '2.0.0-rc.1', '1.10.0', 'nightly'])
 * // => Some('v1.10.2')
 *
 * latestVersion(['3.0.0-alpha', '3.0.0-beta'])
 * // => None
 * ```
 *
 * @tags version, latest, newest, semver, release, stable, upgrade, update available
 * @see sortVersions - every version in order, pre-releases included
 * @see descending - @ontologyio/receta/compare, the highest-first order
 */
export function latestVersion(versions: readonly string[]): Option<string> {
  return R.pipe(
    versions,
    R.map(parseStable),
    R.filter(isSome),
    R.map((parsed) => parsed.value),
    R.sort(newestFirst),
    R.first(),
    fromNullable,
    map((version) => version.text),
  )
}

type Stable = { readonly text: string; readonly major: number; readonly minor: number; readonly patch: number }

// Major, optional minor and patch, and build metadata, but no pre-release part.
const STABLE = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\+[0-9A-Za-z.-]+)?$/

const parseStable = (text: string): Option<Stable> =>
  map(fromNullable(STABLE.exec(text.trim())), ([, major, minor, patch]) => ({
    text,
    major: Number(major),
    minor: Number(minor ?? 0),
    patch: Number(patch ?? 0),
  }))

const newestFirst = compose<Stable>(
  descending((version) => version.major),
  descending((version) => version.minor),
  descending((version) => version.patch),
)
