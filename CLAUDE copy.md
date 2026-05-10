# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Install dependencies
```sh
pnpm install
```

### Start services (Makefile targets)
```sh
make editor_up   # canva-editor library dev server → http://localhost:5173
make mock_up     # mock-api Express server → http://localhost:4000
make web_up      # canva-web Next.js app → http://localhost:3001 (app not yet created)
make mock_up     # mock-api
```

### Build
```sh
make build_editor          # builds libs/canva-editor → dist/
npx nx build mock-api      # builds apps/mock-api via esbuild → dist/apps/mock-api/
```

### i18n generation
```sh
npx nx run i18n:gen.all    # generate all locales (en, vi, es, he)
npx nx run i18n:gen.en     # generate English locale only
```

### Lint
```sh
pnpm -C libs/canva-editor lint
```

### Tests
```sh
npx vitest                 # run all tests (workspace-level)
npx nx e2e canva-web-e2e   # Playwright e2e tests
```

### Local npm registry (Verdaccio)
```sh
npx nx local-registry      # starts at http://localhost:4873
```

## Architecture

This is a **pnpm + Nx monorepo** with two workspace members:

```
apps/
  mock-api/        Express 5 API server (port 4000) — serves JSON assets for the editor
  i18n/            CLI tool — generates locale files for canva-web
  canva-web-e2e/   Playwright e2e tests (canva-web app not yet created)
libs/
  canva-editor/    Publishable React component library (the core product)
```

### `libs/canva-editor` — the editor library

Built with Vite (outputs ESM + UMD). The demo app at `libs/canva-editor/demo/` runs on port 5173 during development — it is **not** the library itself.

**Public API** (`src/index.ts`):
- `CanvaEditor` — main editor React component
- `EditorConfig` — configuration type
- `useTranslate`, `useTranslationMessages` — i18n hooks

**`EditorConfig` key fields:**
- `apis` — base URL + path for each asset type (fonts, templates, images, shapes, frames, uploads). `userToken` is stored in `sessionStorage` by `CanvaEditor`.
- `unsplash.accessKey` — Unsplash integration
- `editorAssetsUrl` — base URL for editor static assets (served by mock-api)
- `translations` — nested object for UI strings, accessed via dot-notation keys (e.g. `t('header.export', 'Export')`)

**Internal module aliases** (defined in `vite.config.ts`, all prefixed `canva-editor/`):
```
canva-editor/components → src/components
canva-editor/utils      → src/utils
canva-editor/types      → src/types
canva-editor/layers     → src/layers
canva-editor/hooks      → src/hooks
canva-editor/layout     → src/layout
canva-editor/icons      → src/icons
canva-editor/color-picker, drag-and-drop, search-autocomplete, tooltip
```

**Styling**: CSS-in-JS via `@emotion/react` (JSX pragma `@emotion/react`) + `styled-components`. The Vite config sets `jsxImportSource: '@emotion/react'`.

**State management**: Custom store via `useEditorStore` hook. Editor state (`EditorState`) holds pages, layers, selection, scale, sidebar tab, font list, etc. State mutations go through `actions`, reads through `query`.

**Text editing**: ProseMirror powers rich text layers inside the canvas.

**Translation system**: `TranslationContext` wraps the entire editor. `createTranslateFunction(messages)` supports nested keys with dot notation. Components call `const t = useTranslate()` then `t('sidebar.template', 'Template')` — the second arg is the English fallback used when the key is absent.

### `apps/mock-api`

Express 5 server that provides all asset data the editor needs. Built as a single bundled CJS file via `@nx/esbuild`. Key route groups:
- `/api/search-{fonts,templates,texts,images,shapes,frames}` — paginated search (`ps`, `pi`, `kw` params)
- `/api/{template,text,image,shape,frame}-suggestion` — keyword suggestions
- `/api/your-uploads/*` — user image upload/fetch/remove
- `/api/import-*-data` — Strapi data ingestion endpoints
- Static assets served from `public/` at `editorAssetsUrl`

### `apps/i18n`

CLI that generates locale JSON files consumed by canva-web. Run with `NODE_ENV=<locale>` to target a specific language.

## Key conventions

- **React 19** is used at workspace root (overridden via pnpm overrides). The canva-editor library declares peer deps on React ≥18.2 but runs fine with 19.
- **Emotion JSX pragma** is set globally via `tsconfig.base.json` (`jsxImportSource: @emotion/react`), so no per-file `/** @jsxImportSource */` comment is needed in apps that extend `tsconfig.base.json`.
- The demo `Editor.tsx` at `libs/canva-editor/demo/Editor.tsx` is the integration reference. It shows how to wire `EditorConfig` (API URLs, translations, Unsplash key) and handle `onChanges` / `onDesignNameChanges` callbacks.
- Translations in `EditorConfig.translations` must mirror the dot-notation keys used by components. The nested object structure `{ header: { file: 'File' } }` maps to key `'header.file'`.













