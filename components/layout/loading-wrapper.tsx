"use client";

import { usePageLoading, PageLoading } from "@/components/ui/page-loading";

interface LoadingWrapperProps {
	children: React.ReactNode;
}

export function LoadingWrapper({ children }: LoadingWrapperProps) {
	const { loading } = usePageLoading();

	return (
		<>
			<PageLoading loading={loading} text="Loading System..." />
			{children}
		</>
	);
}
