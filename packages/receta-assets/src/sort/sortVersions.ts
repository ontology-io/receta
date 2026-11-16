import * as R from 'remeda'
import { ascending, byBoolean, compose, natural } from '@ontologyio/receta/compare'
import { fromNullable, map, unwrapOr } from '@ontologyio/receta/option'

/**
 * Sorts version strings oldest first by semantic versioning, so '1.10.0' comes after '1.9.0'.
 *
 * Use when: listing releases, package versions, API versions or firmware builds. A leading `v`
 * is allowed, and a missing minor or patch counts as 0. A pre-release sorts before its release
 * ('1.0.0-beta.2' < '1.0.0-beta.11' < '1.0.0'), and build metadata after `+` is ignored for the
 * order. Strings that aren't versions, like 'latest', go last. Reverse the result for newest
 * first.
 *
 * @example
 * ```ts
 * sortVersions(['1.10.0', 'v1.2', '1.9.0', '1.10.0-beta.11', 'latest', '1.10.0-beta.2', '2.0.0-rc.1'])
 * // => ['v1.2', '1.9.0', '1.10.0-beta.2', '1.10.0-beta.11', '1.10.0', '2.0.0-rc.1', 'latest']
 *
 * R.pipe(['3.0.0', '3.0.0-alpha', '2.11.4'], sortVersions, R.reverse())
 * // => ['3.0.0', '3.0.0-alpha', '2.11.4']
 * ```
 *
 * @tags sort, versions, semver, releases, tags, changelog, prerelease, upgrade, compare versions
 * @see latestVersion - just the newest stable version
 * @see sortNatural - numbers inside any text, without semver rules
 */
export function sortVersions(versions: readonly string[]): readonly string[] {
  return R.pipe(
    versions,
    R.map(parseVersion),
    R.sort(oldestFirst),
    R.map((entry) => entry.text),
  )
}

type Version = {
  readonly text: string
  readonly isVersion: boolean
  readonly major: number
  readonly minor: number
  readonly patch: number
  readonly isRelease: boolean
  readonly prerelease: string
}

const VERSION = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/

const parseVersion = (text: string): Version =>
  R.pipe(
    fromNullable(VERSION.exec(text.trim())),
    map(([, major, minor, patch, prerelease]) => ({
      text,
      isVersion: true,
      major: Number(major),
      minor: Number(minor ?? 0),
      patch: Number(patch ?? 0),
      isRelease: prerelease === undefined,
      prerelease: prerelease ?? '',
    })),
    unwrapOr<Version>({ text, isVersion: false, major: 0, minor: 0, patch: 0, isRelease: false, prerelease: '' }),
  )

const oldestFirst = compose<Version>(
  // false before true, so anything that isn't a version goes after every version.
  byBoolean((version) => !version.isVersion),
  ascending((version) => version.major),
  ascending((version) => version.minor),
  ascending((version) => version.patch),
  // A pre-release (not a release) comes before the release it leads to.
  byBoolean((version) => version.isRelease),
  natural((version) => version.prerelease),
  natural((version) => version.text),
)
