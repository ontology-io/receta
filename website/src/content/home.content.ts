// Every user-facing string on the home page. Containers read this file and pass the
// words down as props, so pure components never hold copy of their own.

const INSTALL_COMMAND = 'bun add @ontologyio/receta remeda'

/** Where the site lives. Change this one line when the domain is ready. */
export const SITE_URL = 'https://receta-website.khaled-mailhub.workers.dev'

const links = {
  docs: '/docs',
  github: 'https://github.com/ontology-io/receta',
  npm: 'https://www.npmjs.com/package/@ontologyio/receta',
  jsr: 'https://jsr.io/@ontologyio/receta',
} as const

export const metaContent = {
  title: 'Receta: code that reads like a story',
  description:
    'TypeScript recipes built on Remeda. Receta makes failure, absence and flow visible in your types, so a person can verify what an agent wrote.',
} as const

export const navContent = {
  wordmark: 'receta',
  menuLabel: 'Menu',
  items: [
    { label: 'Why', href: '#why' },
    { label: 'Recipes', href: '#recipes' },
    { label: 'Docs', href: links.docs },
    { label: 'GitHub', href: links.github },
    { label: 'Install', href: '#install' },
  ],
} as const

export const installContent = {
  command: INSTALL_COMMAND,
  copyLabel: 'Copy install command',
  copiedLabel: 'Copied',
} as const

export const heroContent = {
  eyebrow: 'TypeScript recipes, built on Remeda',
  headline: ['Code should read', 'like a story, not', 'a crime scene'],
  fullStop: '.',
  lede: 'Receta makes failure, absence and flow visible in your types, so a person can verify what an agent wrote.',
  whyLabel: 'Why it exists',
  whyHref: '#why',
  pipeLabel: 'This page, as a pipe',
  pipeLines: [
    'R.pipe(',
    '  reader,',
    '  feelTheQueue,',
    '  readACrimeScene,',
    '  makeFailureAValue,',
    '  nameTheAbsence,',
    '  collectEveryError,',
    '  readTopToBottom,',
    '  orderFromTheMenu,',
    '  zoomFiveLevels,',
    '  handItToAnAgent,',
    '  install,',
    ')',
  ],
  facts: '13 modules · MIT · TypeScript',
  scrollCue: 'Scroll to run the pipe',
  ghosts: [
    { text: 'try {', x: 772, y: 566, size: 40, rotate: 4 },
    { text: 'catch (e)', x: 868, y: 92, size: 26, rotate: -5 },
    { text: 'return null', x: 300, y: 796, size: 30, rotate: -3 },
    { text: 'if (!data2)', x: 800, y: 716, size: 24, rotate: 3 },
    { text: 'undefined', x: 1120, y: 640, size: 56, rotate: 6 },
    { text: 'throw', x: 690, y: 112, size: 26, rotate: -4 },
    { text: 'return null', x: 1250, y: 800, size: 22, rotate: -2 },
    { text: 'data2', x: 452, y: 64, size: 20, rotate: 3 },
    { text: '} catch', x: 470, y: 770, size: 20, rotate: -4 },
  ],
} as const

export const queueContent = {
  headline: 'Agents write most lines now. People still have to read them.',
  body: 'Code that is hard to read now costs more than code that is slow to write. The constraint moved from writing to verifying, and verifying still happens one person at a time.',
  write: { label: 'Write', title: 'Agents', note: 'Volume, fast.' },
  wait: { label: 'Waiting for a human', title: 'The queue', note: 'Looks finished. All of it.' },
  station: 'verify',
} as const

export const crimeContent = {
  eyebrow: 'The scene',
  headline: 'Three things this function won’t tell you.',
  notes: [
    { marker: '1', text: 'data2 names nothing. You read the body to learn what it holds.' },
    { marker: '2', text: 'null reads like an empty order. Failure and absence wear the same mask.' },
    { marker: '3', text: 'catch (e) eats the reason. The caller never learns what went wrong.' },
  ],
  caption: 'Three exits. None of them in the signature.',
  exits: { hidden: 'null', visible: 'Order[]?' },
} as const

export const storyContent = {
  eyebrow: 'The same job',
  headline: 'Now the signature tells the truth.',
  claims: [
    {
      label: 'Failure in the type',
      text: 'Both ways this can fail are declared. Nothing throws behind the reader’s back.',
    },
    {
      label: 'Reads top to bottom',
      text: 'Each line is one step. The happy path is the only path on the page.',
    },
    { label: 'Names say it', text: 'parseOrder, toOrder, keepOrderedLines. No data2.' },
  ],
  caption: 'Same job. One line shorter. Nothing left to guess.',
} as const

