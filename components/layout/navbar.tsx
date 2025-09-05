"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
	const { resolvedTheme, setTheme } = useTheme();
	return (
		<header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/80 bg-background/95 border-b border-border">
			<div className="mx-auto max-w-screen-2xl px-6 h-16 flex items-center justify-between">
				<Link href="/dashboard" className="flex items-center gap-3 group">
					<div className="relative">
						<Shield className="h-7 w-7 text-primary drop-shadow-[0_0_12px_rgba(56,189,248,0.75)]" />
					</div>
					<div className="leading-tight">
						<div className="font-bold tracking-wider text-primary">Braniacs DRS</div>
						<div className="text-[10px] text-muted-foreground -mt-0.5">Digital Records System</div>
					</div>
				</Link>
				<div className="flex items-center gap-3">
					<Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">LAG-ILU-023</Badge>
					<Separator orientation="vertical" className="h-6 bg-border" />
					<button
						className="h-9 w-9 inline-grid place-items-center rounded-xl bg-muted border border-border hover:bg-accent transition"
						aria-label="Toggle theme"
						onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
					>
						{resolvedTheme === "dark" ? (
							<Sun className="h-4 w-4 text-foreground/80" />
						) : (
							<Moon className="h-4 w-4 text-foreground/80" />
						)}
					</button>
					<button className="relative h-9 w-9 inline-grid place-items-center rounded-xl bg-muted border border-border hover:bg-accent transition">
						<Bell className="h-4 w-4 text-foreground/80" />
						<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">3</span>
					</button>
					<Avatar className="h-9 w-9 border border-border">
						<AvatarFallback>OF</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</header>
	);
}


