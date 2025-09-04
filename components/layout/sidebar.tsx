"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutGrid,
	Search,
	FolderKanban,
	Gavel,
	ShieldHalf,
	Boxes,
	RefreshCcw,
	BarChart3,
	Settings,
    ChevronsLeftRight,
} from "lucide-react";

const items = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
	{ href: "/records", label: "Records", icon: Search },
	{ href: "/cases", label: "Cases", icon: FolderKanban },
	{ href: "/arrests", label: "Arrests", icon: Gavel },
	{ href: "/patrols", label: "Patrols", icon: ShieldHalf },
	{ href: "/evidence", label: "Evidence", icon: Boxes },
	{ href: "/sync", label: "Sync", icon: RefreshCcw },
	{ href: "/reports", label: "Reports", icon: BarChart3 },
	{ href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
	const pathname = usePathname();
	return (
		<aside className={cn("hidden md:flex shrink-0 border-r border-white/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/30", collapsed ? "md:w-16" : "md:w-64 lg:w-72") }>
			<div className="flex-1 p-2 space-y-2">
				<button
					onClick={onToggle}
					className={cn(
						"w-full rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center",
						collapsed ? "h-8" : "h-9"
					)}
					aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					<ChevronsLeftRight className="h-4 w-4 text-white/70" />
				</button>
				{items.map((item) => {
					const Icon = item.icon;
					const active = pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"group flex items-center gap-3 rounded-xl px-3 py-2 text-sm border border-transparent hover:border-white/10 hover:bg-white/5 transition",
								active && "bg-sky-500/10 border-sky-500/20 text-sky-300",
								collapsed && "justify-center"
							)}
						>
							<Icon className={cn("h-4 w-4 text-white/70", active && "text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.55)]")} />
							{!collapsed && <span>{item.label}</span>}
						</Link>
					);
				})}
			</div>
		</aside>
	);
}


