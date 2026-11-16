import * as R from 'remeda'
import { match, tryCatch } from '@ontologyio/receta/option'
import { by, endsWith, eq, oneOf, or } from '@ontologyio/receta/predicate'
import { flatMap, fromPredicate, invalid, map, required, validate, type Validation } from '@ontologyio/receta/validation'

export type ValidateUrlFieldRules = {
  /** Schemes allowed, with their colon: `['https:']`, or `['http:', 'https:']`. */
  readonly protocols: readonly string[]
  /** Hosts allowed, each with its subdomains: `['example.com']` also lets `www.example.com` in. Any host when absent. */
  readonly hosts?: readonly string[]
}

const isHostOrSubdomainOf = (hosts: readonly string[]) =>
  or(...R.map(hosts, (allowed) => or(eq(allowed), endsWith(`.${allowed}`))))

/**
 * Checks a URL a person typed against allowed schemes and hosts, and returns the trimmed URL.
 *
 * Use when: a profile, webhook, link or redirect field takes a URL that you will store, fetch
 * or render as a link, and `javascript:` links or URLs on someone else's domain must be
 * refused. It needs a full URL with a scheme; `example.com` alone is refused with a hint.
 * Host matching ignores case and includes subdomains.
 *
 * @example
 * ```ts
 * validateUrlField(' https://docs.example.com/start ', { protocols: ['https:'], hosts: ['example.com'] })
 * // => Valid('https://docs.example.com/start')
 *
 * validateUrlField('javascript:alert(1)', { protocols: ['http:', 'https:'] })
 * // => Invalid(['Use a link starting with http: or https:'])
 *
 * R.pipe('http://evil.test/x', validateUrlField({ protocols: ['https:'], hosts: ['example.com'] }))
 * // => Invalid(['Use a link starting with https:', 'Use a link on example.com'])
 *
 * validateUrlField('example.com', { protocols: ['https:'] })
 * // => Invalid(['Enter a full link, like https://example.com'])
 * ```
 *
 * @tags url, link, website, webhook, redirect, protocol, host, allowlist, xss, field
 * @see tryCatch - @ontologyio/receta/option, the URL parse that can't throw
 */
export function validateUrlField(input: string, rules: ValidateUrlFieldRules): Validation<string, string>
export function validateUrlField(rules: ValidateUrlFieldRules): (input: string) => Validation<string, string>
export function validateUrlField(...args: unknown[]): unknown {
  return R.purry(validateUrlFieldImplementation, args)
}

const validateUrlFieldImplementation = (input: string, rules: ValidateUrlFieldRules): Validation<string, string> => {
  const text = input.trim()
  const hosts = R.map(rules.hosts ?? [], (host) => host.toLowerCase())
  const checks = validate<URL, string>([
    fromPredicate(by((url: URL) => url.protocol, oneOf(rules.protocols)), `Use a link starting with ${R.join(rules.protocols, ' or ')}`),
    ...(R.isEmpty(hosts)
      ? []
      : [fromPredicate(by((url: URL) => url.hostname, isHostOrSubdomainOf(hosts)), `Use a link on ${R.join(hosts, ' or ')}`)]),
  ])
  return R.pipe(
    text,
    required('Enter a link'),
    flatMap(() =>
      R.pipe(
        tryCatch(() => new URL(text)),
        match({
          onSome: checks,
          onNone: () => invalid('Enter a full link, like https://example.com'),
        }),
      ),
    ),
    map(() => text),
  )
}
