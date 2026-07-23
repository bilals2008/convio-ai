import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type Column,
} from '@tanstack/react-table'
import { User, ArrowUpDown, ArrowDown, ArrowUp, Pencil, Trash2, Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MemberRoleSelect } from './member-role-select'
import { cn } from '@/lib/utils'

type MemberRole = 'owner' | 'admin' | 'member'

interface Member {
  id: string
  userId: string
  name: string
  email: string
  role: MemberRole
  joinedAt: string
  avatar?: string
}

interface MemberTableProps {
  members: Member[]
  onRoleChange: (userId: string, role: MemberRole) => void
  onRemove: (userId: string) => void
  loading?: boolean
  removingId?: string | null
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-1.5 -ml-1.5 font-medium text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-1 size-3.5" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-1 size-3.5" />
        ) : (
          <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground/50" />
        )}
      </Button>
    </div>
  )
}

const roleBadgeVariant: Record<MemberRole, 'owner' | 'admin' | 'member'> = {
  owner: 'owner',
  admin: 'admin',
  member: 'member',
}

export function MemberTable({ members, onRoleChange, onRemove, loading, removingId }: MemberTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<Member, unknown>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const member = row.original
        const initials = member.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 shrink-0 rounded-full">
              {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
              <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                {initials || <User className="size-3.5" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{member.name}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <Badge variant={roleBadgeVariant[role]} className="text-xs font-medium">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email address" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.email}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      size: 80,
      cell: ({ row }) => {
        const isRemoving = removingId === row.original.userId
        return (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    disabled={isRemoving || row.original.role === 'owner'}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                }
              />
              <TooltipContent side="top" className="text-xs">
                Edit role
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={isRemoving || row.original.role === 'owner'}
                    onClick={() => onRemove(row.original.userId)}
                  >
                    {isRemoving ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                }
              />
              <TooltipContent side="top" className="text-xs">
                {isRemoving ? 'Removing...' : 'Remove member'}
              </TooltipContent>
            </Tooltip>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: members,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-b border-border"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'text-muted-foreground font-medium h-11 px-4 text-sm',
                    header.column.getCanSort() && 'cursor-pointer select-none'
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  'border-b border-border last:border-0 hover:bg-muted/30 transition-colors',
                  row.getIsSelected() && 'bg-muted/50'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'px-4 py-3',
                      cell.column.id === 'select' && 'w-10'
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
