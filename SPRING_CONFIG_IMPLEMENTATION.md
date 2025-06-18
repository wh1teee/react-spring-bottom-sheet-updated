# Spring Config Implementation

## Overview

Added support for custom React Spring configuration in the `react-spring-bottom-sheet` library. Users can now pass a `springConfig` prop to customize animation behavior including timing, physics, and easing properties.

## Changes Made

### 1. Types (`src/types.ts`)

- Added comprehensive `SpringConfig` interface with all React Spring configuration options
- Added `springConfig?: Partial<SpringConfig>` prop to the main `Props` interface
- Exported `SpringConfig` type for external use

### 2. Core Component (`src/BottomSheet.tsx`)

- Added `useMemo` import for performance optimization
- Destructured `springConfig: customSpringConfig` from props
- Created default spring configuration with library defaults
- Implemented config merging using `useMemo` for optimal performance
- Updated `asyncSet` function to use merged configuration
- Modified dependency arrays to include `springConfig` for proper reactivity

### 3. Public API (`src/index.tsx`)

- Exported `SpringConfig as BottomSheetSpringConfig` for TypeScript users

### 4. Documentation (`README.md`)

- Added comprehensive `springConfig` prop documentation
- Included multiple usage examples (bouncy, fast, smooth animations)
- Documented all available configuration properties with defaults
- Added TypeScript usage examples

### 5. Example Implementation (`pages/playground/spring-config-example.tsx`)

- Created interactive demo showcasing different spring configurations
- Implemented real-time config switching
- Visual feedback showing current configuration values
- Educational content explaining animation behavior

## Usage Examples

### Basic Usage
```jsx
import { BottomSheet } from 'react-spring-bottom-sheet'

function MyComponent() {
  return (
    <BottomSheet 
      open={true} 
      springConfig={{ tension: 200, friction: 30 }}
    >
      Content with custom spring animation
    </BottomSheet>
  )
}
```

### Advanced TypeScript Usage
```tsx
import { BottomSheet, BottomSheetSpringConfig } from 'react-spring-bottom-sheet'

const customConfig: BottomSheetSpringConfig = {
  mass: 2,
  tension: 100,
  friction: 50,
  precision: 0.001
}

function MyComponent() {
  return (
    <BottomSheet 
      open={true} 
      springConfig={customConfig}
    >
      Content with bouncy animations
    </BottomSheet>
  )
}
```

### Predefined Configurations
```jsx
const animations = {
  bouncy: { tension: 80, friction: 60, mass: 2 },
  fast: { tension: 300, friction: 30, mass: 0.8 },
  smooth: { tension: 120, friction: 50, mass: 1.5, precision: 0.001 }
}

function MyComponent({ animationType = 'bouncy' }) {
  return (
    <BottomSheet 
      open={true} 
      springConfig={animations[animationType]}
    >
      Content with {animationType} animations
    </BottomSheet>
  )
}
```

## Technical Implementation Details

### Configuration Merging
The implementation uses a deep merge strategy where:
1. Default configuration is established with library defaults
2. User-provided config is merged over defaults
3. Per-call config overrides are still supported in the `asyncSet` function

### Performance Optimization
- Uses `useMemo` for both default config creation and merging
- Proper dependency arrays ensure minimal recalculations
- No impact on existing functionality when `springConfig` is not provided

### Type Safety
- Comprehensive TypeScript support with all React Spring config options
- Optional configuration properties with proper defaults
- Exported types for external usage

## Backward Compatibility

This implementation is 100% backward compatible:
- Existing code continues to work without changes
- Default behavior is preserved when `springConfig` is not provided
- All existing APIs remain unchanged

## Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `mass` | `number` | `1` | Mass of the object |
| `tension` | `number` | `170` | Controls the speed of the spring |
| `friction` | `number` | `26` | Controls the damping |
| `clamp` | `boolean` | `true` | Whether to clamp the spring value |
| `precision` | `number` | `0.01` | Precision of the animation |
| `velocity` | `number` | `0` | Initial velocity |
| `duration` | `number` | - | Animation duration (overrides spring physics) |
| `easing` | `function` | - | Easing function for duration-based animations |
| `bounce` | `number` | - | Bounce amount |
| `damping` | `number` | - | Damping ratio |
| `restVelocity` | `number` | `0.001` | Rest velocity threshold |
| `restDisplacement` | `number` | `0.001` | Rest displacement threshold |

## Testing

- ✅ TypeScript compilation successful
- ✅ Build process completed without errors
- ✅ All existing functionality preserved
- ✅ Example implementation working
- ✅ Documentation comprehensive

## Files Modified

1. `src/types.ts` - Added SpringConfig interface and prop
2. `src/BottomSheet.tsx` - Implemented configuration merging
3. `src/index.tsx` - Exported types
4. `README.md` - Added comprehensive documentation
5. `pages/playground/spring-config-example.tsx` - Created demo

This implementation provides a powerful, flexible, and type-safe way for users to customize the animation behavior of the bottom sheet component while maintaining full backward compatibility. 