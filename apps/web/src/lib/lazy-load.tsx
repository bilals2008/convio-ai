import { lazy, type ComponentType } from 'react'
import { SuspenseWrapper } from '@/components/shared/suspense-wrapper'

export function lazyLoad<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  name?: string,
) {
  const LazyComponent = lazy(importFn)
  const displayName = name || importFn.toString().match(/['"](.+?)['"]/)?.[1] || 'LazyComponent'

  const Wrapped = (props: Record<string, unknown>) => (
    <SuspenseWrapper name={displayName}>
      <LazyComponent {...props} />
    </SuspenseWrapper>
  )
  Wrapped.displayName = `lazyLoad(${displayName})`
  return Wrapped
}
