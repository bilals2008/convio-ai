// Per-key serialization + request-scoped abort for LLM generations.
// ponytail: in-memory; swap to a Redis mutex when the API runs multi-instance.

const locks = new Map<string, Promise<void>>()

/** Runs fn exclusively per key: concurrent callers wait for the prior one to finish. */
export async function runExclusive<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve()
  let release!: () => void
  const gate = new Promise<void>((r) => {
    release = r
  })
  locks.set(key, gate)
  await prev
  try {
    return await fn()
  } finally {
    release()
    if (locks.get(key) === gate) locks.delete(key)
  }
}

/** AbortController aborted on client close or after a hard timeout. */
export function createRequestSignal(
  subscribeClose: (cb: () => void) => void,
  timeoutMs = 180_000,
): AbortSignal {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const abort = () => controller.abort()
  subscribeClose(abort)
  controller.signal.addEventListener('abort', () => clearTimeout(timer))
  return controller.signal
}