# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Always use Context7 when I need code generation, setup or configuration steps, or library/API documentation.

## Commands

Package manager: **pnpm** (lockfile is `pnpm-lock.yaml`; `pnpm-workspace.yaml` exists but defines no packages — it only whitelists native build scripts for `msw`, `sharp`, `unrs-resolver`).

- `pnpm dev` — start Next.js dev server (default http://localhost:3000)
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — ESLint (flat config in `eslint.config.mjs`)
- `pnpm format` / `pnpm format:check` — Prettier write / check

There is no test runner configured.

## Architecture

Next.js 16 App Router project using **React 19**, **Tailwind CSS v4** (CSS-first config, no `tailwind.config.*`), and **shadcn/ui** components built on **Base UI** (`@base-ui/react`) — not Radix.

- `src/app/` — App Router entrypoints. `layout.tsx` wires `next/font` (Inter as `--font-sans`, Geist Mono as `--font-geist-mono`) and wraps children in `ThemeProvider` (`next-themes`, `attribute="class"`, system default). `<html lang="es">` — UI copy is Spanish.
- `src/components/ui/` — shadcn-generated primitives. Regenerate / add via `pnpm dlx shadcn@latest add <component>` — `components.json` pins style `base-nova`, icon library `lucide`, RSC enabled, base color `neutral`.
- `src/components/providers/` — context providers (currently `ThemeProvider`).
- `src/lib/utils.ts` — `cn()` helper (`clsx` + `tailwind-merge`); use it for all conditional className composition.
- `src/config/site.ts`, `src/lib/constants.ts`, `src/types/index.ts` — currently empty placeholders for shared site config, constants, and types.
- `src/app/globals.css` — imports `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`, defines `@theme inline` design tokens (CSS variables for colors, radii, fonts) and the `dark` custom variant. Edit tokens here rather than in a JS config.

Path alias: `@/*` → `src/*` (see `tsconfig.json`). shadcn aliases in `components.json`: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.

TypeScript is `strict` with `noUncheckedIndexedAccess: true` — indexed access returns `T | undefined`, so narrow before use.

## Conventions

Prettier enforces: no semicolons, single quotes, 2-space indent, `printWidth: 100`, trailing commas `es5`. `prettier-plugin-tailwindcss` auto-sorts Tailwind class lists. Match these in any new file.

ESLint downgrades `@typescript-eslint/no-unused-vars`, `@typescript-eslint/no-explicit-any`, and `react/self-closing-comp` to warnings rather than errors.

Toasts use `sonner` (`<Toaster />` wrapper in `src/components/ui/sonner.tsx`).

## Environment

`.env.example` documents the expected env vars: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`, `API_SECRET_KEY`, `DATABASE_URL`. `.env.local` is gitignored.
