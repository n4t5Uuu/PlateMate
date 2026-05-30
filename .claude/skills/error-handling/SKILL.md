# Skill: Error Handling Pattern

Apply this pattern whenever writing or editing helpers, hooks, or dialogs.

## Helper / Hook (backend layer)

```ts
function extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "object" && error !== null && "message" in error)
        return String((error as any).message)
    return "An unexpected error occurred"
}

async function someHelper() {
    try {
        const { data, error } = await supabase.from("tbl_example").select()
        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error("[someHelper]", error)
        return { success: false, error: extractMessage(error) }
    }
}
```

**Why `extractMessage`:** Supabase returns `PostgrestError` objects, not native JS `Error`. Calling `String(error)` on them produces `[object Object]`. The helper checks for `.message` first.

## Dialog / Component (frontend layer)

```ts
const result = await someHelper()

if (result.success) {
    toast.success("Short success message")
    setOpen(false)
} else {
    toast.error("Short user-friendly message", {
        description: "Something went wrong. Please try again."
    })
}
```

**Rules:**
- Never pass `result.error` directly to `toast.error()` — it may be a raw DB error
- Always show a user-friendly string in the toast
- The raw error is already logged in the helper — no need to log again in the component
