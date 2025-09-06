"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CaseRecord, readStore, writeStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export default function CasesPage() {
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	
	useEffect(() => {
		ensureSeed();
		setCases(readStore("cases", [] as CaseRecord[]));
	}, []);

	async function remove(id: string) {
		if (deletingId) return;
		
		setDeletingId(id);
		try {
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const next = cases.filter((c) => c.id !== id);
			setCases(next);
			writeStore("cases", next);
		} catch (error) {
			// Handle error if needed
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">CASE FILES DATABASE</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">CRIMINAL INVESTIGATION RECORDS</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
							CASES ONLINE
						</div>
						<Button className="font-mono" asChild><Link href="/cases/new">NEW CASE</Link></Button>
					</div>
				</div>
			</div>

			{cases.length === 0 ? (
				<div className="text-center py-16 bg-card border border-border rounded-xl">
					<div className="text-lg font-medium mb-2 font-mono">NO CASE FILES FOUND</div>
					<div className="text-sm text-muted-foreground font-mono">CREATE A NEW CASE TO GET STARTED</div>
					<div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
						SYSTEM READY
					</div>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{cases.map((c, index) => {
						const priorityLevel = 
							c.status === "Open" || c.status === "Under Investigation" ? "HIGH" :
							c.status === "Transferred" ? "CRITICAL" :
							"NORMAL";
						
						const priorityColor = 
							priorityLevel === "CRITICAL" ? "bg-red-500" :
							priorityLevel === "HIGH" ? "bg-yellow-500" :
							"bg-green-500";
						
						return (
							<div 
								key={c.id} 
								className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20 overflow-hidden"
							>
								{/* Header */}
								<div className="p-4 border-b border-border bg-muted/30">
									<div className="flex items-center justify-between mb-2">
										<div className="font-mono text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
											{c.id}
										</div>
										<div className="flex items-center gap-2">
											<div className={`h-2 w-2 rounded-full ${priorityColor} animate-pulse`}></div>
											<span className="text-xs font-mono text-muted-foreground">{priorityLevel}</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<Badge 
											variant="default"
											className="font-medium text-xs bg-blue-500 hover:bg-blue-600"
										>
											CASE
										</Badge>
										<div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
											c.status === "Open" ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700" :
											c.status === "Under Investigation" ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700" :
											c.status === "Closed" ? "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700" :
											c.status === "Transferred" ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700" :
											"bg-muted text-muted-foreground border-border"
										}`}>
											{c.status}
										</div>
									</div>
								</div>
								
								{/* Content */}
								<div className="p-4 space-y-3">
									<div>
										<div className="text-xs text-muted-foreground font-mono mb-1">CRIME TYPE</div>
										<div className="font-medium text-sm group-hover:font-semibold transition-all text-blue-700 dark:text-blue-300">
											{c.crimeType}
											{c.suspect && <span className="text-muted-foreground"> - {c.suspect}</span>}
										</div>
									</div>
									
									<div className="grid grid-cols-2 gap-3 text-xs">
										<div>
											<div className="text-muted-foreground font-mono mb-1">OFFICER</div>
											<div className="font-mono font-medium">{c.officer}</div>
										</div>
										<div>
											<div className="text-muted-foreground font-mono mb-1">DATE/TIME</div>
											<div className="font-mono">{new Date(c.date).toLocaleDateString()}</div>
											<div className="font-mono text-xs text-muted-foreground">{new Date(c.date).toLocaleTimeString()}</div>
										</div>
									</div>
									
									{/* Classification */}
									<div className="pt-2 border-t border-border/50">
										<div className="flex items-center justify-between text-xs">
											<div className="flex items-center gap-2">
												<div className="text-muted-foreground font-mono">CLASSIFICATION:</div>
												<div className="px-2 py-1 rounded font-mono bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
													CRIMINAL
												</div>
											</div>
											<div className="text-muted-foreground font-mono">
												#{index.toString().padStart(3, '0')}
											</div>
										</div>
									</div>
								</div>
								
								{/* Actions */}
								<div className="p-4 border-t border-border bg-muted/20">
									<div className="flex gap-2">
										<Button size="sm" variant="outline" asChild className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-500 hover:text-white dark:border-blue-600 dark:text-blue-400 font-mono text-xs">
											<Link href={`/cases/${encodeURIComponent(c.id)}`}>VIEW CASE</Link>
										</Button>
										<Button size="sm" variant="outline" asChild className="border-blue-300 text-blue-700 hover:bg-blue-500 hover:text-white dark:border-blue-600 dark:text-blue-400 font-mono text-xs">
											<Link href={`/cases/edit?id=${encodeURIComponent(c.id)}`}>EDIT</Link>
										</Button>
										<Button 
											size="sm" 
											variant="destructive" 
											onClick={() => remove(c.id)}
											disabled={deletingId === c.id}
											className="px-3 font-mono text-xs"
										>
											{deletingId === c.id && <Spinner size="sm" />}
											{deletingId === c.id ? "..." : "DEL"}
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
