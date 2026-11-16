import * as R from 'remeda'
import { fromNullable, match } from '@ontologyio/receta/option'
import { oneOf } from '@ontologyio/receta/predicate'
import {
  flatMap,
  matches,
  maxLength,
  required,
  schema,
  valid,
  type FieldError,
  type Validation,
  type Validator,
} from '@ontologyio/receta/validation'

export type ValidateAddressInput = {
  readonly line1: string
  readonly line2: string
  readonly city: string
  readonly region: string
  readonly postalCode: string
  /** ISO 3166-1 alpha-2 code, such as `US` or `GB`. */
  readonly country: string
}

/** Postal code shape and a sample to show in the message, for the countries it knows. */
const POSTAL_CODES: Readonly<Record<string, readonly [RegExp, string]>> = {
  AU: [/^\d{4}$/, '2000'],
  CA: [/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/, 'K1A 0B1'],
  DE: [/^\d{5}$/, '10115'],
  EG: [/^\d{5}$/, '11511'],
  FR: [/^\d{5}$/, '75001'],
  GB: [/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/, 'SW1A 1AA'],
  IN: [/^\d{6}$/, '110001'],
  JP: [/^\d{3}-?\d{4}$/, '100-0001'],
  NL: [/^\d{4} ?[A-Z]{2}$/, '1012 AB'],
  US: [/^\d{5}(?:-\d{4})?$/, '94103'],
}

/** Countries whose addresses need a state, province or territory. */
const needsRegion = oneOf<string>(['AU', 'CA', 'US'])

const postalCodeFor = (country: string): Validator<string, string, string> =>
  R.pipe(
    fromNullable(POSTAL_CODES[country]),
    match({
      onSome: ([pattern, sample]) => (code: string) =>
        R.pipe(code, required('Enter the postal code'), flatMap(matches(pattern, `Enter a postal code like ${sample}`))),
      // Unknown countries, and countries without postal codes, take anything up to 20 characters.
      onNone: () => maxLength(20, 'Postal code must be at most 20 characters'),
    }),
  )

/**
 * Checks a postal address form, with postal code and region rules that follow the country.
 *
 * Use when: a checkout, shipping or billing form collects an address and should catch a
 * missing city or a malformed ZIP before a carrier or payment provider rejects it. Every value
 * is trimmed, and the country and postal code are uppercased; that tidied address is what
 * comes back. Postal codes are checked for AU, CA, DE, EG, FR, GB, IN, JP, NL and US; other
 * countries only get a length limit. A state or province is required in AU, CA and US.
 *
 * @example
 * ```ts
 * validateAddress({ line1: '1 Market St', line2: '', city: 'San Francisco', region: 'CA', postalCode: '94105', country: 'us' })
 * // => Valid({ line1: '1 Market St', line2: '', city: 'San Francisco', region: 'CA', postalCode: '94105', country: 'US' })
 *
 * validateAddress({ line1: '', line2: '', city: 'London', region: '', postalCode: '12345', country: 'GB' })
 * // => Invalid([
 * //   { field: 'line1', errors: ['Enter the street address'] },
 * //   { field: 'postalCode', errors: ['Enter a postal code like SW1A 1AA'] },
 * // ])
 *
 * validateAddress({ line1: 'Main Rd 4', line2: '', city: 'Ruritania City', region: '', postalCode: '', country: 'Ruritania' })
 * // => Invalid([{ field: 'country', errors: ['Choose a country'] }])
 * ```
 *
 * @tags address, postal, zip, postcode, shipping, billing, checkout, country, form
 * @see schema - @ontologyio/receta/validation, one validator per field, every field checked
 */
export function validateAddress(address: ValidateAddressInput): Validation<ValidateAddressInput, FieldError<string>> {
  const tidy: ValidateAddressInput = {
    line1: address.line1.trim(),
    line2: address.line2.trim(),
    city: address.city.trim(),
    region: address.region.trim(),
    postalCode: address.postalCode.trim().toUpperCase(),
    country: address.country.trim().toUpperCase(),
  }
  return schema<ValidateAddressInput, string>(
    {
      line1: (line) => R.pipe(line, required('Enter the street address'), flatMap(maxLength(100, 'Keep the street address under 100 characters'))),
      line2: maxLength(100, 'Keep the second address line under 100 characters'),
      city: required('Enter the city'),
      region: needsRegion(tidy.country) ? required('Enter the state or province') : valid,
      postalCode: postalCodeFor(tidy.country),
      country: matches(/^[A-Z]{2}$/, 'Choose a country'),
    },
    tidy,
  )
}
