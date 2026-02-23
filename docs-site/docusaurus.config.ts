import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: Config = {
  title: 'Receta',
  tagline: 'Practical FP recipes built on Remeda — higher-level patterns for real-world TypeScript applications',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // 🎯 KEY FIX: Use CommonMark instead of MDX!
  // This prevents generic types <T> from being parsed as JSX
  markdown: {
    format: 'md',
  },

  // Set the production url of your site here
  url: 'https://receta.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'khaledmaher', // Usually your GitHub org/user name.
  projectName: 'receta', // Usually your repo name.

  onBrokenLinks: 'warn', // Temporarily warn instead of throwing

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src'],
        entryPointStrategy: 'expand',
        tsconfig: '../tsconfig.json',
        out: 'docs/api',

        // Output plain markdown (not MDX!)
        // With markdown.format: 'md' above, generic types work!

        // Sidebar configuration
        sidebar: {
          categoryLabel: 'API Reference',
          position: 2,
        },

        // Output options
        excludePrivate: true,
        excludeProtected: true,
        excludeExternals: true,
        exclude: ['**/__tests__/**', '**/node_modules/**', '**/dist/**'],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/khaledmaher/receta/tree/main/docs-site/',
        },
        blog: false, // Disable blog for now
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Receta',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'doc',
          docId: 'api/index',
          label: 'API Reference',
          position: 'left',
        },
        {
          href: 'https://github.com/khaledmaher/receta',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Get Started',
              to: '/docs/intro',
            },
            {
              label: 'API Reference',
              to: '/docs/api',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/khaledmaher/receta',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@ontology-io/receta',
            },
          ],
        },
      ],
      copyright: `Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
