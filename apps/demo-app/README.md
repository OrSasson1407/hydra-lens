# HydraLens Demo App

A Next.js 14 application with **intentional hydration mismatches** — used as a sandbox to develop and test the HydraLens Chrome extension.

## Purpose

This app exists purely to give HydraLens something real to detect. It ships two deliberate server/client divergences out of the box:

| # | Component | Server renders | Client renders |
|---|-----------|---------------|----------------|
| 1 | `TimeDisplay` | `"Server Rendered"` | `Date.now()` (via `useEffect`) |
| 2 | `RandomDisplay` | `0.500000` | `Math.random().toFixed(6)` (via `useEffect`) |

Both use the correct pattern: server and client agree during hydration, then `useEffect` updates the value client-side — giving HydraLens a genuine post-hydration diff to catch.

## Running locally

From the **monorepo root**:

```bash
pnpm --filter demo-app dev
```

Or from this directory:

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Using with HydraLens

1. Build and load the extension from `packages/extension` (see root README)
2. Navigate to [http://localhost:3000](http://localhost:3000) in Chrome
3. Click the HydraLens toolbar icon
4. Click **Scan Page**

You should see two mismatches detected and overlaid on the page — one `INFO` (the random float) and one `INFO` (the timestamp), since both match numeric/dynamic patterns in the severity classifier.

## Stack

- [Next.js 14](https://nextjs.org/) — App Router, server components
- [React 18](https://react.dev/) — `useEffect` for client-side updates
- [Tailwind CSS v3](https://tailwindcss.com/) — utility styling
- [TypeScript](https://www.typescriptlang.org/)