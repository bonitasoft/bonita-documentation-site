# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Bonita Documentation Site** — a multi-repository documentation aggregator built with [Antora](https://antora.org). It fetches AsciiDoc content from 8 separate Git repositories (bonita-doc, bonita-cloud-doc, bonita-labs-doc, bonita-continuous-delivery-doc, bonita-test-toolkit-doc, bonita-process-insights-doc, bonita-ui-builder-doc) and generates a static HTML site.

**Hosted on Netlify** at `https://documentation.ofelia.com`. Search is provided by Algolia DocSearch. PR previews 
deploy to Surge.sh.

## Build Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Production build | `npm run build` (fetches all content from remote repos — slow) |
| Clean build artifacts | `npm run clean` |
| Local dev server | `npm run serve` (Netlify CLI on `http://localhost:8080`, applies redirects) |
| Preview build (single component) | `./build-preview.bash --component bonita --branch 2024.3` |
| Preview with local sources | `./build-preview.bash --local-sources --component bonita --branch 2024.3` |
| Preview with test content | `./build-preview.bash --use-test-sources` |
| All preview options | `./build-preview.bash --help` |

- Node 20 required (see `.nvmrc`; use `nvm use`)
- `build-preview-dev.bash` is a convenience wrapper around `build-preview.bash` with local dev defaults
- Generated site output goes to `build/site/`

## Architecture

### How the Build Works

1. `antora-playbook.yml` defines all content sources (repos + branches), the UI bundle, and extensions
2. Antora fetches AsciiDoc content from the configured Git repos/branches
3. Custom extensions in `lib/antora/` process versions
4. Static HTML is output to `build/site/`

For preview builds, `build-preview.bash` calls `scripts/generate-content-for-preview-antora-playbook.js` to generate a dynamic playbook (`antora-playbook-content-for-preview.yml`) based on CLI options, then runs Antora with it.

### Key Configuration Files

- **`antora-playbook.yml`** — Production playbook: content sources, UI bundle, extensions, site config
- **`netlify.toml`** — 80+ redirect rules (version redirects, legacy URLs, component renames)
- **`build-preview.bash`** — Flexible preview builder with 20+ options for partial/local builds

### Custom Antora Extensions (`lib/antora/`)

- **`versions-sorter-extension.js`** — Sorts component versions: stable first, alpha/prerelease last
- **`versions-alias-extension.js`** — Creates `latest` and `next` URL aliases for component versions
- **`log-aggregated-component-versions-extension.js`** — Debug logging for version aggregation

### Content Caching

Remote content is cached in `.cache/` after first fetch. Use `--fetch-sources` flag with preview builds to refresh, or `npm run clean` to clear everything.

### Local Sources (Author Mode)

For fast feedback, clone content repos as siblings of this project and use `--local-sources`. This activates Antora author mode — no need to commit or push changes.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `publish-production.yml` — Deploys to Netlify on push to `master` or repository_dispatch
- `_reusable_*` prefixed workflows — Shared by documentation content repos (referenced from `master` branch, so changes impact all repos immediately)
- `.github/actions/` — Shared actions (build-setup, validate-pr-branch-name, etc.)

## Important Notes

- **No tests to run** — this is a build orchestration project, not application code
- The content is AsciiDoc, not Markdown
- When modifying `netlify.toml` redirects, test locally with `npm run serve` which replicates Netlify's redirect behavior
- When modifying reusable workflows or shared actions, be aware they are consumed by other repos from the `master` branch
