import * as R from 'remeda'
import { fromNullable, map, type Result } from '@ontologyio/receta/result'

export type ParseSemverError = {
  readonly code: 'INVALID_VERSION'
  readonly input: string
  readonly message: string
}

export type ParseSemverVersion = {
  readonly major: number
  readonly minor: number
  readonly patch: number
  /** `1.0.0-beta.2` gives `['beta', 2]`: numeric parts are numbers, so they compare as numbers. */
  readonly prerelease: readonly (string | number)[]
  /** `1.0.0+sha.5114f85` gives `['sha', '5114f85']`. Build metadata never affects ordering. */
  readonly build: readonly string[]
}

const SEMVER =
  /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
const NUMERIC = /^(0|[1-9]\d*)$/

const identifiers = (part: string | undefined): readonly string[] =>
  part === undefined ? [] : R.split(part, '.')

/**
 * Parses a semantic version such as `v2.1.0-beta.3+build.7` into its numbered parts.
 *
 * Use when: comparing app, API, plugin or schema versions, checking a minimum client
 * version, or reading a git tag, where string comparison gets `1.10.0` versus `1.9.0` wrong.
 * A leading `v` and surrounding spaces are allowed. Ranges such as `^1.2` and partial
 * versions such as `1.2` are an `Err`: this reads one exact version.
 *
 * @example
 * ```ts
 * parseSemver('v2.1.0-beta.3+build.7')
 * // => Ok({ major: 2, minor: 1, patch: 0, prerelease: ['beta', 3], build: ['build', '7'] })
 *
 * parseSemver('1.10.0')
 * // => Ok({ major: 1, minor: 10, patch: 0, prerelease: [], build: [] })
 *
 * parseSemver('1.2')
 * // => Err({ code: 'INVALID_VERSION', input: '1.2', message: 'Expected a version such as 1.4.2 or 2.0.0-rc.1, got "1.2"' })
 * ```
 *
 * @tags semver, version, release, tag, compare, prerelease, upgrade, compatibility
 * @see fromNullable - @ontologyio/receta/result, turns a failed match into an Err
 */
export function parseSemver(input: string): Result<ParseSemverVersion, ParseSemverError> {
  return R.pipe(
    fromNullable(SEMVER.exec(input.trim()), {
      code: 'INVALID_VERSION',
      input,
      message: `Expected a version such as 1.4.2 or 2.0.0-rc.1, got "${input}"`,
    } satisfies ParseSemverError),
    map(([, major = '0', minor = '0', patch = '0', prerelease, build]) => ({
      major: Number(major),
      minor: Number(minor),
      patch: Number(patch),
      prerelease: R.map(identifiers(prerelease), (part) => (NUMERIC.test(part) ? Number(part) : part)),
      build: identifiers(build),
    })),
  )
}
