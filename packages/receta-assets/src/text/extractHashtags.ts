import * as R from 'remeda'
import { not } from '@ontologyio/receta/predicate'
import { extract, isNumeric } from '@ontologyio/receta/string'

// A # not glued to a word or an HTML entity, then letters, digits or underscores in any script.
const HASHTAG = /(?<![\p{L}\p{N}_&#])#[\p{L}\p{N}_]+/gu

/**
 * Finds the hashtags in a post, lowercased, without `#`, each once, in order of appearance.
 *
 * Use when: indexing posts, comments or captions by topic, or suggesting tags from text.
 * Tags in any script work (`#café`, `#東京`). A `#` inside a word (`C#`), in an HTML entity
 * (`&#39;`) or in a URL fragment is not a tag, and neither is a tag of digits alone such as
 * `#1`. Tags compare without case, so `#Launch` and `#launch` give one tag.
 *
 * @example
 * ```ts
 * extractHashtags('Launch day! #Launch #TypeScript, we are #1 #launch')
 * // => ['launch', 'typescript']
 *
 * extractHashtags('Café crawl #café #東京 in C# &#39;24')
 * // => ['café', '東京']
 *
 * extractHashtags('no tags here')
 * // => []
 * ```
 *
 * @tags hashtag, tags, social, extract, topics, parse, twitter, instagram
 * @see extract - @ontologyio/receta/string, finds every match of a pattern
 * @see extractMentions - the same for `@username`
 */
export function extractHashtags(text: string): readonly string[] {
  return R.pipe(
    extract(text, HASHTAG),
    R.map((tag) => tag.slice(1).toLowerCase()),
    R.filter(not(isNumeric)),
    R.unique(),
  )
}
