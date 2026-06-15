# Security Policy

Please report security-sensitive issues privately by contacting the
maintainer through GitHub. Do not file public issues for vulnerabilities
that could be exploited before a fix is available.

## Scope

This project is a UI primitive library. The attack surface is limited,
but the following areas are in scope for security review:

- Focus trapping (focus escapes from open bottom sheets).
- ARIA hiding (screen reader leakage of background content).
- Portal behavior (XSS via portal-rendered content).
- Scroll locking (DOM / body manipulation that could be abused by
  concurrent third-party scripts).
- iOS / Android scroll lock heuristics (touch-event interception).
- Dependency vulnerabilities (XState, react-spring, use-gesture, etc.).
- Release integrity (publishing pipeline, NPM_TOKEN handling).

## Supported versions

The maintainer supports the latest minor of the v4 line. Older majors
(3.x and earlier) are not actively patched.
