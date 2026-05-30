# Skill: Frontend Design

Apply this when building or editing React components, pages, and dialogs in PlateMate.

## Component Structure

- Pages → default export, in `src/app/[route]/page.tsx`
- Reusable components → named export, in `src/components/`
- Dialogs → named export, in `src/components/dialogs/`
- Data hooks → in `src/hooks/use-[name].ts`

## Glassmorphism Card

```tsx
<div className="glass-morphism rounded-xl border-none shadow-lg px-5 sm:px-6 py-5">
```

## Section Label

```tsx
<p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-4">
    Label
</p>
```

## Status Dot

```tsx
<div className={`w-2 h-2 rounded-full shrink-0 ${statusColors[status]}`} />
```

## Priority Badge

```tsx
<Badge
    className={`${priorityColors[priority]} text-[10px] py-0.5 px-2 font-bold uppercase tracking-widest border shadow-none`}
    variant="outline"
>
    {priority}
</Badge>
```

## Progress Bar

```tsx
<div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
    <div className={`h-full ${statusColors[status]} transition-all duration-1000`} style={{ width: `${progress}%` }} />
</div>
```

## Avatar with Fallback

```tsx
<Avatar className="w-9 h-9 shrink-0">
    <AvatarImage />
    <AvatarFallback className="text-[11px] font-bold bg-muted">
        {initials}
    </AvatarFallback>
</Avatar>
```

## Toast (Sonner)

```tsx
toast.success("Short success message")
toast.error("User-friendly error", { description: "More detail if needed." })
```

## Dialog Pattern

```tsx
const [open, setOpen] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) { toast.error("..."); return }
    setIsSubmitting(true)
    try {
        const result = await helper.doSomething(...)
        if (result.success) {
            toast.success("Done!")
            setOpen(false)
        } else {
            toast.error("Failed", { description: "Please try again." })
        }
    } catch (error) {
        console.error("[DialogName]", error)
        toast.error("Unexpected error", { description: "Please try again." })
    } finally {
        setIsSubmitting(false)
    }
}
```

## Sidebar Menu Item

```tsx
<SidebarMenuItem>
    <SidebarMenuButton asChild isActive={pathname === url}>
        <a href={url}>
            <Icon className="w-4 h-4" />
            <span>{name}</span>
        </a>
    </SidebarMenuButton>
</SidebarMenuItem>
```
