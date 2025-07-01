import { forwardRef, useEffect } from 'react'
import { BottomSheet as OriginalBottomSheet, BottomSheetProps, BottomSheetRef } from '../../src'
import { useProblematicScrollLock } from './useProblematicScrollLock'

// BottomSheet wrapper that uses problematic scroll lock behavior
export const ProblematicBottomSheet = forwardRef<
  BottomSheetRef, 
  BottomSheetProps & { useProblematic?: boolean }
>(({ useProblematic = false, ...props }, ref) => {
  const problematicScrollLockRef = useProblematicScrollLock({
    enabled: useProblematic,
  })

  // Use effect to handle open/close state changes
  useEffect(() => {
    if (useProblematic) {
      if (props.open) {
        // When opening: save current styles (which might be 'hidden' from MUI)
        problematicScrollLockRef.current?.activate()
      } else {
        // When closing: restore saved styles (problematic restoration)
        problematicScrollLockRef.current?.deactivate()
      }
    }
  }, [props.open, useProblematic, problematicScrollLockRef])

  // If problematic mode is enabled, disable the built-in scroll locking
  if (useProblematic) {
    return (
      <OriginalBottomSheet
        {...props}
        scrollLocking={false} // Disable built-in scroll lock
        ref={ref}
      />
    )
  }

  // Use normal behavior with built-in scroll lock handling
  return <OriginalBottomSheet {...props} ref={ref} />
})