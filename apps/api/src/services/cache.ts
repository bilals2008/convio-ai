// ponytail: tiny TTL cache with size bound. Swap for Redis when the API
// runs multi-instance or cross-instance invalidation is required.
export function createTtlCache<T>(ttlMs: number, maxEntries = 200) {
  const store = new Map<string, { expires: number; value: T }>()
  return {
    get(key: string): T | undefined {
      const hit = store.get(key)
      if (hit && hit.expires > Date.now()) return hit.value
      if (hit) store.delete(key)
      return undefined
    },
    set(key: string, value: T) {
      if (store.size >= maxEntries) {
        const oldest = store.keys().next().value
        if (oldest !== undefined) store.delete(oldest)
      }
      store.set(key, { expires: Date.now() + ttlMs, value })
    },
  }
}

/** Memoize an async fn by key; in-flight callers share the same promise. */
export function cached<T>(
  cache: ReturnType<typeof createTtlCache<Promise<T>>>,
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = cache.get(key)
  if (hit) return hit
  const promise = fn()
  cache.set(key, promise)
  return promise
}