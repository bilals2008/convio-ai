# shadcn/ui v4 Patterns & Rules

This project uses **shadcn/ui v4** built on **Base UI React** (not Radix UI v3). Below are the patterns, rules, and conventions for using shadcn components correctly.

---

## General Principles

- **ALWAYS** check the official shadcn docs (https://ui.shadcn.com/docs/components/) before choosing or using a component. Don't guess the API.
- shadcn/ui v4 uses **Base UI React** (not Radix UI). This is different from v3.
- `asChild` is **NOT supported** on triggers. Use `render` prop instead: `render={<Button variant="outline" />}`
- `render` prop replaces `asChild` for passing components to triggers
- All components import from `@base-ui/react/*` (e.g., `@base-ui/react/button`, `@base-ui/react/dialog`)
- Import components from `@/components/ui/` only
- All components use `data-slot` attributes for styling hooks

---

## Button

```tsx
import { Button } from "@/components/ui/button"
```

**Variants:** `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`

**Sizes:** `default` (h-9), `xs` (h-6), `sm` (h-8), `lg` (h-10), `icon` (size-9), `icon-xs`, `icon-sm`, `icon-lg`

```tsx
<Button variant="default" size="sm">Click me</Button>
<Button variant="ghost" size="icon"><TrashIcon /></Button>
<Button variant="destructive" size="xs">Delete</Button>
<Button variant="link">Link style</Button>
<Button disabled>Saving...</Button>
```

**Icon buttons** use `size="icon"` (or `icon-sm`/`icon-xs`/`icon-lg`):

```tsx
<Button variant="ghost" size="icon-sm" onClick={handleEdit}>
  <PencilIcon />
</Button>
```

**With inline icons in text buttons** — use `data-icon="inline-start"` / `data-icon="inline-end"` on SVG children for proper spacing:

```tsx
<Button>
  <PlusIcon data-icon="inline-start" />
  Add Item
</Button>
```

**Render prop** (replaces `asChild`):

```tsx
<Button render={<a href="/link" />}>Link as Button</Button>
```

**`nativeButton={false}`** — use when rendering a button that should not be a `<button>` element (e.g., pagination link):

```tsx
<Button variant="ghost" size="icon" nativeButton={false} render={<a href="/page/2" />} />
```

---

## Badge

Use existing `variant` values — don't create new CSS unless adding entity-specific variants:

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

## Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card"
```

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**With action** (uses CSS grid for positioning):

```tsx
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
    <CardAction>
      <Button variant="ghost" size="icon"><SettingsIcon /></Button>
    </CardAction>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

`Card` has `rounded-xl border border-border/60 bg-card`.

---

## Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
```

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

- Always wrap content in `<DialogHeader>` with `<DialogTitle>` + `<DialogDescription>` for accessibility
- Use `sm:max-w-*` for width control
- Center-aligned by default (fixed positioning)
- For metadata display, use a bordered card with divided rows

---

## Sheet

```tsx
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
```

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger render={<Button variant="outline">Open</Button>} />
  <SheetContent side="right" showCloseButton={true}>
    <SheetHeader>
      <SheetTitle>Panel Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    <div className="flex-1">Content</div>
    <SheetFooter>
      <Button>Save</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

- `side` prop: `"top"` | `"right"` (default) | `"bottom"` | `"left"`
- `showCloseButton` defaults to `true`
- Uses `Dialog` from `@base-ui/react/dialog` under the hood
- SheetContent wraps children in portal + overlay automatically

---

## Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
```

**Default (horizontal):**

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">General</TabsTrigger>
    <TabsTrigger value="tab2">Advanced</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">General content</TabsContent>
  <TabsContent value="tab2">Advanced content</TabsContent>
</Tabs>
```

**Line variant** (underline style):

```tsx
<Tabs defaultValue="tab1">
  <TabsList variant="line">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  ...
</Tabs>
```

**Vertical orientation:**

```tsx
<Tabs defaultValue="tab1" orientation="vertical">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>
```

- Uses `@base-ui/react/tabs`
- `data-active` attribute on triggers for styling
- `group/tabs` + `group-data-horizontal/tabs:*` CSS context selectors

---

## Accordion

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
```

```tsx
<Accordion defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content for section 1</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>Content for section 2</AccordionContent>
  </AccordionItem>
</Accordion>
```

- Uses `@base-ui/react/accordion`
- Supports `defaultValue` (string) for single, or `defaultValue` (array) for multiple
- Trigger toggles between `PlusIcon` / `MinusIcon` via `group-aria-expanded/accordion-trigger:*`
- Uses `data-open:animate-accordion-down` / `data-closed:animate-accordion-up` CSS animations
- Last item has no bottom border (`not-last:border-b`)

---

## DropdownMenu

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
```

**Basic:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="ghost" size="icon"><MoreIcon /></Button>} />
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>
      <PencilIcon />
      Edit
      <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem variant="destructive" onClick={handleDelete}>
      <TrashIcon />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**With groups and labels:**

```tsx
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>Group 1</DropdownMenuLabel>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuGroup>
  <DropdownMenuSeparator />
  <DropdownMenuGroup>
    <DropdownMenuLabel>Group 2</DropdownMenuLabel>
    <DropdownMenuItem>Item 3</DropdownMenuItem>
  </DropdownMenuGroup>
</DropdownMenuContent>
```

**Checkbox items:**

```tsx
<DropdownMenuCheckboxItem checked={show} onCheckedChange={setShow}>
  Show details
</DropdownMenuCheckboxItem>
```

**Submenu:**

```tsx
<DropdownMenuSub>
  <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
  <DropdownMenuSubContent>
    <DropdownMenuItem>Option A</DropdownMenuItem>
    <DropdownMenuItem>Option B</DropdownMenuItem>
  </DropdownMenuSubContent>
</DropdownMenuSub>
```

- Uses `@base-ui/react/menu`
- Menu items support `inset` prop for indentation
- `variant="destructive"` on items for red styling
- Always wrap trigger in `render` prop when using a Button (no `asChild`)

---

## Tooltip

```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
```

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="ghost" size="icon"><InfoIcon /></Button>} />
    <TooltipContent side="top">
      Helpful information
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

- `TooltipProvider` should wrap a section of the app (can set global `delay`)
- `side`: `"top"` (default) | `"bottom"` | `"left"` | `"right"`
- `align`: `"center"` (default) | `"start"` | `"end"`
- `sideOffset`: pixels from trigger (default 4)
- Uses `@base-ui/react/tooltip`
- Supports `TooltipPrimitive.Arrow` for arrow indicator (included in component)
- **Avoid wrapping triggers with `asChild`** — use `render` prop

---

## Avatar

```tsx
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
```

```tsx
<Avatar size="default">
  <AvatarImage src="/avatar.jpg" alt="User name" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
```

**Sizes:** `sm` (size-6), `default` (size-8), `lg` (size-10)

**With badge:**

```tsx
<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>UN</AvatarFallback>
  <AvatarBadge>
    <CheckIcon />
  </AvatarBadge>
</Avatar>
```

**Avatar group:**

```tsx
<AvatarGroup>
  <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>B</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>C</AvatarFallback></Avatar>
  <AvatarGroupCount>+3</AvatarGroupCount>
</AvatarGroup>
```

- Uses `@base-ui/react/avatar`
- `AvatarFallback` shows when image fails to load or is not provided
- `size` prop cascades via CSS `group-data-[size=sm]/avatar:*` selectors

---

## Input

```tsx
import { Input } from "@/components/ui/input"
```

```tsx
<Input placeholder="Enter name" className="h-9" />
<Input type="email" defaultValue="user@example.com" />
<Input disabled />
<Input aria-invalid={!!error} aria-describedby="error-id" />
```

- Uses `@base-ui/react/input`
- Standard height is `h-8`, commonly overridden with `h-9`
- Uses `focus-visible:border-ring focus-visible:ring-3` for focus ring
- `aria-invalid` + `aria-describedby` for validation errors

---

## Textarea

```tsx
import { Textarea } from "@/components/ui/textarea"
```

```tsx
<Textarea placeholder="Describe..." rows={4} maxLength={500} className="resize-y" />
<Textarea disabled />
```

- Native `<textarea>` element (not Base UI)
- `field-sizing-content` for auto-height
- `min-h-16` default minimum
- Same focus/error styling as Input

---

## Label

```tsx
import { Label } from "@/components/ui/label"
```

```tsx
<Label htmlFor="field-id">Field Name</Label>
```

- Plain `<label>` element
- Supports `htmlFor` for associating with inputs
- Has `group-data-[disabled=true]:opacity-50` for disabled state cascading

---

## Separator

```tsx
import { Separator } from "@/components/ui/separator"
```

```tsx
<Separator />
<Separator orientation="vertical" className="h-8" />
```

- Uses `@base-ui/react/separator`
- `"use client"` directive required
- `orientation`: `"horizontal"` (default) | `"vertical"`

---

## Popover

```tsx
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "@/components/ui/popover"
```

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline">Open</Button>} />
  <PopoverContent className="w-80" side="bottom" align="center">
    <PopoverHeader>
      <PopoverTitle>Title</PopoverTitle>
      <PopoverDescription>Description</PopoverDescription>
    </PopoverHeader>
    <div>Content</div>
  </PopoverContent>
</Popover>
```

- Uses `@base-ui/react/popover`
- `side`: `"top"` | `"bottom"` (default) | `"left"` | `"right"`
- `align`: `"start"` | `"center"` (default) | `"end"`
- Default width is `w-72`

---

## Date Picker

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
- Calendar uses `react-day-picker` with custom styling

---

## Select

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select"
```

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

**With groups:**

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Group A</SelectLabel>
      <SelectSeparator />
      <SelectItem value="a1">Option A1</SelectItem>
      <SelectItem value="a2">Option A2</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

- Base UI Select requires `<SelectGroup>` wrapping `<SelectLabel>` and `<SelectSeparator>`
- `<SelectItem>` goes directly inside `<SelectContent>` or `<SelectGroup>`

---

## Combobox

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

## Checkbox

```tsx
import { Checkbox } from "@/components/ui/checkbox"
```

```tsx
<Checkbox checked={value} onCheckedChange={setValue} />
<Checkbox defaultChecked />
<Checkbox disabled />
<Checkbox aria-invalid={!!error} />
```

- Uses `@base-ui/react/checkbox`
- Renders `CheckIcon` inside `CheckboxPrimitive.Indicator`
- `onCheckedChange` receives `boolean | "indeterminate"`
- Supports `aria-invalid` for validation

---

## Switch

```tsx
import { Switch } from "@/components/ui/switch"
```

```tsx
<Switch checked={value} onCheckedChange={setValue} />
<Switch defaultChecked />
<Switch disabled />
<Switch size="sm" />
```

**Sizes:** `sm` (14x24px), `default` (18.4x32px)
- Uses `@base-ui/react/switch`
- `data-checked` / `data-unchecked` attributes for styling
- Thumb animates via `group-data-checked/switch:translate-x-[calc(100%-2px)]`

---

## RadioGroup

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
```

```tsx
<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option-2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>
```

- Uses `@base-ui/react/radio` + `@base-ui/react/radio-group`
- `onValueChange` receives the string value

---

## ScrollArea

```tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
```

```tsx
<ScrollArea className="h-[400px] w-full">
  <div className="p-4">
    {/* Long content */}
  </div>
  <ScrollBar orientation="vertical" />
</ScrollArea>
```

- Uses `@base-ui/react/scroll-area`
- `ScrollBar` defaults to `orientation="vertical"`
- Always include `<ScrollBar />` inside for custom scrollbar styling

---

## Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

```tsx
<Skeleton className="h-4 w-full" />
<Skeleton className="size-10 rounded-full" />
```

- Simple div with `animate-pulse rounded-md bg-muted`
- Apply any dimensions via className

---

## Progress

```tsx
import { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue } from "@/components/ui/progress"
```

```tsx
<Progress value={percent}>
  <ProgressLabel>Loading...</ProgressLabel>
  <ProgressValue>{percent}%</ProgressValue>
</Progress>
```

- Uses `@base-ui/react/progress`
- `ProgressLabel` and `ProgressValue` are optional
- `ProgressTrack` + `ProgressIndicator` are rendered automatically inside `<Progress>`
- To customize, use the sub-components directly

---

## AlertDialog

```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogMedia } from "@/components/ui/alert-dialog"
```

```tsx
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger render={<Button variant="destructive">Delete</Button>} />
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogMedia>
        <TriangleAlertIcon className="text-destructive" />
      </AlertDialogMedia>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive" onClick={handleConfirm}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- Uses `@base-ui/react/alert-dialog`
- `size`: `"default"` | `"sm"`
- `AlertDialogCancel` uses `render` prop internally (renders as `AlertDialogPrimitive.Close` wrapped in a Button)
- `AlertDialogAction` is a direct `Button` component (not wrapped in Close)
- `AlertDialogMedia` for icon/illustration at the top of the dialog

---

## Breadcrumb

```tsx
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@/components/ui/breadcrumb"
```

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Profile</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

- Uses native HTML elements (`nav`, `ol`, `li`, `a`, `span`) — no Base UI primitives
- `BreadcrumbLink` uses `useRender` from Base UI for polymorphic rendering
- `BreadcrumbPage` is the current page (not a link, has `aria-current="page"`)
- `BreadcrumbSeparator` defaults to `ChevronRightIcon`

---

## Pagination

```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
```

```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="/page/1" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="/page/1">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="/page/2" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="/page/5" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

- Uses `Button` component internally with `render` prop for `<a>` elements
- `PaginationLink` accepts `isActive` for active page state
- `PaginationPrevious` / `PaginationNext` accept `text` prop to customize label

---

## Collapsible

```tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
```

```tsx
<Collapsible defaultOpen>
  <CollapsibleTrigger render={<Button variant="ghost">Toggle</Button>} />
  <CollapsibleContent>
    <div>Collapsible content</div>
  </CollapsibleContent>
</Collapsible>
```

- Uses `@base-ui/react/collapsible`
- Minimal wrapper — no default styling

---

## Toggle

```tsx
import { Toggle } from "@/components/ui/toggle"
```

```tsx
<Toggle defaultPressed onPressedChange={setPressed}>
  <BoldIcon />
</Toggle>
<Toggle variant="outline" size="sm">
  <ItalicIcon />
  Italic
</Toggle>
```

**Variants:** `default` (ghost), `outline`
**Sizes:** `default` (h-8), `sm` (h-7), `lg` (h-9)
- Uses `@base-ui/react/toggle`
- `pressed` / `defaultPressed` / `onPressedChange`

---

## ToggleGroup

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
```

```tsx
<ToggleGroup type="single" value={value} onValueChange={setValue}>
  <ToggleGroupItem value="bold">
    <BoldIcon />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic">
    <ItalicIcon />
  </ToggleGroupItem>
</ToggleGroup>
```

**Multiple selection:**

```tsx
<ToggleGroup type="multiple" value={values} onValueChange={setValues}>
  ...
</ToggleGroup>
```

- `type`: `"single"` | `"multiple"`
- Supports `orientation` (`"horizontal"` | `"vertical"`)
- Supports `spacing` prop (gap between items in px, default 2)
- `variant` and `size` cascade from `ToggleGroup` to all `ToggleGroupItem`s

---

## Sonner (Toast)

```tsx
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
```

Add `<Toaster />` once in the root layout. Then use:

```tsx
toast.success("Profile updated")
toast.error("Something went wrong")
toast.warning("Check your input")
toast.info("New version available")
toast.message("Plain toast")
toast.promise(savePromise, {
  loading: "Saving...",
  success: "Saved!",
  error: "Failed to save",
})
```

- Uses `sonner` library (not Base UI)
- Toaster handles theming via `next-themes`
- Icons are configured in Toaster using lucide-react icons per toast type

---

## HoverCard

```tsx
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
```

```tsx
<HoverCard>
  <HoverCardTrigger href="https://..." render={<span>@username</span>} />
  <HoverCardContent side="top" align="start">
    <div className="flex gap-2">
      <Avatar><AvatarFallback>U</AvatarFallback></Avatar>
      <div>
        <p className="text-sm font-medium">User Name</p>
        <p className="text-xs text-muted-foreground">Bio text</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

- Uses `@base-ui/react/preview-card`
- Opens on hover with delay (built-in)
- Same positioning props as Popover and Tooltip

---

## Field Components (Form Layout)

```tsx
import { Field, FieldLabel, FieldContent, FieldDescription, FieldError, FieldGroup, FieldSet, FieldLegend, FieldSeparator, FieldTitle } from "@/components/ui/field"
```

**Single field:**

```tsx
<Field orientation="vertical">
  <FieldLabel>
    <Label htmlFor="name">Name</Label>
  </FieldLabel>
  <FieldContent>
    <Input id="name" />
    <FieldDescription>Your full display name</FieldDescription>
    <FieldError errors={formState.errors.name} />
  </FieldContent>
</Field>
```

**Field orientations:** `"vertical"` (default), `"horizontal"`, `"responsive"`

**FieldSet + FieldGroup for complex forms:**

```tsx
<FieldSet>
  <FieldLegend variant="legend">Section Title</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel>Field 1</FieldLabel>
      <FieldContent>
        <Input />
      </FieldContent>
    </Field>
    <FieldSeparator>or</FieldSeparator>
    <Field>
      <FieldLabel>Field 2</FieldLabel>
      <FieldContent>
        <Input />
      </FieldContent>
    </Field>
  </FieldGroup>
</FieldSet>
```

- `FieldError` accepts `errors` array (from React Hook Form's `formState.errors`) and renders unique messages
- `FieldSeparator` renders an "or" divider line

---

## React Hook Form Integration

This project uses React Hook Form + Zod for form validation. Two patterns are used:

### Pattern 1: `useForm` with Context

Wrap form sections in a context provider:

```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})

return (
  <FormProvider value={form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormSection />
      <Button type="submit">Save</Button>
    </form>
  </FormProvider>
)
```

### Pattern 2: `useController` for Controlled Components

```tsx
const { field, fieldState } = useController({ name: 'fieldName', control })

return (
  <Field>
    <FieldLabel>
      <Label htmlFor="field-name">Label</Label>
    </FieldLabel>
    <FieldContent>
      <Input
        id="field-name"
        value={field.value}
        onChange={field.onChange}
        aria-invalid={!!fieldState.error}
        aria-describedby={fieldState.error ? "field-name-error" : undefined}
      />
      {fieldState.error && (
        <FieldError>{fieldState.error.message}</FieldError>
      )}
    </FieldContent>
  </Field>
)
```

### Pattern 3: Sub-component forms with `Control` prop

Pass `control` down to child components:

```tsx
// Parent
const { control } = useForm<Values>()
return <ChildForm control={control} />

// Child
interface Props { control: Control }
const { field } = useController({ name: 'fieldName', control })
```

---

## Table (TanStack)

This project uses **TanStack Table** (`@tanstack/react-table`) for all data tables, not manual `<table>` elements:

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
