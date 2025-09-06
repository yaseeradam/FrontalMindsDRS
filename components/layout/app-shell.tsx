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
			{!isLogin && <Navbar />}
			{!isLogin && (
				<Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
			)}
			<div className={`${!isLogin ? 'px-6 py-6' : ''} ${!isLogin ? (collapsed ? 'md:ml-16 lg:ml-16' : 'md:ml-64 lg:ml-72') : ''}`}>
				<main className={!isLogin ? "max-w-screen-2xl mx-auto" : ""}>{children}</main>
			</div>
		</>
	);
}
