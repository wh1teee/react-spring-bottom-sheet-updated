# Maintainers

`react-spring-bottom-sheet-updated` is maintained by [@wh1teee](https://github.com/wh1teee).

This fork focuses on preserving the original accessible bottom-sheet API
while modernizing the implementation for current React, Next.js, TypeScript,
accessibility, gesture handling, and release workflows.

## Scope of maintenance

- React 19 / Next.js 15 compatibility.
- Modern dependency upgrades (XState v5, @react-spring/web, @use-gesture/react).
- Gesture and scroll-lock correctness on iOS / Android / desktop browsers.
- Accessibility: focus trapping, ARIA hiding, keyboard navigation.
- Bundle size budget enforcement in CI.
- Release workflow via semantic-release.
- Documentation, demos, and migration guides from the original
  `react-spring-bottom-sheet` package.

## Release authority

Releases are cut automatically from `main` via semantic-release. The
maintainer holds the NPM_TOKEN and GITHUB_TOKEN secrets required for
publishing. Manual releases are not used.
