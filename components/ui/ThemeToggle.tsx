"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "sidebar" | "default";
}

export default function ThemeToggle({
  className,
  variant = "default",
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/50",
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark");
      return;
    }
    setTheme(isDark ? "light" : "dark");
  };

  const variantStyles =
    variant === "sidebar"
      ? "border-sidebar-border bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/60"
      : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-colors",
        variantStyles,
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
