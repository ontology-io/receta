import type { ReactNode } from 'react'

// These figures dress plain markdown rather than draw anything, so what's between their tags
// is the figure itself, and reads the same in the .md export. The look is in app/docs/figures.css.

type MarkdownFigureProps = { readonly children: ReactNode }

type DecisionTreeProps = MarkdownFigureProps & {
  /** `cards` gives each first-level question a card, for a tree too wide to follow by eye. */
  readonly layout?: 'tree' | 'cards'
}

/** A nested list of questions, with the root question as a paragraph above it. */
export const DecisionTree = ({ layout = 'tree', children }: DecisionTreeProps) => (
  <div className="not-prose figure-tree" data-layout={layout}>
    {children}
  </div>
)

/** A task list read as a report: a checked line passed, an unchecked line failed. */
export const Checklist = ({ children }: MarkdownFigureProps) => (
  <div className="not-prose figure-checklist">{children}</div>
)

/** A list alternating values and the operations between them, starting and ending on a value. */
export const Pipeline = ({ children }: MarkdownFigureProps) => (
  <div className="not-prose figure-pipeline">{children}</div>
)
