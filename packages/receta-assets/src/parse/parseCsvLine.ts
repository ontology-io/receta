import * as R from 'remeda'
import { isSome, none, some, type Option } from '@ontologyio/receta/option'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type ParseCsvLineError = {
  readonly code: 'UNTERMINATED_QUOTE' | 'TEXT_AFTER_QUOTE'
  readonly input: string
  /** The character where it went wrong, counting from 1. */
  readonly column: number
  readonly message: string
}

type Mode = 'start' | 'unquoted' | 'quoted' | 'quoteSeen'

type State = {
  readonly fields: readonly string[]
  readonly field: string
  readonly mode: Mode
  readonly failure: Option<ParseCsvLineError>
}

const read =
  (line: string, delimiter: string) =>
  (state: State, char: string, index: number): State => {
    if (isSome(state.failure)) return state
    const endField = (): State => ({ ...state, fields: [...state.fields, state.field], field: '', mode: 'start' })
    const add = (text: string, mode: Mode): State => ({ ...state, field: state.field + text, mode })
    switch (state.mode) {
      case 'start':
        if (char === '"') return { ...state, mode: 'quoted' }
        return char === delimiter ? endField() : add(char, 'unquoted')
      case 'unquoted':
        return char === delimiter ? endField() : add(char, 'unquoted')
      case 'quoted':
        return char === '"' ? { ...state, mode: 'quoteSeen' } : add(char, 'quoted')
      case 'quoteSeen':
        if (char === '"') return add('"', 'quoted')
        if (char === delimiter) return endField()
        return {
          ...state,
          failure: some({
            code: 'TEXT_AFTER_QUOTE',
            input: line,
            column: index + 1,
            message: `Unexpected "${char}" after a closing quote at column ${index + 1}`,
          }),
        }
    }
  }

/**
 * Splits one CSV line into its fields, honouring quotes, so `a,"b, c","say ""hi"""` gives `['a', 'b, c', 'say "hi"']`.
 *
 * Use when: reading lines of a CSV or TSV export, a spreadsheet paste or a log, where fields
 * may contain the delimiter or quotes and a plain split would cut them apart. Pass `','`,
 * `';'` or `'\t'`. A quote only opens a field as its first character, `""` inside quotes is
 * one quote, spaces are kept as written, and a trailing `\r` from Windows line endings is
 * dropped. A quoted field that runs past the end of the line is an `Err`: split the file
 * with a full CSV parser if fields can contain line breaks.
 *
 * ```text
 *  STATE       SEES         DOES                          NEXT
 *  ──────────  ───────────  ────────────────────────────  ──────────
 *  start       "            open a quoted field           quoted
 *  start       delimiter    end an empty field            start
 *  start       other        begin the field               unquoted
 *  unquoted    delimiter    end the field                 start
 *  unquoted    other        add it                        unquoted
 *  quoted      "            may be the closing quote      quote seen
 *  quoted      other        add it, delimiters too        quoted
 *  quoted      end of line  Err(UNTERMINATED_QUOTE)       stop
 *  quote seen  "            add one " ("" is an escape)   quoted
 *  quote seen  delimiter    end the field                 start
 *  quote seen  other        Err(TEXT_AFTER_QUOTE)         stop
 * ```
 *
 * @example
 * ```ts
 * parseCsvLine('42,"Lovelace, Ada","said ""hi""",', ',')
 * // => Ok(['42', 'Lovelace, Ada', 'said "hi"', ''])
 *
 * R.pipe('a;b;;c\r', parseCsvLine(';'))
 * // => Ok(['a', 'b', '', 'c'])
 *
 * parseCsvLine('1,"open', ',')
 * // => Err({ code: 'UNTERMINATED_QUOTE', input: '1,"open', column: 8, message: 'A quoted field is still open at the end of the line' })
 *
 * parseCsvLine('"a"b,c', ',')
 * // => Err({ code: 'TEXT_AFTER_QUOTE', input: '"a"b,c', column: 4, message: 'Unexpected "b" after a closing quote at column 4' })
 * ```
 *
 * @tags csv, tsv, split, fields, quotes, delimiter, spreadsheet, import
 * @see parseCommaList - for simple lists without quoting
 */
export function parseCsvLine(line: string, delimiter: string): Result<readonly string[], ParseCsvLineError>
export function parseCsvLine(delimiter: string): (line: string) => Result<readonly string[], ParseCsvLineError>
export function parseCsvLine(...args: unknown[]): unknown {
  return R.purry(parseCsvLineImplementation, args)
}

const parseCsvLineImplementation = (
  line: string,
  delimiter: string,
): Result<readonly string[], ParseCsvLineError> => {
  const text = line.replace(/\r$/, '')
  const start: State = { fields: [], field: '', mode: 'start', failure: none() }
  const end = R.reduce(R.split(text, ''), read(text, delimiter), start)
  if (isSome(end.failure)) return err({ ...end.failure.value, input: line })
  if (end.mode === 'quoted') {
    return err({
      code: 'UNTERMINATED_QUOTE',
      input: line,
      column: text.length + 1,
      message: 'A quoted field is still open at the end of the line',
    })
  }
  return ok([...end.fields, end.field])
}
