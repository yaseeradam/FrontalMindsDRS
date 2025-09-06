"use client";

import { useState, useEffect } from "react";

export function ClientYear() {
  const [year, setYear] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setYear(new Date().getFullYear().toString());
  }, []);

  // Render placeholder on server to prevent hydration mismatch
  if (!mounted) {
    return <span>YYYY</span>;
  }

  return <span>{year}</span>;
}
