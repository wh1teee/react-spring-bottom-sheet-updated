import { useEffect } from 'react'

export const useIntersectionObserver = (callback: (item: IntersectionObserverEntry) => void, deps = [], options = {}) => {
    useEffect(() => {
        if (deps?.length > 0) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((item) => {
                        if (item?.target && item?.rootBounds) {
                            callback(item)
                        }
                    })
                },
                options,
            )

            deps.forEach((dep) => {
                if (dep?.current) {
                    observer.observe(dep.current)
                }
            })

            return () => {
                deps.forEach((dep) => {
                    if (dep?.current) {
                        observer.unobserve(dep.current)
                    }
                })
            }
        }

        return () => { }
    }, [callback, ...deps, options])
}

export default useIntersectionObserver
