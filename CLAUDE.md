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
- `useScrollLock.tsx` - Body scroll prevention with conflict resolution
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

## Scroll Lock Conflict Resolution

### Problem Context
The library's scroll lock feature (`useScrollLock.tsx`) had critical conflicts with external UI libraries like Material UI that also manage body scroll styles.

### Original Problem Flow
```
Step 1: MUI Drawer opens
├── MUI sets: body.style.overflow = 'hidden'
└── Page scroll: BLOCKED ✅

Step 2: BottomSheet opens  
├── We save: originalStyles.overflow = 'hidden' (MUI's value!)
├── We set: body.style.overflow = 'hidden' (redundant)
└── Page scroll: BLOCKED ✅

Step 3: MUI Drawer closes
├── MUI removes: body.style.overflow = ''
└── Page scroll: UNBLOCKED ❌ (BottomSheet still open!)

Step 4: BottomSheet closes
├── We restore: body.style.overflow = 'hidden' (MUI's old value)
└── Page scroll: BLOCKED FOREVER ❌❌
```

### Root Causes
1. **Naive State Capture**: Saved external library's modified state as "original"
2. **No Conflict Awareness**: No tracking of external changes during our lock period  
3. **Blind Restoration**: Always restored saved state without context
4. **No Active Maintenance**: Didn't maintain lock when external libraries interfered

### Solution Architecture
Implemented **MutationObserver-based intelligent conflict resolution**:

```typescript
interface ExternalStyleTracker {
  observer: MutationObserver | null
  originalStyles: Record<string, string> | null  // True original state
  externallyModified: Set<string>                // Properties changed externally
}
```

### Fixed Flow
```
Step 1: MUI Drawer opens
├── MUI sets: body.style.overflow = 'hidden'
└── Page scroll: BLOCKED ✅

Step 2: BottomSheet opens
├── We save: originalStyles.overflow = 'hidden' (current effective state)
├── We save: inlineStyles.overflow = 'hidden' (MUI's inline style)  
├── Start: MutationObserver monitoring body style changes
├── We set: body.style.overflow = 'hidden' (maintain lock)
└── Page scroll: BLOCKED ✅

Step 3: MUI Drawer closes
├── MUI removes: body.style.overflow = ''
├── MutationObserver detects change
├── We mark: externallyModified.add('overflow') 
├── We immediately reapply: body.style.overflow = 'hidden'
└── Page scroll: BLOCKED ✅ (maintained!)

Step 4: BottomSheet closes
├── Check: overflow in externallyModified? YES
├── Action: body.style.removeProperty('overflow') (don't restore)
├── Stop: MutationObserver
└── Page scroll: UNBLOCKED ✅ (correct!)
```

### Key Implementation Details

**Active Monitoring:**
```typescript
this.externalTracker.observer = new MutationObserver((mutations) => {
  // If external library removed our overflow: hidden, reapply immediately
  if (body.style.overflow !== 'hidden') {
    this.externalTracker.externallyModified.add('overflow')
    body.style.overflow = 'hidden'  // Maintain lock!
  }
})
```

**Intelligent Restoration:**
```typescript
// Special handling for overflow - if external library removed it, don't restore
if (this.externalTracker.externallyModified.has('overflow')) {
  body.style.removeProperty('overflow')  // Let external changes take effect
} else {
  body.style.overflow = originalValue    // Normal restoration
}
```

### Testing Strategy
Created comprehensive test page (`pages/mui-scroll-lock-test.tsx`) with:
- Material UI v7.2 integration
- Sequential interaction flow (Drawer → BottomSheet → close sequence)
- Visual feedback for each step
- Z-index conflict resolution
- Both problematic and fixed behavior comparison

### Compatibility Notes
- **Backward Compatible**: No breaking changes to public API
- **Platform Specific**: iOS uses different scroll lock strategy (`position: fixed`)
- **Library Agnostic**: Works with any library that modifies body styles
- **Performance**: MutationObserver only active during scroll lock period

This solution resolves the fundamental conflict between concurrent scroll lock implementations while maintaining robust scroll prevention.