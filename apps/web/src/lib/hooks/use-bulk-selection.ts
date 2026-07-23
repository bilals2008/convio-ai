import { useState, useCallback, useMemo } from 'react'

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((a) => a.id)))
    }
  }, [selectedIds.size, items])

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true)
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])
  const isAllSelected = items.length > 0 && selectedIds.size === items.length

  return {
    selectionMode,
    selectedIds,
    selectedCount,
    isAllSelected,
    setSelectionMode,
    toggleSelect,
    toggleSelectAll,
    exitSelectionMode,
    enterSelectionMode,
    isSelected,
  }
}
