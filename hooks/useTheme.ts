"use client";

import { useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
    const [theme, setTheme] = useState<Theme | null>(null);

    useEffect(() => {
        setTheme(
            document.documentElement.classList.contains("dark") ? "dark" : "light"
        );
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === "light" ? "dark" : "light";
            if (next === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            localStorage.setItem("theme", next);
            return next;
        });
    }, []);

    return { theme, toggleTheme } as const;
}
