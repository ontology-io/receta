import { MenuScene } from '@/components/scenes/menu-scene'
import { menuContent } from '@/content/home.content'

/** The printed menu of recipes. */
export const MenuContainer = () => <MenuScene copy={menuContent} />
