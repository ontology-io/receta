import * as R from 'remeda'
import { Rail, Station } from '@/components/primitives/rail'
import { Scene } from '@/components/primitives/scene'
import { Eyebrow, Headline } from '@/components/primitives/text'
import type { menuContent } from '@/content/home.content'
import { cx } from '@/lib/cx'
import { RAIL, SCENE_HEIGHT } from '@/lib/motion/rails'

const COURSE_STATIONS = [356, 816, 958] as const
const COLUMN_SPLIT = 7

const ORDER_STYLE = 'font-machine text-[0.9375rem] font-medium whitespace-nowrap lg:text-code-5'
const ORDER_LINK_STYLE = 'underline decoration-on-paper-3 decoration-1 underline-offset-4 hover:text-err-text'

type DishProps = {
  readonly need: string
  readonly recipe: string
  readonly href?: string | undefined
  readonly sample?: string
}

type OrderProps = Pick<DishProps, 'recipe' | 'href'>

/** What to order, linked to its docs when it has a page. */
const Order = ({ recipe, href }: OrderProps) =>
  href ? (
    <a href={href} className={cx(ORDER_STYLE, ORDER_LINK_STYLE)}>
      {recipe}
    </a>
  ) : (
    <span className={ORDER_STYLE}>{recipe}</span>
  )

/** One row of the card: what you need, dotted leader, what to order. */
const Dish = ({ need, recipe, href, sample }: DishProps) => (
  <li className="flex flex-row items-baseline gap-10">
    <span className="font-human text-[1.4375rem] lg:text-[1.4375rem]">{need}</span>
    <span aria-hidden className="min-w-16 flex-1 border-b-2 border-dotted border-on-paper-3 lg:reveal-draw" />
    <Order recipe={recipe} href={href} />
    {sample && (
      <span className="hidden w-114 text-right font-machine text-[0.875rem] text-on-paper-3 lg:block">{sample}</span>
    )}
  </li>
)

type CourseHeadProps = {
  readonly number: string
  readonly title: string
  readonly packageName: string
  readonly titleClassName: string
}

/** A course on the card, with the package it comes from. */
const CourseHead = ({ number, title, packageName, titleClassName }: CourseHeadProps) => (
  <div className="flex flex-row items-baseline justify-between gap-16">
    <h3 className={cx('flex flex-row items-baseline gap-16 font-human leading-[1.1]', titleClassName)}>
      <span className="text-err-text italic">{number}</span>
      {title}
    </h3>
    <p className="hidden font-machine text-code-5 font-medium text-on-paper-3 lg:block">{packageName}</p>
  </div>
)

type MenuSceneProps = { readonly copy: typeof menuContent }

/** The decision order as a printed card: recipe first, primitive second, language last. */
export const MenuScene = ({ copy }: MenuSceneProps) => {
  const { recipes, primitives, language } = copy
  const [leftColumn, rightColumn] = R.splitAt(recipes.dishes, COLUMN_SPLIT)
  return (
    <Scene id="recipes" block="menu" tone="paper" height={SCENE_HEIGHT.menu}>
      {/* the rail, with a station per course */}
      <Rail path={RAIL.menu} height={SCENE_HEIGHT.menu} base="paper" paint="ok" token={{ x: 104, y: 600, size: 30 }}>
        {COURSE_STATIONS.map((y) => (
          <Station key={y} x={104} y={y} className="fill-paper stroke-on-paper" />
        ))}
      </Rail>

      {/* heading */}
      <div className="flex flex-col gap-8 lg:absolute lg:top-124 lg:left-160">
        <Eyebrow className="text-on-paper-3">{copy.eyebrow}</Eyebrow>
        <Headline lines={[copy.headline]} className="text-display-3" />
      </div>
      <p className="font-human text-body text-on-paper-2 lg:absolute lg:top-154 lg:left-760 lg:w-560">{copy.body}</p>

      {/* course one: the recipes */}
      <div className="flex flex-col gap-22 lg:absolute lg:top-330 lg:left-160 lg:w-1216 lg:gap-30">
        <CourseHead number={recipes.number} title={recipes.title} packageName={recipes.package} titleClassName="text-title" />
        <div className="flex flex-col gap-14 lg:flex-row lg:gap-80 lg:pl-44">
          <ul className="flex flex-col gap-14 lg:flex-1 lg:gap-20">
            {leftColumn.map((dish) => (
              <Dish key={dish.need} need={dish.need} recipe={dish.recipe} href={dish.href} sample={dish.sample} />
            ))}
          </ul>
          <ul className="flex flex-col gap-14 lg:flex-1 lg:gap-20">
            {rightColumn.map((dish) => (
              <Dish key={dish.need} need={dish.need} recipe={dish.recipe} href={dish.href} sample={dish.sample} />
            ))}
          </ul>
        </div>
      </div>

      {/* course two: the primitives */}
      <div className="flex flex-col gap-14 lg:absolute lg:top-790 lg:left-160 lg:w-1216">
        <CourseHead number={primitives.number} title={primitives.title} packageName={primitives.package} titleClassName="text-[1.625rem] lg:text-[2.25rem]" />
        <ul className="lg:pl-44">
          <Dish need={primitives.need} recipe={primitives.recipe} />
        </ul>
      </div>

      {/* course three: the language */}
      <div className="flex flex-col gap-14 lg:absolute lg:top-932 lg:left-160 lg:w-1216">
        <CourseHead number={language.number} title={language.title} packageName={language.package} titleClassName="text-[1.5rem] lg:text-[1.875rem]" />
        <ul className="lg:pl-44">
          <Dish need={language.need} recipe={language.recipe} />
        </ul>
      </div>

      {/* where it's written down */}
      <p className="font-human text-[1.5625rem] leading-[1.3] italic lg:absolute lg:top-1078 lg:left-204">{copy.caption}</p>
    </Scene>
  )
}
