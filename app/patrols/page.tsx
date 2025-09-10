"use client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { PatrolRecord, readStore, writeStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function PatrolsPage() {
	const [patrols, setPatrols] = useState<PatrolRecord[]>([]);
	const [location, setLocation] = useState<string>("All");
	const [q, setQ] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; location: string }>({ open: false, id: "", location: "" });

	useEffect(() => {
		ensureSeed();
		setPatrols(readStore("patrols", [] as PatrolRecord[]));
	}, []);

	const filtered = useMemo(() => {
		return patrols.filter((p) => {
			if (location !== "All" && p.location !== location) return false;
			if (q && !(p.location.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()) || p.officer.toLowerCase().includes(q.toLowerCase()))) return false;
			return true;
		});
	}, [patrols, location, q]);

	const uniqueLocations = useMemo(() => {
		const locations = Array.from(new Set(patrols.map(p => p.location)));
		return ["All", ...locations];
	}, [patrols]);

	function openDeleteConfirm(id: string, location: string) {
		setDeleteConfirm({ open: true, id, location });
	}

	function confirmDelete() {
		const next = patrols.filter((p) => p.id !== deleteConfirm.id);
		setPatrols(next);
		writeStore("patrols", next);
		setDeleteConfirm({ open: false, id: "", location: "" });
	}

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">PATROL LOGS</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">FIELD OPERATIONS & SURVEILLANCE</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
							PATROL SYSTEM ONLINE
						</div>
						<Button className="font-mono bg-green-500 hover:bg-green-600" asChild>
							<Link href="/patrols/new">LOG PATROL</Link>
						</Button>
					</div>
				</div>
			</div>

			<div className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="font-semibold text-foreground font-mono">SEARCH FILTERS</h3>
						<p className="text-xs text-muted-foreground font-mono">REFINE PATROL RECORDS</p>
					</div>
					<div className="text-xs text-muted-foreground font-mono">
						RESULTS: {filtered.length.toString().padStart(3, '0')}
					</div>
				</div>
				<div className="grid md:grid-cols-3 gap-4">
					<div>
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">LOCATION</div>
						<Select value={location} onValueChange={setLocation}>
							<SelectTrigger className="font-mono"><SelectValue placeholder="All Locations" /></SelectTrigger>
							<SelectContent>
								{uniqueLocations.map((loc) => (<SelectItem key={loc} value={loc} className="font-mono">{loc}</SelectItem>))}
							</SelectContent>
						</Select>
					</div>
					<div className="md:col-span-2">
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">SEARCH QUERY</div>
						<Input 
							placeholder="Enter patrol ID, location, or officer name..." 
							value={q} 
							onChange={(e) => setQ(e.target.value)}
							className="font-mono"
						/>
					</div>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div className="text-center py-16 bg-card border border-border rounded-xl">
					<div className="text-lg font-medium mb-2 font-mono">NO PATROL LOGS FOUND</div>
					<div className="text-sm text-muted-foreground font-mono">ADJUST SEARCH PARAMETERS OR LOG NEW PATROL</div>
					<div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
						SEARCH COMPLETED - 0 MATCHES
					</div>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filtered.map((p, index) => {
						const priorityLevel = "NORMAL"; // Patrols are generally normal priority
						const priorityColor = "bg-green-500";
						
						return (
							<div 
								key={p.id} 
								className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20 overflow-hidden"
							>
								{/* Header */}
								<div className="p-4 border-b border-border bg-muted/30">
									<div className="flex items-center justify-between mb-2">
										<div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-mono text-xs px-2 py-1 rounded-md">
											{p.id}
										</div>
										<div className="flex items-center gap-2">
											<div className={`h-2 w-2 rounded-full ${priorityColor} animate-pulse`}></div>
											<span className="text-xs font-mono text-muted-foreground">{priorityLevel}</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<Badge 
											variant="secondary"
											className="bg-green-500 hover:bg-green-600 text-white font-medium text-xs"
										>
											PATROL
										</Badge>
										<div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border">
											ACTIVE
										</div>
									</div>
								</div>
								
								{/* Content */}
								<div className="p-4 space-y-3">
									<div>
										<div className="text-xs text-muted-foreground font-mono mb-1">PATROL LOCATION</div>
										<div className="font-medium text-sm group-hover:font-semibold transition-all text-green-700 dark:text-green-300">
											{p.location}
										</div>
									</div>
									
									<div className="grid grid-cols-2 gap-3 text-xs">
										<div>
											<div className="text-muted-foreground font-mono mb-1">OFFICER</div>
											<div className="font-mono font-medium">{p.officer}</div>
										</div>
										<div>
											<div className="text-muted-foreground font-mono mb-1">DATE/TIME</div>
											<div className="font-mono">{p.date}</div>
											<div className="font-mono text-xs text-muted-foreground">{p.time}</div>
										</div>
									</div>
									
									{/* Classification */}
									<div className="pt-2 border-t border-border/50">
										<div className="flex items-center justify-between text-xs">
											<div className="flex items-center gap-2">
												<div className="text-muted-foreground font-mono">CLASSIFICATION:</div>
												<div className="px-2 py-1 rounded font-mono bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
													PATROL
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
										<Button size="sm" variant="outline" asChild className="flex-1 border-green-300 text-green-700 hover:bg-green-500 hover:text-white dark:border-green-600 dark:text-green-400 font-mono text-xs">
											<Link href={`/patrols/new`}>NEW PATROL</Link>
										</Button>
										<Button size="sm" variant="destructive" onClick={() => openDeleteConfirm(p.id, p.location)} className="px-3 font-mono text-xs">
											DELETE
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<ConfirmationDialog
				open={deleteConfirm.open}
				onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
				title="Delete Patrol Record"
				description={`Are you sure you want to delete the patrol record for "${deleteConfirm.location}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
