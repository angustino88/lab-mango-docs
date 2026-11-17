import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// The site runs on its own server (see README.md). Set these at build time per environment.
const siteUrl = process.env.DOCS_SITE_URL || 'http://localhost:3001';
const baseUrl = process.env.DOCS_BASE_URL || '/';
// "Open Lab Mango" in the navbar. Hidden when not set.
const appUrl = process.env.DOCS_APP_URL;

// This repository, for "Edit this page" on hand-written pages. CI sets it to github.repository.
const docsRepo = process.env.DOCS_REPO || 'angustino88/lab-mango-docs';
// CI sets DOCS_REQUIRE_ALL=1: every source must be synced and every link must resolve.
// Locally, a missing lab-mango checkout only warns, so frontend-only work still builds.
const strict = process.env.DOCS_REQUIRE_ALL === '1';

const config: Config = {
  title: 'Lab Mango Docs',
  tagline: 'Guides for lab users, coordinators and admins, and the engineering handbook',
  favicon: 'img/logo.svg',

  url: siteUrl,
  baseUrl,
  trailingSlash: true,

  // Synced pages have their links rewritten by scripts/sync-docs.mjs, so a broken link
  // anywhere is a real bug.
  onBrokenLinks: strict ? 'throw' : 'warn',
  onBrokenAnchors: 'warn',

  // Internal tool: keep it out of search engines even if a host is ever public.
  noIndex: true,

  i18n: { defaultLocale: 'en', locales: ['en'] },

  markdown: {
    // .md is parsed as CommonMark (not MDX), so synced engineering docs that contain
    // `{`, `<` or HTML-like text build as written. Use .mdx for pages that need components.
    format: 'detect',
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: strict ? 'throw' : 'warn',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          // Docs live at the site root: /docs/guides/..., /docs/developer/...
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Synced pages set custom_edit_url to their source repository; hand-written pages edit here.
          editUrl: `https://github.com/${docsRepo}/edit/main/`,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: { respectPrefersColorScheme: true },
    docs: { sidebar: { hideable: true, autoCollapseCategories: true } },
    navbar: {
      title: 'Lab Mango Docs',
      logo: { alt: 'Lab Mango', src: 'img/logo.svg', srcDark: 'img/logo-dark.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'guides', position: 'left', label: 'User guides' },
        { type: 'docSidebar', sidebarId: 'developer', position: 'left', label: 'Developer' },
        ...(appUrl ? [{ href: appUrl, label: 'Open Lab Mango', position: 'right' as const }] : []),
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'User guides',
          items: [
            { label: 'Getting started', to: '/guides/getting-started' },
            { label: 'Lab user', to: '/guides/lab-user' },
            { label: 'Lab coordinator', to: '/guides/lab-coordinator' },
            { label: 'Lab admin', to: '/guides/lab-admin' },
          ],
        },
        {
          title: 'Developer',
          items: [
            { label: 'Developer handbook', to: '/developer' },
            { label: 'How docs are synced', to: '/developer/docs-workflow' },
          ],
        },
      ],
      copyright: `Lab Mango · built ${new Date().toISOString().slice(0, 10)}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'json', 'yaml', 'sql', 'ini', 'powershell'],
    },
    mermaid: { theme: { light: 'neutral', dark: 'dark' } },
  } satisfies Preset.ThemeConfig,
};

export default config;
