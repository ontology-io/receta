import { describe, expect, it } from 'bun:test'
import { extractRegion } from './sample'

describe('extractRegion', () => {
  it('returns only the lines between the markers', () => {
    const source = 'hidden\n// #region sample\nshown\n// #endregion\nhidden'
    expect(extractRegion(source, 'a.ts')).toEqual({ _tag: 'Ok', value: ['shown'] })
  })

  it('fails with a declared error when the markers are missing', () => {
    const region = extractRegion('no markers', 'a.ts')
    expect(region).toEqual({
      _tag: 'Err',
      error: { code: 'SAMPLE_REGION_MISSING', message: 'a.ts has no sample region' },
    })
  })
})
