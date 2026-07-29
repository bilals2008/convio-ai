# shadcn/ui v4 Patterns & Rules

This project uses **shadcn/ui v4** built on **Base UI React**. Below are the patterns, rules, and conventions for using shadcn components correctly.

---

## General Principles

- **ALWAYS** check the official shadcn docs (https://ui.shadcn.com/docs/components/) before choosing or using a component. Don't guess the API.
- shadcn/ui v4 uses **Base UI React** (not Radix UI). This is different from v3.
- `asChild` is **NOT supported** on triggers. Use `className` directly on trigger elements instead of `<Button asChild>`.
- Use `render` prop for passing components to triggers (e.g., `render={<Button variant="outline" />}`).
- Import components from `@/components/ui/` only.

---

## Component-Specific Patterns

### Select
- Base UI Select requires `<SelectGroup>` wrapping `<SelectLabel>` and `<SelectSeparator>`.
- `<SelectItem>` goes directly inside `<SelectContent>` or `<SelectGroup>`.

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Combobox

#### Single Select
```tsx
<Combobox items={items} value={value} onValueChange={setValue}>
  <ComboboxInput placeholder="Search..." />
  <ComboboxContent>
    <ComboboxEmpty>No items found.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

#### Multi-Select with Chips
```tsx
<Combobox items={items} multiple value={value} onValueChange={setValue}>
  <ComboboxChips>
    <ComboboxValue>
      {value.map((item) => (
        <ComboboxChip key={item}>{item}</ComboboxChip>
      ))}
    </ComboboxValue>
    <ComboboxChipsInput placeholder="Add items..." />
  </ComboboxChips>
  <ComboboxContent>
    <ComboboxEmpty>No items found.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

#### With Groups
Use `ComboboxGroup`, `ComboboxLabel`, and `ComboboxSeparator` for grouped items:

```tsx
<Combobox items={filterItems} multiple value={selected} onValueChange={setSelected}
  itemToStringValue={(item) => item.label}>
  <ComboboxChips className="min-h-9">
    <ComboboxValue>
      {selected.map((item) => (
        <ComboboxChip key={item.id}>{item.label}</ComboboxChip>
      ))}
    </ComboboxValue>
    <ComboboxChipsInput placeholder="Filter..." />
  </ComboboxChips>
  <ComboboxContent>
    <ComboboxEmpty>No matches found.</ComboboxEmpty>
    <ComboboxList>
      <ComboboxGroup>
        <ComboboxLabel>Group A</ComboboxLabel>
        {filterItems.filter(i => i.group === 'a').map((item) => (
          <ComboboxItem key={item.id} value={item}>
            {item.label}
          </ComboboxItem>
        ))}
      </ComboboxGroup>
      <ComboboxSeparator />
      <ComboboxGroup>
        <ComboboxLabel>Group B</ComboboxLabel>
        {filterItems.filter(i => i.group === 'b').map((item) => (
          <ComboboxItem key={item.id} value={item}>
            {item.label}
          </ComboboxItem>
        ))}
      </ComboboxGroup>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

> **Note:** When using objects as items, provide `itemToStringValue` to tell Combobox how to display the value. Render `ComboboxItem` manually inside groups (instead of the render prop) to control grouping.

---

### Date Picker

Built from **Popover + Calendar** (no dedicated DatePicker component):

```tsx
<Popover>
  <PopoverTrigger
    render={
      <Button
        variant="outline"
        data-empty={!date}
        className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
      />
    }
  >
    <CalendarIcon className="size-4 shrink-0" />
    {date ? formatDate(date) : <span>Pick a date</span>}
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  </PopoverContent>
</Popover>
```

- `mode="single"` for one date, `mode="range"` for date range
- Use `formatDate()` from `@/lib/utils` (Intl-based) instead of importing `date-fns`
- Use `<CalendarIcon>` from lucide-react
- NEVER use raw `<input type="date">` — always use Popover + Calendar

---

### Dialog

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description text here.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {/* Content */}
    </div>
  </DialogContent>
</Dialog>
```

- Always wrap content in `<DialogHeader>` with `<DialogTitle>` + `<DialogDescription>`
- Use `sm:max-w-*` for width control
- Center-aligned by default (fixed positioning)
- For metadata display, use a bordered card with divided rows

---

### Badge

Use existing `variant` values — don't create new CSS:

- `active` — green/success
- `destructive` — red
- `pending` / `draft` — yellow/warning
- `outline` — neutral
- `secondary` — muted
- `member` — blue/primary
- `admin` — yellow
- `owner` — green
- `viewer` — cyan/info

For entity-specific badges (audit logs), use custom variants like:
`entity_agent`, `entity_member`, `entity_organization`, `entity_knowledge`, `entity_api_key`, `entity_sso`, `entity_moderation`, `entity_data_wipe`, `entity_data_category`, `entity_membership`, `entity_invitation`

---

### Table (TanStack)

T his project uses **TanStack Table** (`@tanstack/react-table`) for all data tables, not manual `<table>` elements:

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const columnHelper = createColumnHelper<DataType>()

const columns = useMemo(() => [
  columnHelper.accessor('field', {
    header: ({ column }) => (
      <button onClick={() => column.toggleSorting()}>
        Field Name
        {column.getIsSorted() === 'desc' ? <ArrowDown /> :
         column.getIsSorted() === 'asc' ? <ArrowUp /> :
         <ArrowUpDown />}
      </button>
    ),
    cell: ({ row }) => <span>{row.original.field}</span>,
    sortingFn: 'text',
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: () => <Button variant="ghost" size="icon-sm">...</Button>,
    enableSorting: false,
  }),
], [])

const table = useReactTable({
  data,
  columns,
  state: { sorting },
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})
```

- Use `flexRender()` for rendering header/cell content
- Use `ArrowUpDown`, `ArrowUp`, `ArrowDown` for sort indicators
- See `apps/web/src/pages/agents/agents-list-page.tsx` and `apps/web/src/pages/settings/audit-logs-page.tsx` for reference

---

## Security

- NEVER use `Sparkles` from lucide-react — it doesn't exist in the package and will throw a runtime error. Use `Shield`, `Star`, `Zap`, or `Award` instead.
- NEVER expose secrets, API keys, or tokens in client code.
- ALWAYS validate on both client and server.
