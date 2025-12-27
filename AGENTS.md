# Repository Guidelines

## Project Structure & Module Organization
Primary app lives in `hosting-admin/`, a Vue 3 + Vite workspace. Domain screens reside in `src/views`, shared layout shells in `src/components/layout`, routing metadata in `src/router`, and Pinia stores in `src/stores`. Global styling and Tailwind layers stay in `src/assets/main.css`; static files go in `public/`, build artifacts in `dist/`. Keep the `chat/` screenshots folder out of releases.

## Build, Test, and Development Commands
Run `npm install` inside `hosting-admin/` before the first build. `npm run dev` starts the Vite dev server with hot module replacement. `npm run build` creates a production bundle in `dist/`, and `npm run preview` serves that bundle locally (default http://localhost:4173) for smoke checks before deployment.

## Coding Style & Naming Conventions
Stick to 2-space indentation, single quotes, and no trailing semicolons in JavaScript. Prefer `<script setup>` SFCs with `PascalCase` filenames and lowercase directories mirroring route segments. Follow the `useXStore` Pinia pattern and import locals via `@/`. Use Tailwind utilities first, adding Element Plus overrides only through `@layer components` in `src/assets/main.css`; extend colors in `tailwind.config.js` instead of inlining values.

## Testing Guidelines
Automated testing is not yet configured. When contributing, add a Vitest + Vue Test Utils setup or include it in your change so coverage can grow. Place specs in `src/__tests__/` or feature-level `__tests__/` folders using `*.spec.js`, focusing on store behavior, composables, and key view flows (filters, pagination, navigation). Document manual verification steps in each PR until suites are stable.

## Commit & Pull Request Guidelines
History currently uses placeholder commits (`1`, `init`); switch to Conventional Commits (`feat: add teacher filters`, `fix(router): redirect login`). Keep commits focused and reference issue IDs when possible. PRs must explain intent, list functional or visual changes, provide screenshots for UI updates, and mention config or schema tweaks. Run `npm run build` before requesting review and report the tests or manual checks executed.

## UI & Data Notes
Mock data such as `createMockUsers` in `src/views/users/UserManagement.vue` powers the UI; migrate to service modules when real APIs arrive. Element Plus icons are globally registered in `src/plugins/element-plus.js`, so prefer `<component :is>` uses. Reuse the `pastel-card` utilities and Tailwind gradients from `src/assets/main.css` to stay on-brand.
