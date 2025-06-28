# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Preferred Command:** Use `pnpm turbo` for development - this is the recommended way to start the development server.

### Core Commands
- `pnpm turbo` - **Preferred**: Start development server using Turbo (recommended)
- `pnpm dev` - Start Next.js development server for the demo site
- `pnpm build` - Build the Next.js demo site
- `pnpm start` - Start production Next.js server

### Library Development
- `pnpm build:dist` - Build the library for distribution (runs postcss, microbundle, and TypeScript declarations)
- `pnpm build:microbundle` - Build library using microbundle (CJS, ES, Modern formats)
- `pnpm build:postcss` - Process CSS with PostCSS
- `pnpm build:declarations` - Generate TypeScript declaration files

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm type-check` - Run TypeScript type checking without emitting files
- `pnpm test` - Full test pipeline (lint + type-check + build:dist + build)

### Pre-commit Hooks
The project uses Husky with lint-staged. Before committing:
1. ESLint runs on JS/TS files with auto-fix
2. Prettier formats all files
3. prettier-package-json formats package.json

## Architecture Overview

### Library Structure
This is a React component library that provides an accessible, animated bottom sheet component built on react-spring and @use-gesture/react.

**Core Components:**
- `src/index.tsx` - Main export wrapper that handles SSR and mounting/unmounting
- `src/BottomSheet.tsx` - Main bottom sheet implementation with gesture handling and animations
- `src/types.ts` - TypeScript type definitions for props, configs, and events
- `src/style.css` - Default CSS styles using CSS custom properties

**Hook System (`src/hooks/`):**
- `useSpring.tsx` - React Spring animation management
- `useSnapPoints.tsx` - Snap point calculation and validation
- `useFocusTrap.tsx` - Accessibility focus management
- `useAriaHider.tsx` - ARIA screen reader management
- `useScrollLock.tsx` - Body scroll prevention
- `useReady.tsx` - Component ready state management
- `useReducedMotion.tsx` - Respects user motion preferences

**State Management:**
- Uses XState (`src/machines/overlay.ts`) for overlay state management
- Manages complex animation and gesture states

### Demo Site Structure
- `pages/` - Next.js demo pages with various usage examples
- `docs/` - Documentation components and demo fixtures
- `public/` - Static assets including favicons and images

### Build System
- **Library**: Uses microbundle for building CJS, ES, and Modern formats
- **Demo**: Next.js for development and demo site
- **Styling**: PostCSS with custom properties fallback
- **TypeScript**: Separate configs for different build targets

### Key Technologies
- React Spring for animations
- @use-gesture/react for gesture handling  
- XState for state management
- @radix-ui/react-portal for rendering
- focus-trap for accessibility
- Next.js for demo site

### Accessibility Features
The component is built with accessibility as a core requirement:
- Focus trapping when open
- ARIA screen reader management
- Keyboard navigation support
- Reduced motion support
- Proper semantic markup

### Animation System
Uses CSS custom properties for styling allowing complete customization:
- `--rsbs-backdrop-bg` - Backdrop background
- `--rsbs-bg` - Sheet background  
- `--rsbs-handle-bg` - Handle background
- `--rsbs-overlay-rounded` - Border radius
- And more in `src/style.css`

## Development Notes

### Spring Configuration
The component supports custom spring configurations via the `springConfig` prop. Default values are based on React Spring's defaults with critical parameters for bottom sheet behavior.

### Snap Points
Snap points are dynamically calculated based on content dimensions and can be customized via the `snapPoints` prop function.

### Memory Management  
The component is designed to mount on open and unmount on close to prevent memory leaks and ensure clean state.