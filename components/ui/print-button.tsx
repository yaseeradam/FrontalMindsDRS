"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onClick: () => void;
  label?: string;
}

export function PrintButton({ onClick, label = "PRINT" }: PrintButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="font-mono border-blue-300 text-blue-700 hover:bg-blue-500 hover:text-white dark:border-blue-600 dark:text-blue-400"
      onClick={onClick}
    >
      <Printer className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}