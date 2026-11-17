#!/usr/bin/env node
/**
 * Sync developer documentation into the docs site.
 *
 * Engineering docs stay next to the code that they describe, in their own repository. This script copies
 * them into docs/developer/{frontend,backend}/ (gitignored) on every `npm run start` and `npm run build`,
 * so the site always shows what the repositories say. Nobody edits the copies.
 *
 *   frontend  checkout at FRONTEND_DIR (default: ../beauty, a clone next to this repository)
 *   backend   checkout at BACKEND_DIR  (default: ../lab-mango)
 *
 * FRONTEND_REPO / BACKEND_REPO ("owner/name") and *_REF only build the GitHub links ("Edit this page",
 * links to code). CI sets them from the organization the workflow runs in.
 *
 * For every copied page it:
 *   - maps the source path to a readable site path (see backendDestination / frontendDestination);
 *   - rewrites relative links: to another copied page -> the copy; to code or any other file -> GitHub;
 *   - copies referenced images next to the page;
 *   - adds front matter: "Edit this page" points at the source file, and a stable sidebar label.
 *
 * No dependencies: plain Node >= 20.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(siteDir, '..');
const outRoot = path.join(siteDir, 'docs', 'developer');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);

const sources = [
  {
    key: 'frontend',
    label: 'Frontend',
    position: 3,
    description: 'React/TypeScript app: setup, design system and conventions. Synced from the frontend repository.',
    root: path.resolve(process.env.FRONTEND_DIR || path.join(workspace, 'beauty')),
    repo: process.env.FRONTEND_REPO || 'angustino88/beauty',
    ref: process.env.FRONTEND_REF || 'main',
    include: (rel) => rel === 'README.md' || (rel.startsWith('docs/') && rel.endsWith('.md')),
    destination: frontendDestination,
  },
  {
    key: 'backend',
    label: 'Backend',
    position: 4,
    description:
      'Django backend: architecture, conventions, API standards, feature specs and decisions. Synced from the lab-mango repository.',
    root: path.resolve(process.env.BACKEND_DIR || process.env.LAB_MANGO_DIR || path.join(workspace, 'lab-mango')),
    repo: process.env.BACKEND_REPO || 'angustino88/lab-mango',
    ref: process.env.BACKEND_REF || 'main',
    include: (rel) =>
      rel === 'README.md' ||
      rel === 'AGENTS.md' ||
      (rel.startsWith('docs/') && rel.endsWith('.md')) ||
      (rel.startsWith('core/') && /\/docs\/[^/]+\.md$/.test(rel)) ||
      /^\.github\/instructions\/[^/]+\.instructions\.md$/.test(rel) ||
      /^packages\/[^/]+\/README\.md$/.test(rel),
    destination: backendDestination,
  },
];

// ---------------------------------------------------------------------------------------------------------
// Path mapping. Returns a path relative to the source's output folder, or null to skip the file.

function frontendDestination(rel) {
  if (rel === 'README.md') return 'getting-started.md';
  return slugPath(rel.replace(/^docs\//, ''));
}

function backendDestination(rel) {
  if (rel === 'README.md') return 'getting-started.md';
  if (rel === 'AGENTS.md') return 'engineering-rules/index.md';
  const instruction = rel.match(/^\.github\/instructions\/([^/]+)\.instructions\.md$/);
  if (instruction) return `engineering-rules/${slug(instruction[1])}.md`;
  const pkg = rel.match(/^packages\/([^/]+)\/README\.md$/);
  if (pkg) return `packages/${slug(pkg[1])}.md`;
  if (rel.startsWith('docs/')) return slugPath(rel.slice('docs/'.length));
  if (rel.startsWith('core/')) {
    // core/labs/features/bench_bookings/docs/spec.md -> features/labs/bench-bookings/spec.md
    // core/labs/models/docs/x.md                      -> features/labs/models/x.md
    const parts = rel.split('/').slice(1).filter((p) => p !== 'features' && p !== 'docs');
    return slugPath(['features', ...parts].join('/'));
  }
  return null;
}

const slug = (s) => s.replace(/_/g, '-').toLowerCase();
// URL-friendly path: README.md -> index.md (folder landing page), DESIGN_SYSTEM.md -> design-system.md.
const slugPath = (p) => indexName(p).split('/').map(slug).join('/');
const indexName = (p) => p.replace(/(^|\/)README\.md$/i, '$1index.md');

// Folder labels in the sidebar. Anything not listed is humanised from the folder name.
const CATEGORY_LABELS = {
  'backend/features': 'Feature specs',
  'backend/engineering-rules': 'Engineering rules',
  'backend/architecture': 'Architecture',
  'backend/architecture/decisions': 'Decisions (ADRs)',
  'backend/api': 'API standards',
  'backend/conventions': 'Conventions',
  'backend/proposals': 'Proposals',
  'backend/agent-platform': 'Agent platform',
  'backend/ai-team': 'AI team',
  'backend/packages': 'Packages',
};
const CATEGORY_POSITIONS = {
  'backend/architecture': 1,
  'backend/conventions': 2,
  'backend/api': 3,
  'backend/features': 4,
  'backend/engineering-rules': 5,
  'backend/agent-platform': 6,
  'backend/proposals': 7,
  'backend/ai-team': 8,
  'backend/packages': 9,
};

// ---------------------------------------------------------------------------------------------------------

function walk(root, dir = '') {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    if (['node_modules', '.git', '.venv', 'build', 'dist'].includes(entry.name)) continue;
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(root, rel));
    else out.push(rel);
  }
  return out;
}

const posix = path.posix;

function githubUrl(source, repoRel, isDir) {
  return `https://github.com/${source.repo}/${isDir ? 'tree' : 'blob'}/${source.ref}/${repoRel}`;
}

/** Remove a leading YAML front matter block (e.g. Copilot `applyTo:`), which means nothing on the site. */
function stripFrontMatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function firstHeading(text) {
  const m = text.match(/^#\s+(.+?)\s*#*\s*$/m);
  return m ? m[1].replace(/`/g, '').trim() : null;
}

function humanise(name) {
  const base = name.replace(/\.md$/, '').replace(/[-_]+/g, ' ').trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** Short sidebar label: feature specs are all titled "Feature Specification: ...", so name them by file. */
function sidebarLabel(destRel, text) {
  if (destRel === 'getting-started.md') return 'Getting started';
  const file = posix.basename(destRel);
  if (destRel.startsWith('features/')) {
    if (file === 'index.md') return 'Overview';
    if (file === 'spec.md') return 'Specification';
    return humanise(file);
  }
  const heading = firstHeading(text);
  if (heading && heading.length <= 48) return heading;
  return file === 'index.md' ? 'Overview' : humanise(file);
}

const yamlString = (s) => JSON.stringify(s);

/**
 * Rewrite relative link targets outside fenced code blocks. Handles inline links/images `](target)`,
 * `](<target>)`, optional titles, and reference definitions `[id]: target`.
 */
function rewriteLinks(text, resolveTarget) {
  const lines = text.split('\n');
  let fence = null;
  return lines
    .map((line) => {
      const fenceMatch = line.match(/^\s*(```+|~~~+)/);
      if (fenceMatch) {
        if (!fence) fence = fenceMatch[1][0];
        else if (fenceMatch[1][0] === fence) fence = null;
        return line;
      }
      if (fence) return line;
      // Leave inline code spans untouched.
      return line
        .split(/(`[^`]*`)/)
        .map((part, i) => {
          if (i % 2 === 1) return part;
          part = part.replace(/(!?\]\()(<[^>]+>|[^)\s]+)((?:\s+"[^"]*")?\))/g, (all, open, target, close) => {
            const bare = target.startsWith('<') ? target.slice(1, -1) : target;
            const next = resolveTarget(bare, open.startsWith('!'));
            if (next === null) return all;
            return `${open}${/\s/.test(next) ? `<${next}>` : next}${close}`;
          });
          return part.replace(/^(\s*\[[^\]]+\]:\s+)(\S+)/, (all, open, target) => {
            const next = resolveTarget(target, false);
            return next === null ? all : `${open}${next}`;
          });
        })
        .join('');
    })
    .join('\n');
}

function syncSource(source) {
  const outDir = path.join(outRoot, source.key);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(source.root) || !fs.statSync(source.root).isDirectory()) {
    writePlaceholder(source, outDir);
    console.warn(`[sync-docs] ${source.key}: ${source.root} not found; wrote a placeholder page.`);
    return { pages: 0, missing: true };
  }

  const files = walk(source.root).filter(source.include);
  const map = new Map(); // repo-relative source -> output-relative destination
  for (const rel of files) {
    const dest = source.destination(rel);
    if (dest) map.set(rel, dest);
  }

  const destinations = new Set(map.values());
  let externalLinks = 0;

  for (const [rel, destRel] of map) {
    const raw = stripFrontMatter(fs.readFileSync(path.join(source.root, rel), 'utf8'));
    const srcDir = posix.dirname(rel);
    const destDir = posix.dirname(destRel);

    const body = rewriteLinks(raw, (target, isImage) => {
      if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) return null; // absolute URL, mailto:, in-page anchor
      const hashAt = target.indexOf('#');
      const pathPart = decodeURI(hashAt >= 0 ? target.slice(0, hashAt) : target);
      const anchor = hashAt >= 0 ? target.slice(hashAt) : '';
      if (!pathPart) return null;

      const repoRel = pathPart.startsWith('/')
        ? posix.normalize(pathPart.slice(1))
        : posix.normalize(posix.join(srcDir, pathPart));
      if (repoRel.startsWith('..')) return null; // outside the repository: leave as written

      const abs = path.join(source.root, repoRel);
      const exists = fs.existsSync(abs);
      const isDir = exists && fs.statSync(abs).isDirectory();
      const cleanRel = repoRel.replace(/\/$/, '');

      let mapped = map.get(cleanRel);
      if (!mapped && isDir) mapped = map.get(`${cleanRel}/README.md`);
      if (mapped) {
        let relLink = posix.relative(destDir, mapped);
        if (!relLink.startsWith('.')) relLink = `./${relLink}`;
        return relLink + anchor;
      }

      if (isImage && exists && !isDir && IMAGE_EXT.has(path.extname(cleanRel).toLowerCase())) {
        const assetRel = posix.join(destDir, 'assets', posix.basename(cleanRel));
        fs.mkdirSync(path.join(outDir, posix.dirname(assetRel)), { recursive: true });
        fs.copyFileSync(abs, path.join(outDir, assetRel));
        return `./assets/${posix.basename(cleanRel)}`;
      }

      externalLinks += 1;
      return githubUrl(source, cleanRel, isDir) + anchor;
    });

    // Inside a feature folder: the specification first, then the architecture, then the rest by name.
    const featureOrder = { 'index.md': 1, 'spec.md': 2, 'architecture.md': 3 }[posix.basename(destRel)];
    const frontMatter = [
      '---',
      `sidebar_label: ${yamlString(sidebarLabel(destRel, raw))}`,
      ...(destRel.startsWith('features/') && featureOrder ? [`sidebar_position: ${featureOrder}`] : []),
      ...(destRel === 'getting-started.md' ? ['sidebar_position: 0'] : []),
      `custom_edit_url: ${yamlString(`https://github.com/${source.repo}/edit/${source.ref}/${rel}`)}`,
      `description: ${yamlString(`Synced from ${source.repo}/${rel}`)}`,
      ...(firstHeading(raw) ? [] : [`title: ${yamlString(humanise(posix.basename(rel)))}`]),
      '---',
      '',
    ].join('\n');
    const note =
      `:::note[Synced page]\nCopied from [\`${rel}\`](${githubUrl(source, rel, false)}) in \`${source.repo}\`. ` +
      'Edit it there; this site updates after the change is merged.\n:::\n\n';

    // The note goes right after the page's H1 so the H1 stays the page title.
    const h1 = body.match(/^#\s+.+$/m);
    const page = h1
      ? frontMatter +
        body.slice(0, h1.index + h1[0].length) +
        '\n\n' +
        note +
        body.slice(h1.index + h1[0].length).replace(/^\s*\n/, '')
      : frontMatter + note + body;

    const outFile = path.join(outDir, destRel);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, page);
  }

  writeCategories(source, outDir, destinations);
  console.log(
    `[sync-docs] ${source.key}: ${map.size} pages from ${source.root} (${externalLinks} links point to GitHub).`,
  );
  return { pages: map.size, missing: false };
}

