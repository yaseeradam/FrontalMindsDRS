"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Bell, Command } from "lucide-react";

export function Navbar() {
	const pathname = usePathname();
	return (
		<header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/30 border-b border-white/10">
			<div className="mx-auto max-w-screen-2xl px-6 h-16 flex items-center justify-between">
				<Link href="/dashboard" className="flex items-center gap-3 group">
					<div className="relative">
						<Shield className="h-7 w-7 text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.75)]" />
					</div>
					<div className="leading-tight">
						<div className="font-bold tracking-wider text-sky-300">Braniacs DRS</div>
						<div className="text-[10px] text-white/60 -mt-0.5">Digital Records System</div>
					</div>
				</Link>
				<div className="flex items-center gap-3">
					<Badge variant="secondary" className="bg-sky-500/10 text-sky-300 border-sky-500/20">LAG-ILU-023</Badge>
					<Separator orientation="vertical" className="h-6 bg-white/10" />
					<button className="relative h-9 w-9 inline-grid place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
						<Bell className="h-4 w-4 text-white/80" />
						<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-sky-500 text-[10px] grid place-items-center">3</span>
					</button>
					<Avatar className="h-9 w-9 border border-white/10">
						<AvatarFallback>OF</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</header>
	);
}


