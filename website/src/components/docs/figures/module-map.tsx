import Link from 'fumadocs-core/link'
import type { ReactNode } from 'react'
import { Arrow, Figure, type FigureWordsProps } from './figure'

type ModuleChipProps = {
  readonly name: string
  /** Left out for something that isn't a module of its own. */
  readonly href?: string
}

const CHIP = 'rounded-md border border-fd-border bg-fd-background px-2.5 py-1 font-mono text-sm'

const ModuleChip = ({ name, href }: ModuleChipProps) =>
  href ? (
    <Link href={href} className={`${CHIP} no-underline transition-colors hover:border-ok hover:text-ok`}>
      {name}
    </Link>
  ) : (
    <span className={CHIP}>{name}</span>
  )

const Note = ({ children }: { readonly children: ReactNode }) => (
  <span className="text-fd-muted-foreground">{children}</span>
)

type GroupProps = {
  readonly title: string
  readonly note?: string
  readonly children: ReactNode
}

const Group = ({ title, note, children }: GroupProps) => (
  <div className="grid gap-x-4 gap-y-2 @lg:grid-cols-[10rem_minmax(0,1fr)] @lg:items-center">
    <dt className="leading-tight">
      <span className="block font-medium">{title}</span>
      {note ? <Note>{note}</Note> : null}
    </dt>
    <dd className="flex flex-wrap items-center gap-2">{children}</dd>
  </div>
)

/** How the modules group, and which ones build on which. */
export const ModuleMap = ({ children }: FigureWordsProps) => (
  <Figure alt={children}>
    <dl className="flex flex-col gap-4">
      <Group title="Core types" note="Always available">
        <ModuleChip name="Result" href="/docs/result" />
        <ModuleChip name="Option" href="/docs/option" />
        <Arrow />
        <ModuleChip name="Validation" href="/docs/validation" />
        <Note>Like Result, with error accumulation</Note>
      </Group>
      <Group title="Functional utilities">
        <ModuleChip name="Predicate" href="/docs/predicate" />
        <Arrow />
        <ModuleChip name="where" />
        <Arrow />
        <ModuleChip name="filter" />
      </Group>
      <Group title="Data operations">
        <ModuleChip name="Collection" href="/docs/collection" />
        <ModuleChip name="String" href="/docs/reference/string" />
        {/* stays on one line, so the arrow never loses what it points at */}
        <span className="flex items-center gap-2">
          <ModuleChip name="Object" href="/docs/object" />
          <Arrow />
          <ModuleChip name="Lens" href="/docs/lens" />
        </span>
        <Note>Immutable updates</Note>
      </Group>
      <Group title="Performance">
        <ModuleChip name="Memo" href="/docs/memo" />
        <ModuleChip name="Async" href="/docs/async" />
      </Group>
    </dl>
  </Figure>
)
