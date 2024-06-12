"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <button onClick={() => setTheme(theme == 'light' ? 'dark' : 'light')}>
            {theme == 'light' ? '🌞' : '🌜'}
        </button>
    )
};