export const railwayContent = {
  eyebrow: 'The railway',
  headline: 'Failure is a value.',
  body: 'Each step runs only on the Ok value before it. The first Err skips the rest and carries its declared error to the edge.',
  stations: ['parseOrder(raw)', 'flatMap(checkStock)', 'map(priceOrder)', 'flatMap(saveOrder)'],
  okTerminal: 'Ok(order)',
  errTerminal: "Err({ code: 'OUT_OF_STOCK' })",
  skipped: 'priceOrder and saveOrder never run',
  edgeLabel: 'The edge',
  edgeCaption: 'Unwrap once, at the edge.',
  edgeBody: 'Errors carry a code, a message and a cause. Never a bare string.',
} as const

export const optionContent = {
  eyebrow: 'Option',
  headline: 'Absence has a shape.',
  body: 'None is not null hiding in a variable. It is a value the pipe carries, the type announces and the compiler won’t let you forget.',
  forkLabel: 'nameTheAbsence',
  rows: [
    { code: 'fromNullable(users.get(id))', none: 'None', some: 'Some(user)' },
    { code: 'map(user => user.email)', none: 'None', some: "Some('ada@…')" },
    { code: "unwrapOr('no email on file')", none: "'no email on file'", some: "'ada@example.com'" },
  ],
  typeHints: ['Option<User>', 'Option<string>', 'string'],
} as const

export const validationContent = {
  eyebrow: 'Validation',
  headline: ['Every error,', 'at once.'],
  body: 'Result stops at the first failure. That suits a pipeline and insults a form. Validation checks everything and hands back the whole list.',
  lanes: { result: 'Result', validation: 'Validation' },
  gates: [
    { rule: 'isLong', message: 'At least 8 characters' },
    { rule: 'hasUpper', message: 'One uppercase letter' },
    { rule: 'hasDigit', message: 'One number' },
  ],
  counts: { result: '1 error', validation: '3 errors, one pass' },
} as const

export const pipeContent = {
  eyebrow: 'pipe',
  headline: ['Read it', 'top to bottom.'],
  nested: ['save(', 'price(', 'check(', 'parse('],
  nestedCore: 'raw',
  closingParens: '))))',
  nestedLabel: 'Reads inside out',
  open: 'R.pipe(',
  steps: ['raw,', 'parse,', 'check,', 'price,', 'save,'],
  close: ')',
  flatLabel: 'Reads top to bottom',
  aside: 'Add, remove or reorder a step without touching its neighbours.',
} as const

export const menuContent = {
  eyebrow: 'The menu',
  headline: 'One menu.',
  body: 'People and agents order from the same card: the recipe first, the primitive second, the language last. A team that writes its menu down stops getting every pattern the model has ever seen.',
  recipes: {
    number: '1',
    title: 'The recipe library',
    package: '@ontologyio/receta',
    dishes: [
      { need: 'Error handling', recipe: 'Result', sample: 'tryCatch' },
      { need: 'Nullable values', recipe: 'Option', sample: 'fromNullable' },
      { need: 'Async, with limits', recipe: 'Async', sample: 'mapAsync' },
      { need: 'Every error at once', recipe: 'Validation', sample: 'validate' },
      { need: 'Filtering', recipe: 'Predicate', sample: 'where' },
      { need: 'Trees, diffs, pages', recipe: 'Collection', sample: 'nest' },
      { need: 'Deep objects', recipe: 'Object', sample: 'mask' },
      { need: 'Text', recipe: 'String', sample: 'slugify' },
      { need: 'Numbers', recipe: 'Number', sample: 'toCurrency' },
      { need: 'Caching', recipe: 'Memo', sample: 'memoize' },
      { need: 'Immutable updates', recipe: 'Lens', sample: 'view' },
      { need: 'Sorting', recipe: 'Compare', sample: 'ascending' },
      { need: 'Control flow', recipe: 'Function', sample: 'ifElse' },
    ],
  },
  primitives: {
    number: '2',
    title: 'The primitive library',
    package: 'remeda',
    need: 'Arrays, objects, functions',
    recipe: 'map · filter · pipe',
  },
  language: {
    number: '3',
    title: 'The language',
    package: 'typescript',
    need: 'None of the above',
    recipe: 'vanilla, last',
  },
  caption: 'Written down once, for people and for LLMs: decision trees and llm.txt ship with the repo.',
} as const

