"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/app/providers/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { user, isLoading } = useAuth();
	const isLogin = pathname === "/login";
	const showNavAndSidebar = !isLogin && user && !isLoading;
    const [collapsed, setCollapsed] = useState(false);
	return (
		<>
			{showNavAndSidebar && <Navbar />}
			{showNavAndSidebar && (
				<Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
			)}
			<div className={`${showNavAndSidebar ? 'px-6 py-6' : ''} ${showNavAndSidebar ? (collapsed ? 'md:ml-16 lg:ml-16' : 'md:ml-64 lg:ml-72') : ''}`}>
				<main className={showNavAndSidebar ? "max-w-screen-2xl mx-auto" : ""}>{children}</main>
			</div>
		</>
	);
}
