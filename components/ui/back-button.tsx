"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "BACK" }: BackButtonProps) {
  return (
    <Button variant="outline" size="sm" asChild className="font-mono">
      <Link href={href}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {label}
      </Link>
    </Button>
  );
}