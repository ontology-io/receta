import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import {
  AsyncGuardrails,
  ComparatorBlocks,
  ExtractionCall,
  LensFocus,
  ObjectPaths,
  OptionBoxes,
} from './figures/concept-figures'
import { Checklist, DecisionTree, Pipeline } from './figures/markdown-figures'
import { ModuleMap } from './figures/module-map'
import { RailwayTrack } from './figures/railway-track'
import { Timeline } from './figures/timeline'

/** Everything a docs page can use without importing it. */
export const docsMdxComponents = (overrides?: MDXComponents): MDXComponents => ({
  ...defaultMdxComponents,
  AsyncGuardrails,
  Checklist,
  ComparatorBlocks,
  DecisionTree,
  ExtractionCall,
  LensFocus,
  ModuleMap,
  ObjectPaths,
  OptionBoxes,
  Pipeline,
  RailwayTrack,
  Timeline,
  ...overrides,
})
