// Reads the code samples shown on the page. Each sample is a real file in
// src/samples that the compiler and tests check, so the page can't show code that
// doesn't work. Start at readSample.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import * as R from 'remeda'
import { err, flatMap, ok, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type SampleError =
  | { readonly code: 'SAMPLE_UNREADABLE'; readonly message: string; readonly cause: unknown }
  | { readonly code: 'SAMPLE_REGION_MISSING'; readonly message: string }

const SAMPLES_DIRECTORY = path.join(process.cwd(), 'src/samples')
const REGION_START = '// #region sample'
const REGION_END = '// #endregion'

/**
 * Reads the lines between the region markers of a sample file.
 *
 * Fails with SAMPLE_UNREADABLE when the file can't be read, or
 * SAMPLE_REGION_MISSING when the markers aren't there.
 */
export const readSample = async (
  fileName: string,
): Promise<Result<readonly string[], SampleError>> =>
  R.pipe(
    await readSampleFile(fileName),
    flatMap((source) => extractRegion(source, fileName)),
  )

/** Returns the lines inside a sample's region markers. */
export const extractRegion = (
  source: string,
  fileName: string,
): Result<readonly string[], SampleError> => {
  const lines = source.split('\n')
  const start = lines.indexOf(REGION_START)
  const end = lines.indexOf(REGION_END)
  return start >= 0 && end > start
    ? ok(lines.slice(start + 1, end))
    : err({ code: 'SAMPLE_REGION_MISSING', message: `${fileName} has no sample region` })
}

const readSampleFile = (fileName: string): Promise<Result<string, SampleError>> =>
  tryCatchAsync(
    () => readFile(path.join(SAMPLES_DIRECTORY, fileName), 'utf8'),
    (cause): SampleError => ({
      code: 'SAMPLE_UNREADABLE',
      message: `Could not read ${fileName}`,
      cause,
    }),
  )
