import React, { memo } from 'react'
import { animated } from '@react-spring/web'

// Memoized animated div to prevent unnecessary re-renders during animations
export const AnimatedDiv: React.ComponentType<any> = memo(animated.div)

// Memoized backdrop component
export const Backdrop = memo<{
  style: any
  onPointerDown: (e: React.PointerEvent) => void
  'data-rsbs-backdrop': boolean
}>(({ style, onPointerDown, 'data-rsbs-backdrop': dataRsbsBackdrop }) => (
  <AnimatedDiv
    style={style}
    onPointerDown={onPointerDown}
    data-rsbs-backdrop={dataRsbsBackdrop}
  />
))

Backdrop.displayName = 'Backdrop'

// Memoized sheet container to reduce re-renders
export const SheetContainer = memo(React.forwardRef<HTMLDivElement, {
  style: any
  className?: string
  children: React.ReactNode
  'data-rsbs-root': boolean
  'data-rsbs-state': string
  [key: string]: any
}>(({ style, className, children, 'data-rsbs-root': dataRsbsRoot, 'data-rsbs-state': dataRsbsState, ...props }, ref) => (
  <AnimatedDiv
    {...props}
    ref={ref}
    style={style}
    className={className}
    data-rsbs-root={dataRsbsRoot}
    data-rsbs-state={dataRsbsState}
  >
    {children}
  </AnimatedDiv>
)))

SheetContainer.displayName = 'SheetContainer'

// Memoized header component
export const HeaderWrapper = memo<{
  children: React.ReactNode
  bind: any
  headerRef: React.RefObject<HTMLDivElement>
}>(({ children, bind, headerRef }) => (
  <div key="header" data-rsbs-header ref={headerRef} {...bind()}>
    {children}
  </div>
))

HeaderWrapper.displayName = 'HeaderWrapper'

// Memoized footer component
export const FooterWrapper = memo<{
  children: React.ReactNode
  footerRef: React.RefObject<HTMLDivElement>
}>(({ children, footerRef }) => (
  <div key="footer" data-rsbs-footer ref={footerRef}>
    {children}
  </div>
))

FooterWrapper.displayName = 'FooterWrapper'

// Memoized content wrapper
export const ContentWrapper = memo<{
  children: React.ReactNode
  contentRef: React.RefObject<HTMLDivElement>
}>(({ children, contentRef }) => (
  <div data-rsbs-content ref={contentRef}>
    {children}
  </div>
))

ContentWrapper.displayName = 'ContentWrapper'