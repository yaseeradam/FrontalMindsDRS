"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Settings } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a neutral icon during SSR to prevent hydration mismatch
    return (
      <button
        className="h-9 w-9 inline-grid place-items-center rounded-xl bg-muted border border-border hover:bg-accent transition"
        aria-label="Toggle theme"
        disabled
      >
        <Settings className="h-4 w-4 text-muted-foreground/50 animate-spin" />
      </button>
    );
  }

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "light") {
      return <Sun className="h-4 w-4 text-foreground/80" />;
    } else if (theme === "dark") {
      return <Moon className="h-4 w-4 text-foreground/80" />;
    } else {
      // System theme
      return resolvedTheme === "dark" ? 
        <Moon className="h-4 w-4 text-foreground/80" /> : 
        <Sun className="h-4 w-4 text-foreground/80" />;
    }
  };

  return (
    <button
      className="h-9 w-9 inline-grid place-items-center rounded-xl bg-muted border border-border hover:bg-accent transition-all duration-200"
      aria-label={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} theme`}
      onClick={toggleTheme}
    >
      {getIcon()}
    </button>
  );
}
