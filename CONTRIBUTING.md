# Contributing

Thanks for your interest in `react-spring-bottom-sheet-updated`. This
fork aims to keep a complex accessible UI primitive usable for modern
React and Next applications, and contributions that improve correctness,
accessibility, or developer experience are welcome.

## Local setup

Requires Node.js 18, 20, or 22 and pnpm 10+.

```bash
pnpm install --no-frozen-lockfile
pnpm approve-builds   # one-time, to allow sharp/unrs-resolver postinstall
```

## Local checks

Before opening a PR, run the full local gate:

```bash
pnpm type-check
pnpm lint
pnpm build:dist
pnpm size
pnpm test
```

`pnpm size` enforces a gzipped-size budget per build format and will
fail the build if any artifact exceeds the declared budget. See
`scripts/check-bundle-size.mjs` for the budgets and how to adjust them.

## High-risk areas

Changes in the following areas require extra care and, where possible,
a regression test:

- Gesture handling (drag, snap, expand-on-content-drag).
- Snap points and snap-point recalculation on resize.
- Scroll locking, including iOS `position: fixed` heuristics and
  the `[data-body-scroll-lock-ignore]` escape hatch.
- Focus trapping and ARIA hiding.
- React / Next.js compatibility, SSR-safe behavior, and
  `'use client'` boundaries.
- Bundle-size-sensitive changes to the overlay state machine
  (`src/machines/overlay.ts`).
- Type definitions (`src/types.ts`) — these are part of the public API.

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/).
`semantic-release` reads commit messages to determine the next version
and to generate the changelog, so messages like `feat:`, `fix:`,
`chore:`, `refactor:`, and `BREAKING CHANGE:` are required for
release-relevant changes.

## Pull requests

- Keep changes focused. One concern per PR.
- Include a description of what changed and why.
- If your change is user-visible, update the README and add a
  changelog entry via the conventional commit message.
- If your change is bundle-size-sensitive, run `pnpm size` locally
  and explain the budget delta in the PR description.

By submitting a pull request, you agree that your contributions will be
licensed under the MIT License (see `LICENSE`).
