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
	Activity,
	Settings,
    ChevronsLeftRight,
} from "lucide-react";

const items = [
	{ href: "/cases", label: "CASE FILES", icon: FolderKanban, description: "Active Cases" },
	{ href: "/arrests", label: "ARRESTS", icon: Gavel, description: "Booking Records" },
	{ href: "/patrols", label: "PATROL LOGS", icon: ShieldHalf, description: "Field Reports" },
	{ href: "/evidence", label: "EVIDENCE", icon: Boxes, description: "Digital Vault" },
	{ href: "/dashboard", label: "COMMAND CENTER", icon: LayoutGrid, description: "Main Dashboard" },
	{ href: "/records", label: "LAW ACTS", icon: Search, description: "Legal References" },
	{ href: "/activity", label: "ACTIVITY LOG", icon: Activity, description: "System Audit" },
	{ href: "/sync", label: "HQ SYNC", icon: RefreshCcw, description: "Data Transfer" },
	{ href: "/reports", label: "ANALYTICS", icon: BarChart3, description: "Statistics" },
	{ href: "/settings", label: "SYSTEM", icon: Settings, description: "Configuration" },
];

export function Sidebar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
	const pathname = usePathname();
	return (
		<aside className={cn("hidden md:flex fixed left-0 top-16 bottom-0 z-30 shrink-0 border-r border-sidebar-border bg-sidebar backdrop-blur supports-[backdrop-filter]:bg-sidebar/95", collapsed ? "md:w-16" : "md:w-64 lg:w-72") }>
			<div className={cn("flex-1 space-y-2 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
				
				<button
					onClick={onToggle}
					className={cn(
						"w-full rounded-lg border border-sidebar-border bg-card hover:bg-sidebar-accent transition grid place-items-center shadow-sm",
						collapsed ? "h-10" : "h-9"
					)}
					aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					<ChevronsLeftRight className="h-4 w-4 text-sidebar-foreground" />
				</button>
				
				<div className="space-y-1">
					{items.map((item) => {
						const Icon = item.icon;
						const active = pathname.startsWith(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"group flex items-center rounded-xl border border-sidebar-border bg-card hover:bg-sidebar-accent transition shadow-sm relative overflow-hidden",
									active && "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground shadow-md",
									collapsed ? "justify-center p-2 h-12" : "gap-3 px-3 py-3"
								)}
								title={collapsed ? `${item.label} - ${item.description}` : undefined}
							>
								{active && !collapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground"></div>}
								{collapsed ? (
									<Icon className={cn("h-5 w-5 text-sidebar-foreground", active && "text-sidebar-primary-foreground")} />
								) : (
									<>
										<div className={cn("p-2 rounded-lg", active ? "bg-sidebar-primary-foreground/20" : "bg-muted/50")}>
											<Icon className={cn("h-4 w-4 text-sidebar-foreground", active && "text-sidebar-primary-foreground")} />
										</div>
										<div className="flex-1 min-w-0">
											<div className={cn("font-mono text-xs font-semibold tracking-wider text-sidebar-foreground truncate", active && "text-sidebar-primary-foreground")}>
												{item.label}
											</div>
											<div className={cn("text-xs text-muted-foreground font-mono truncate", active && "text-sidebar-primary-foreground/70")}>
												{item.description}
											</div>
										</div>
									</>
								)}
							</Link>
						);
					})}
				</div>
			</div>
		</aside>
	);
}
