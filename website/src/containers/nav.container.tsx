import { NavBar } from '@/components/primitives/nav-bar'
import { navContent } from '@/content/home.content'

/** The fixed navigation. */
export const NavContainer = () => (
  <NavBar wordmark={navContent.wordmark} menuLabel={navContent.menuLabel} items={navContent.items} />
)
