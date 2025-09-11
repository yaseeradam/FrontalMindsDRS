"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoading } from "@/contexts/loading-context";

interface PageLoadingProps {
	text?: string;
	className?: string;
}


export function PageLoading({ 
	text = "Loading...", 
	className 
}: PageLoadingProps) {
	const { isLoading } = useLoading();
	if (!isLoading) return null;

	return (
		<div className={cn(
			"fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
			className
		)}>
			<div className="flex flex-col items-center gap-4 p-6 bg-card border rounded-lg shadow-lg">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<div className="text-sm font-mono text-muted-foreground">
					{text.toUpperCase()}
				</div>
			</div>
		</div>
	);
}

// Global loading spinner component that works with any button
export function GlobalLoadingSpinner() {
	return <PageLoading text="Processing..." />;
}

// Hook to detect page navigation and show loading spinner
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function usePageLoading() {
	const [loading, setLoading] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		setLoading(true);
		const timer = setTimeout(() => setLoading(false), 800);
		return () => clearTimeout(timer);
	}, [pathname, searchParams]);

	const showLoading = (duration = 1000) => {
		setLoading(true);
		const timer = setTimeout(() => setLoading(false), duration);
		return () => clearTimeout(timer);
	};

	return { loading, setLoading, showLoading };
}
