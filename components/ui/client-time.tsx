"use client";

import { useState, useEffect } from "react";

interface ClientTimeProps {
  className?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
}

export function ClientTime({ className, formatOptions }: ClientTimeProps) {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString(undefined, formatOptions));
    };
    
    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [formatOptions]);

  // Render nothing on server to prevent hydration mismatch
  if (!mounted) {
    return <div className={className}>--:--:--</div>;
  }

  return <div className={className}>{time}</div>;
}
