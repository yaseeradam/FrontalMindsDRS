"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ClientTime } from "@/components/ui/client-time";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Shield, Bell, Globe } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function Navbar() {
	const { language, setLanguage, t } = useLanguage();
	
	return (
		<header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/80 bg-background/95 border-b border-border">
			<div className="mx-auto max-w-screen-2xl px-6 h-16 flex items-center justify-between">
				<Link href="/dashboard" className="flex items-center gap-3 group">
					<div className="relative">
						<Shield className="h-8 w-8 text-primary drop-shadow-[0_0_12px_rgba(56,189,248,0.75)]" />
					</div>
					<div className="leading-tight">
						<div className="font-bold tracking-wider text-primary text-lg">{t("navbar.title")}</div>
						<div className="text-[10px] text-muted-foreground -mt-0.5 font-mono">{t("navbar.subtitle")}</div>
					</div>
				</Link>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
						<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
						<div className="text-xs font-mono text-primary">{t("navbar.unit")}</div>
					</div>
					<div className="text-xs text-muted-foreground font-mono">
						<div>{t("navbar.shift")}</div>
						<ClientTime className="text-[10px]" />
					</div>
					<div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-1.5">
						<Globe className="h-3 w-3 text-muted-foreground" />
						<select 
							className="bg-transparent text-xs font-mono text-foreground border-none outline-none cursor-pointer"
							value={language}
							onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
						>
							<option value="en">EN</option>
							<option value="fr">FR</option>
						</select>
					</div>
					<Separator orientation="vertical" className="h-8 bg-border" />
					<ThemeToggle />
					<button className="relative h-9 w-9 inline-grid place-items-center rounded-xl bg-muted border border-border hover:bg-accent transition">
						<Bell className="h-4 w-4 text-foreground/80" />
						<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">3</span>
					</button>
					<div className="flex items-center gap-2">
						<Avatar className="h-9 w-9 border-2 border-primary/30">
							<AvatarFallback className="bg-primary/10 text-primary font-semibold">OFC</AvatarFallback>
						</Avatar>
						<div className="text-xs leading-tight">
							<div className="font-medium text-foreground">{t("navbar.officer")}</div>
							<div className="text-[10px] text-muted-foreground font-mono">{t("navbar.badge")}</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
