"use client";

import { usePageLoading, PageLoading } from "@/components/ui/page-loading";
import { Spinner } from "@/components/ui/spinner";

interface LoadingWrapperProps {
	children: React.ReactNode;
}

export function LoadingWrapper({ children }: LoadingWrapperProps) {
	const { loading } = usePageLoading();

	return (
		<>
			{loading && (
				<div className="fixed top-4 right-4 z-50">
					<div className="bg-primary/10 backdrop-blur-sm p-2 rounded-full border border-primary/20 shadow-lg flex items-center gap-2">
						<Spinner size="sm" className="text-primary" />
						<span className="text-xs font-mono text-primary">LOADING</span>
					</div>
				</div>
			)}
			{children}
		</>
	);
}
