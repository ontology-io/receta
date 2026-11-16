import * as R from 'remeda'
import { round } from '@ontologyio/receta/number'
import { map, toResult } from '@ontologyio/receta/option'
import type { Result } from '@ontologyio/receta/result'
import { isHexColor } from '@ontologyio/receta/string'

export type ParseHexColorError = {
  readonly code: 'INVALID_HEX_COLOR'
  readonly input: string
  readonly message: string
}

export type ParseHexColorRgba = {
  /** Red, 0 to 255. */
  readonly r: number
  /** Green, 0 to 255. */
  readonly g: number
  /** Blue, 0 to 255. */
  readonly b: number
  /** Opacity, 0 to 1, rounded to 2 decimals; 1 when the color has no alpha digits. */
  readonly a: number
}

/** `fc0` → `ffcc00`, so every form has two digits per channel. */
const expand = (hex: string): string =>
  hex.length === 3 ? R.join(R.map(R.split(hex, ''), (digit) => `${digit}${digit}`), '') : hex

const toRgba = (color: string): ParseHexColorRgba => {
  const [r = 0, g = 0, b = 0, alpha = 255] = R.pipe(
    expand(color.replace(/^#/, '')),
    R.split(''),
    R.chunk(2),
    R.map((pair) => Number.parseInt(R.join(pair, ''), 16)),
  )
  return { r, g, b, a: round(alpha / 255, 2) }
}

/**
 * Parses a CSS hex color such as `#fc0`, `#ffcc00` or `#ffcc0080` into red, green, blue and alpha numbers.
 *
 * Use when: a theme, a brand color setting or a user-picked color arrives as hex and the code
 * needs the channels, to compute contrast, mix colors, build an `rgba()` string or pass it to
 * a canvas or chart. The `#` is optional and case doesn't matter. Three, six and eight
 * digits are accepted; anything else, including four-digit `#fc08`, is an `Err`.
 *
 * @example
 * ```ts
 * parseHexColor('#fc0')
 * // => Ok({ r: 255, g: 204, b: 0, a: 1 })
 *
 * parseHexColor('1E90FF80')
 * // => Ok({ r: 30, g: 144, b: 255, a: 0.5 })
 *
 * parseHexColor('#ggg')
 * // => Err({ code: 'INVALID_HEX_COLOR', input: '#ggg', message: 'Expected a hex color such as #fc0, #ffcc00 or #ffcc0080, got "#ggg"' })
 * ```
 *
 * @tags color, hex, rgb, rgba, css, theme, alpha, contrast
 * @see isHexColor - @ontologyio/receta/string, the format check
 * @see toResult - @ontologyio/receta/option, adds the reason when the check fails
 */
export function parseHexColor(input: string): Result<ParseHexColorRgba, ParseHexColorError> {
  return R.pipe(
    isHexColor(input.trim()),
    map(toRgba),
    toResult<ParseHexColorError>({
      code: 'INVALID_HEX_COLOR',
      input,
      message: `Expected a hex color such as #fc0, #ffcc00 or #ffcc0080, got "${input}"`,
    }),
  )
}
