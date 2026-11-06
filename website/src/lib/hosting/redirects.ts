// One public address for the site. The workers.dev address, the www form and plain HTTP
// all answer with a 301 to SITE_URL, so old links keep working and search engines count
// one site instead of three. Start at canonicalRedirect.
import { none, type Option, some } from '@ontologyio/receta/option'
import { SITE_URL } from '../../content/home.content'

const SITE = new URL(SITE_URL)

// npm keeps the READMEs of every release up to 0.4.2, and those link to the workers.dev
// address, so it has to keep answering for as long as those versions are read.
const OLD_HOSTS = new Set(['receta-website.khaled-mailhub.workers.dev', `www.${SITE.hostname}`])

const isOldAddress = ({ hostname, protocol }: URL): boolean =>
  OLD_HOSTS.has(hostname) || (hostname === SITE.hostname && protocol === 'http:')

/**
 * Where a request belongs when it arrived by an old address, keeping its path and query.
 * None means serve it here, which includes localhost, so the Worker still runs locally.
 */
export const canonicalRedirect = (requestUrl: string): Option<string> => {
  const url = new URL(requestUrl)
  return isOldAddress(url) ? some(`${SITE.origin}${url.pathname}${url.search}`) : none()
}
