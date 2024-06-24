"use client";

import { Tooltip } from "@nextui-org/tooltip";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher({ tip }) {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Tooltip content={tip}>
            <button onClick={() => setTheme(theme == 'light' ? 'dark' : 'light')}>
                {theme == 'light' ? '🌞' : '🌜'}
            </button>
        </Tooltip>
    )
};