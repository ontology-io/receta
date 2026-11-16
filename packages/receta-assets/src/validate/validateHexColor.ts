import * as R from 'remeda'
import { map as mapOption, match } from '@ontologyio/receta/option'
import { isHexColor } from '@ontologyio/receta/string'
import { invalid, valid, type Validation } from '@ontologyio/receta/validation'

/** `#AbC` becomes `#aabbcc`; six and eight digit colors are only lowercased. */
const expand = (color: string): string => {
  const digits = color.replace('#', '').toLowerCase()
  return digits.length === 3 ? `#${R.join(R.map(digits.split(''), (digit) => digit + digit), '')}` : `#${digits}`
}

/**
 * Checks a hex color a person typed and returns it in one stored form: `#` and six lowercase digits.
 *
 * Use when: a theme, brand or label editor takes a color, and `FFF`, `#fff` and `#FFFFFF`
 * should all be stored the same way. The `#` is optional and the input is trimmed. Shorthand
 * colors are expanded to six digits; eight-digit colors with alpha are kept and lowercased.
 *
 * @example
 * ```ts
 * validateHexColor(' F0A ')
 * // => Valid('#ff00aa')
 *
 * validateHexColor('#1A2B3C80')
 * // => Valid('#1a2b3c80')
 *
 * validateHexColor('red')
 * // => Invalid(['Enter a color like #1a2b3c'])
 * ```
 *
 * @tags color, colour, hex, css, theme, brand, picker, normalize
 * @see isHexColor - @ontologyio/receta/string, the shape check
 */
export function validateHexColor(input: string): Validation<string, string> {
  return R.pipe(
    isHexColor(input.trim()),
    mapOption(expand),
    match<string, Validation<string, string>>({
      onSome: valid,
      onNone: () => invalid('Enter a color like #1a2b3c'),
    }),
  )
}