export const zoomContent = {
  eyebrow: 'Readability',
  headline: ['Five zoom', 'levels.'],
  failsLabel: 'Fails when',
  levels: [
    {
      name: 'Name',
      question: 'Can you tell what it holds or does without reading its body?',
      fails: 'proc, res, data2',
    },
    { name: 'Line', question: 'Does each line carry one idea?', fails: 'A pipe stage that filters, multiplies and branches.' },
    {
      name: 'Flow',
      question: 'Can you read the happy path top to bottom?',
      fails: 'Failures hidden in lambdas; match at every step.',
    },
    {
      name: 'Function',
      question: 'Does it do one thing, and does its name say all of it?',
      fails: 'It computes and persists, and returns boolean.',
    },
    {
      name: 'Module',
      question: 'Can you see the rules and the public surface from the top?',
      fails: 'Magic numbers buried; error shapes scattered.',
    },
  ],
  quickTest:
    'If you have to scroll, hold a variable in your head or read the next level down, that level fails.',
} as const

export const agentsContent = {
  eyebrow: 'For agents',
  headline: ['Machines check.', 'Humans explain.'],
  body: 'Style used to be taste. Now it is a prompt: agents copy whatever the codebase already does, at machine speed. Write the patterns down and lint them, and the codebase teaches the next agent for you.',
  terminal: {
    command: '$ bunx eslint src/orders.ts',
    file: 'src/orders.ts',
    warningLabel: 'warning',
    warnings: [
      {
        position: '3:55',
        message: 'Use Option<T> instead of T | null | undefined',
        rule: 'receta/prefer-option-over-null',
      },
      {
        position: '7:3',
        message: 'Use R.pipe() instead of method chaining for better composition',
        rule: 'receta/prefer-pipe-composition',
      },
      {
        position: '10:3',
        message: 'Use Result.tryCatch() instead of try-catch for explicit error handling',
        rule: 'receta/prefer-result-over-try-catch',
      },
    ],
    summary: '✖ 3 problems (0 errors, 3 warnings)',
  },
  noMenu: {
    label: 'No menu',
    caption: 'Every pattern the model has ever seen, in one codebase.',
  },
  withMenu: { label: 'Menu written down', caption: 'One style in, one style out.' },
  skillsLabel: 'Claude Code skills',
  skills: [
    { name: 'readable', does: 'the five-level check' },
    { name: 'review', does: 'pattern compliance' },
    { name: 'refactor', does: 'vanilla to recipes' },
    { name: 'migrate', does: 'a phased plan' },
    { name: 'generate-module', does: 'a new module, scaffolded' },
    { name: 'explain', does: 'a pattern, in plain words' },
  ],
  rule: 'An agent never grades its own compliance, and never edits the rule that judges it.',
} as const

export const limitsContent = {
  eyebrow: 'Declared errors',
  headline: ['Every failure is in the signature.', 'That includes ours.'],
  errors: [
    {
      code: "err({ code: 'NOT_WORTH_IT' })",
      text: 'Prototypes, throwaway scripts and simple CRUD won’t repay the learning time.',
    },
    {
      code: "err({ code: 'NO_BUY_IN' })",
      text: 'Imposed cold on a team, it breeds resentment and wrappers around wrappers.',
    },
    {
      code: "err({ code: 'UNPROVEN' })",
      text: 'Fewer production errors and faster review are a hypothesis. Measure them on your own code.',
    },
  ],
} as const

export const okContent = {
  headline: 'Now it reads like a story',
  fullStop: '.',
  result: '=> Ok(reader)',
  lede: 'Failure, absence and flow, all in the open. Start with one function.',
  links: [
    { label: 'Docs', href: links.docs },
    { label: 'GitHub', href: links.github },
    { label: 'npm', href: links.npm },
    { label: 'JSR', href: links.jsr },
  ],
  wordmark: 'receta',
  package: '@ontologyio/receta 0.4.1 · MIT',
  signOff: 'This page is a pipe. You just ran it.',
} as const

export const notFoundContent = {
  title: 'Not found · Receta',
  value: "Err({ code: 'PAGE_NOT_FOUND' })",
  headline: 'That page is an Err.',
  home: 'Back to the site',
  docs: 'Read the docs',
} as const
