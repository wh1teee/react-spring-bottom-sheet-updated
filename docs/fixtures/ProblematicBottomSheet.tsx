import { forwardRef } from 'react'
import { BottomSheet as OriginalBottomSheet, BottomSheetProps, BottomSheetRef } from '../../src'
import { useProblematicScrollLock } from './useProblematicScrollLock'

// BottomSheet wrapper that uses problematic scroll lock behavior
export const ProblematicBottomSheet = forwardRef<
  BottomSheetRef, 
  BottomSheetProps & { useProblematic?: boolean }
>(({ useProblematic = false, ...props }, ref) => {
  const problematicScrollLockRef = useProblematicScrollLock({
    enabled: useProblematic && !!props.open,
  })

  // If problematic mode is enabled, we'll use our problematic scroll lock
  // and disable the built-in one
  if (useProblematic) {
    // Activate/deactivate problematic scroll lock based on open state
    if (props.open) {
      problematicScrollLockRef.current?.activate()
    } else {
      problematicScrollLockRef.current?.deactivate()
    }

    // Pass through props but disable the built-in scroll locking
    return (
      <OriginalBottomSheet
        {...props}
        scrollLocking={false} // Disable built-in scroll lock
        ref={ref}
      />
    )
  }

  // Use normal behavior
  return <OriginalBottomSheet {...props} ref={ref} />
})