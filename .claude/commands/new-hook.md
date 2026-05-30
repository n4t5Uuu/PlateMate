# /new-hook [name]

Scaffold a new data-fetching hook following the project's established pattern.

## Pattern

File: `src/hooks/use-[name].ts`

```ts
"use client"

import { useState, useEffect } from "react"
import { browserSupabase } from "@/lib/supabase/browser"
import { useAuth } from "@/components/providers/auth-provider"

export function use[Name]() {
    const { user } = useAuth()
    const [data, setData] = useState<Type[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        if (!user?.id) {
            setData([])
            return
        }

        setLoading(true)
        setError(null)

        const result = await [name]Helper.get[Name]s(browserSupabase, user.id)

        if (result.success)
            setData(result.data as Type[])
        else
            setError(result.error || "Failed to fetch")

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [user?.id])

    return { data, loading, error, refetch: fetchData }
}
```

## Rules

- Always guard with `if (!user?.id)` before fetching
- Always reset error to null before a new fetch
- Name the refetch function `refetch[Name]s` or just `refetch`
- The corresponding helper goes in `src/lib/[name]-helper.ts`
