// The catalog as the Worker carries it: what catalog.json says about each asset, plus its file.
import type { CatalogAsset } from '../../../plugins/receta-skills/skills/assets/scripts/core.ts'
import data from './generated/bundle.json'

export type CategoryInfo = { readonly name: string; readonly about: string; readonly count: number }

export type BundledAsset = CatalogAsset & { readonly source: string }

export type Bundle = {
  readonly package: string
  readonly count: number
  readonly builtAt: string
  readonly categories: readonly CategoryInfo[]
  /** AUTHORING.md, the rules a new asset follows. */
  readonly authoring: string
  readonly assets: readonly BundledAsset[]
}

export const bundle = data as unknown as Bundle

/** `category/name`, the key every tool and every vector uses. */
export const keyOf = (asset: Pick<CatalogAsset, 'category' | 'name'>): string => `${asset.category}/${asset.name}`
