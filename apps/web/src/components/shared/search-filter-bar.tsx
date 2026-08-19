import { Search, X, SlidersHorizontal, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface SearchFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterOption[]
  activeFilter?: string
  onFilterChange?: (value: string) => void
  filterLabel?: string
  trailing?: ReactNode
  className?: string
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  activeFilter,
  onFilterChange,
  filterLabel = 'Filter',
  trailing,
  className,
}: SearchFilterBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2',
        className
      )}
    >
      <div className="relative flex-1 min-w-0 sm:max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
            onClick={() => onSearchChange('')}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {filters.length > 0 && onFilterChange && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="size-3.5" />
                  {filterLabel}
                  {activeFilter && activeFilter !== 'all' && (
                    <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      1
                    </span>
                  )}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{filterLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.value}
                    onClick={() => onFilterChange(filter.value)}
                  >
                    <Check
                      className={cn(
                        'size-3.5',
                        activeFilter === filter.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {filter.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {trailing}
      </div>
    </div>
  )
}
