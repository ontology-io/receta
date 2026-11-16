import { debounce } from '@ontologyio/receta/async'
import { tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type AutosaveOptions = {
  /** How long the input must stay quiet before the save runs. */
  readonly waitMs: number
}

export type AutosaveError = {
  readonly code: 'SAVE_FAILED'
  readonly error: unknown
  readonly message: string
}

/**
 * Wraps a save function so a burst of edits saves only the last draft, once the edits pause, and every call gets that save's Result.
 *
 * Use when: an editor, a settings form or a canvas saves as the user types, and each
 * keystroke must not become a request. Every call in a burst waits for the one save of the
 * last draft and gets its Result, so a failed save can be shown next to whichever edit is
 * on screen, and no call is left with a rejected promise nobody handles.
 *
 * @example
 * ```ts
 * const saved: string[] = []
 * const save = async (draft: string) => {
 *   saved.push(draft)
 *   return saved.length
 * }
 * const saveDraft = autosave(save, { waitMs: 5 })
 *
 * const first = saveDraft('H')
 * const last = saveDraft('Hey')
 * await last
 * // => Ok(1)
 *
 * await first
 * // => Ok(1)
 *
 * saved
 * // => ['Hey']
 *
 * const offline = autosave(async (_draft: string) => Promise.reject('offline'), { waitMs: 5 })
 * await offline('Hey')
 * // => Err({ code: 'SAVE_FAILED', error: 'offline', message: 'Saving the draft failed' })
 * ```
 *
 * @tags autosave, debounce, draft, editor, form, typing, save
 * @see latestOnly - runs every call, and keeps only the newest call's answer
 * @see debounce - @ontologyio/receta/async, the wait for a quiet moment
 */
export function autosave<D, T>(
  save: (draft: D) => Promise<T>,
  options: AutosaveOptions,
): (draft: D) => Promise<Result<T, AutosaveError>> {
  const debounced = debounce(save, { delay: options.waitMs })
  return (draft) =>
    tryCatchAsync(
      () => debounced(draft),
      (error): AutosaveError => ({ code: 'SAVE_FAILED', error, message: 'Saving the draft failed' }),
    )
}
