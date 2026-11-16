// Sign-in with GitHub, so each person votes once. No accounts are stored: the session is a
// cookie holding the GitHub id and login, signed with SESSION_SECRET and kept 30 days.
//
//   /auth/login ── state cookie ──▶ github.com/login/oauth/authorize
//        ▲                                      │ code + state
//        │ back to the page                     ▼
//   session cookie ◀── /auth/callback: check state, swap the code for a token, read /user
import { isErr, parseJSON, tryCatchAsync } from '@ontologyio/receta/result'
import * as R from 'remeda'

export type Person = { readonly id: string; readonly login: string }

export type AuthConfig = {
  readonly clientId: string
  readonly clientSecret: string
  readonly sessionSecret: string
  /** Like `https://receta.dev/market`, with no trailing slash. */
  readonly baseUrl: string
  /** The path part of baseUrl, which scopes the cookies. Empty on a domain of its own. */
  readonly basePath: string
}

const SESSION = 'receta_session'
const STATE = 'receta_oauth_state'
const SESSION_SECONDS = 30 * 24 * 3600

const base64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromBase64url = (text: string): Uint8Array =>
  Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0))

const hmacKey = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])

const sign = async (payload: string, secret: string): Promise<string> =>
  base64url(new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), new TextEncoder().encode(payload))))

const cookies = (request: Request): ReadonlyMap<string, string> =>
  new Map(
    R.pipe(
      (request.headers.get('cookie') ?? '').split(';'),
      R.map((part) => part.trim()),
      R.filter((part) => part.includes('=')),
      R.map((part) => [part.slice(0, part.indexOf('=')), part.slice(part.indexOf('=') + 1)] as const),
    ),
  )

const cookie = (config: AuthConfig, name: string, value: string, maxAge: number): string =>
  `${name}=${value}; Path=${config.basePath || '/'}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`

/** The signed-in person, or undefined when there is no valid session. */
export const personOf = async (request: Request, config: AuthConfig): Promise<Person | undefined> => {
  const [payload, signature] = (cookies(request).get(SESSION) ?? '').split('.')
  if (payload === undefined || signature === undefined) return undefined
  const valid = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(config.sessionSecret),
    fromBase64url(signature),
    new TextEncoder().encode(payload),
  )
  if (!valid) return undefined
  const session = parseJSON<Person & { readonly exp: number }>(new TextDecoder().decode(fromBase64url(payload)))
  if (isErr(session) || session.value.exp <= Date.now() / 1000) return undefined
  return { id: session.value.id, login: session.value.login }
}

/** Only paths under the marketplace may be returned to, so the login can't redirect elsewhere. */
const safeReturn = (config: AuthConfig, target: string | null): string =>
  target !== null && target.startsWith(`${config.basePath}/`) && !target.startsWith('//') && !target.includes('\\')
    ? target
    : `${config.basePath}/`

export const login = (request: Request, config: AuthConfig): Response => {
  const state = base64url(crypto.getRandomValues(new Uint8Array(16)))
  const back = safeReturn(config, new URL(request.url).searchParams.get('return'))
  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', config.clientId)
  authorize.searchParams.set('redirect_uri', `${config.baseUrl}/auth/callback`)
  authorize.searchParams.set('state', state)
  authorize.searchParams.set('allow_signup', 'true')
  return new Response(null, {
    status: 302,
    headers: {
      location: authorize.href,
      'set-cookie': cookie(config, STATE, `${state}.${encodeURIComponent(back)}`, 600),
    },
  })
}

const failed = (message: string): Response => new Response(message, { status: 400 })

export const callback = async (request: Request, config: AuthConfig): Promise<Response> => {
  const url = new URL(request.url)
  // The state, a dot, then the page to return to; the state itself never holds a dot.
  const stateCookie = cookies(request).get(STATE) ?? ''
  const dot = stateCookie.indexOf('.')
  const expected = dot < 0 ? '' : stateCookie.slice(0, dot)
  const back = dot < 0 ? '' : stateCookie.slice(dot + 1)
  const code = url.searchParams.get('code')
  if (expected === '' || url.searchParams.get('state') !== expected || code === null) {
    return failed('Sign-in expired or was started elsewhere. Go back and try again.')
  }
  const person = await tryCatchAsync(async (): Promise<Person> => {
    const token = (await (
      await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: `${config.baseUrl}/auth/callback`,
        }),
      })
    ).json()) as { readonly access_token?: string }
    if (token.access_token === undefined) throw new Error('GitHub gave no token')
    const user = (await (
      await fetch('https://api.github.com/user', {
        headers: { authorization: `Bearer ${token.access_token}`, 'user-agent': 'receta-market', accept: 'application/json' },
      })
    ).json()) as { readonly id?: number; readonly login?: string }
    if (user.id === undefined || user.login === undefined) throw new Error('GitHub gave no user')
    return { id: String(user.id), login: user.login }
  })
  if (isErr(person)) return failed('GitHub sign-in failed. Go back and try again.')
  const payload = base64url(
    new TextEncoder().encode(JSON.stringify({ ...person.value, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })),
  )
  const headers = new Headers({ location: safeReturn(config, decodeURIComponent(back)) })
  headers.append('set-cookie', cookie(config, SESSION, `${payload}.${await sign(payload, config.sessionSecret)}`, SESSION_SECONDS))
  headers.append('set-cookie', cookie(config, STATE, '', 0))
  return new Response(null, { status: 302, headers })
}

export const logout = (config: AuthConfig): Response =>
  new Response(null, {
    status: 303,
    headers: { location: `${config.basePath}/`, 'set-cookie': cookie(config, SESSION, '', 0) },
  })
