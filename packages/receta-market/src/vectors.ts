// Each asset is indexed three times, so an agent can ask by what a function does, by what it
// takes, or by what it returns, and get a match on whichever it knows.
import * as R from 'remeda'
import { type BundledAsset, keyOf } from './bundle'

export const FIELDS = ['does', 'takes', 'returns'] as const

export type Field = (typeof FIELDS)[number]

export type VectorMatch = { readonly id: string; readonly score: number }

/** The vector side of the search. Cloudflare's lives in cloudflare.ts, a fake in the tests. */
export type Vectors = {
  readonly embed: (texts: readonly string[]) => Promise<readonly (readonly number[])[]>
  readonly query: (vector: readonly number[], field: Field, topK: number) => Promise<readonly VectorMatch[]>
}

export const vectorId = (asset: BundledAsset, field: Field): string => `${keyOf(asset)}#${field}`

/** The asset key a vector id belongs to: `parse/parsePort#does` gives `parse/parsePort`. */
export const keyOfVector = (id: string): string => id.replace(/#[a-z]+$/, '')

export const fieldText = (asset: BundledAsset, field: Field): string => {
  if (field === 'does') {
    return `${asset.summary} Use when: ${asset.useWhen} Tags: ${R.join(asset.tags, ', ')}.`
  }
  if (field === 'takes') {
    const inputs = asset.inputs ?? []
    return inputs.length === 0
      ? 'takes nothing'
      : `takes ${R.join(R.map(inputs, (input) => `${input.name}: ${input.type}`), '; ')}`
  }
  return `returns ${asset.output ?? 'unknown'}`
}
