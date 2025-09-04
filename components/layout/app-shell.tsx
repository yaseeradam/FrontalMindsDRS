"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isLogin = pathname === "/login";
    const [collapsed, setCollapsed] = useState(false);
	return (
		<>
			<Navbar />
			<div className="mx-auto max-w-screen-2xl px-6 py-6 flex gap-6">
				{!isLogin && (
					<Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
				)}
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</>
	);
}