function writeCategories(source, outDir, destinations) {
  const dirs = new Set(['']);
  for (const dest of destinations) {
    let d = posix.dirname(dest);
    while (d && d !== '.') {
      dirs.add(d);
      d = posix.dirname(d);
    }
  }
  for (const dir of dirs) {
    const key = dir ? `${source.key}/${dir}` : source.key;
    const hasIndex = destinations.has(dir ? `${dir}/index.md` : 'index.md');
    const category = {
      label: dir ? CATEGORY_LABELS[key] || humanise(posix.basename(dir)) : source.label,
      ...(dir ? (CATEGORY_POSITIONS[key] ? { position: CATEGORY_POSITIONS[key] } : {}) : { position: source.position }),
      collapsed: true,
      link: hasIndex
        ? null
        : {
            type: 'generated-index',
            // Folder URL (e.g. /developer/backend/features/), so pages can link to a folder.
            slug: `/developer/${key}/`,
            ...(dir ? {} : { title: `${source.label} developer docs`, description: source.description }),
          },
    };
    if (!category.link) delete category.link;
    fs.writeFileSync(path.join(outDir, dir, '_category_.json'), `${JSON.stringify(category, null, 2)}\n`);
  }
}

function writePlaceholder(source, outDir) {
  fs.writeFileSync(
    path.join(outDir, 'index.md'),
    [
      '---',
      `title: ${yamlString(`${source.label} docs not synced`)}`,
      `sidebar_label: ${yamlString(source.label)}`,
      `sidebar_position: ${source.position}`,
      '---',
      '',
      `# ${source.label} docs not synced`,
      '',
      `This build could not find the \`${source.repo}\` checkout at \`${source.root}\`, so its pages are missing.`,
      '',
      `Locally, clone it next to this repository or set \`${source.key.toUpperCase()}_DIR\`, then run \`npm run sync\`.`,
      'See [How docs are synced](../docs-workflow.md).',
      '',
    ].join('\n'),
  );
}

fs.mkdirSync(outRoot, { recursive: true });
const results = sources.map(syncSource);
if (process.env.DOCS_REQUIRE_ALL === '1' && results.some((r) => r.missing)) {
  console.error('[sync-docs] DOCS_REQUIRE_ALL=1 and a source repository is missing.');
  process.exit(1);
}
