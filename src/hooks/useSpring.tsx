import { useSpring as useReactSpring, useSpringRef } from '@react-spring/web'

// Behold, the engine of it all!
// Put in this file befause it makes it easier to type and I'm lazy! :D

export function useSpring() {
  const springRef = useSpringRef()
  const spring = useReactSpring({
    ref: springRef,
    from: {
      y: 0,
      ready: 0,
      maxHeight: 0,
      minSnap: 0,
      maxSnap: 0,
    }
  })
  
  return [spring, springRef] as const
}

export type Spring = ReturnType<typeof useSpring>[0]
export type SpringSet = ReturnType<typeof useSpring>[1]
