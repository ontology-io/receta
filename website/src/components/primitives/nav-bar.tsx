import { Menu } from 'lucide-react'
import { Wordmark } from './wordmark'

type NavItem = { readonly label: string; readonly href: string }

type NavBarProps = {
  readonly wordmark: string
  readonly menuLabel: string
  readonly items: readonly NavItem[]
}

/** The fixed navigation. The scroll stage sets data-tone to match the scene under it. */
export const NavBar = ({ wordmark, menuLabel, items }: NavBarProps) => (
  <header
    data-nav
    data-tone="clear"
    className="group/nav absolute inset-x-0 top-0 z-20 scrub:fixed text-on-ink transition-colors duration-200 data-[tone=clear]:bg-transparent data-[tone=ink]:bg-ink data-[tone=ok]:bg-ok data-[tone=paper]:bg-paper data-[tone=paper]:text-on-paper data-[tone=paper-2]:bg-paper-2 data-[tone=paper-2]:text-on-paper"
  >
    <nav className="mx-auto flex h-64 flex-row items-center justify-between px-24 lg:h-84 lg:w-1440 lg:px-64">
      {/* wordmark */}
      <a href="#top">
        <Wordmark text={wordmark} stopClassName="bg-err group-data-[tone=ok]/nav:bg-paper" />
      </a>

      {/* links on the stage layout */}
      <ul className="hidden flex-row items-center gap-40 font-machine text-[0.875rem] lg:flex">
        {items.map((item) => (
          <li key={item.label}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>

      {/* menu on small screens */}
      <details className="relative lg:hidden">
        <summary className="flex list-none flex-row" aria-label={menuLabel}>
          <Menu className="size-24" />
        </summary>
        <ul className="absolute top-40 right-0 flex w-180 flex-col gap-14 bg-ink-2 p-20 font-machine text-[0.875rem] text-on-ink">
          {items.map((item) => (
            <li key={item.label}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  </header>
)
