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
import { Lock, Shield, ArrowLeft, Printer } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { PrintButton } from "@/components/ui/print-button";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRoleProtection } from "@/hooks/useRoleProtection";

export default function PatrolsPage() {
	// Print function for patrol records
	const printPatrol = (patrol: PatrolRecord) => {
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;
		
		const printHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Patrol Report - ${patrol.id}</title>
				<style>
					body { font-family: 'Arial', sans-serif; margin: 20px; line-height: 1.4; color: #333; }
					.letterhead { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px 40px; margin: -20px -20px 30px -20px; position: relative; }
					.letterhead h1 { margin: 0; font-size: 28px; }
					.letterhead p { margin: 5px 0 0 0; opacity: 0.8; }
					.badge { position: absolute; top: 30px; right: 40px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; }
					.section { margin-bottom: 20px; }
					.section-title { font-size: 14px; text-transform: uppercase; margin-bottom: 5px; color: #666; }
					.section-content { font-size: 16px; }
					.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
					.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
					@media print { body { margin: 0; } }
				</style>
			</head>
			<body>
				<div class="letterhead">
					<h1>NIGERIA POLICE FORCE</h1>
					<p>PATROL REPORT - OFFICIAL DOCUMENT</p>
					<div class="badge">👮</div>
				</div>
				
				<div class="section">
					<div class="section-title">PATROL ID</div>
					<div class="section-content">${patrol.id}</div>
				</div>
				
				<div class="grid">
					<div class="section">
						<div class="section-title">LOCATION</div>
						<div class="section-content">${patrol.location}</div>
					</div>
					
					<div class="section">
						<div class="section-title">OFFICER</div>
						<div class="section-content">${patrol.officer}</div>
					</div>
					
					<div class="section">
						<div class="section-title">DATE</div>
						<div class="section-content">${patrol.date}</div>
					</div>
					
					<div class="section">
						<div class="section-title">TIME</div>
						<div class="section-content">${patrol.time}</div>
					</div>
				</div>
				
				${patrol.notes ? `
				<div class="section">
					<div class="section-title">NOTES & OBSERVATIONS</div>
					<div class="section-content">${patrol.notes.replace(/\n/g, '<br>')}</div>
				</div>
				` : ''}
				
				<div class="footer">
					<p>FRONTALMINDS POLICE DRS v0.1.0 | GENERATED ${new Date().toLocaleString()}</p>
					<p>This is an official document of the Nigeria Police Force. Unauthorized reproduction is prohibited.</p>
				</div>
			</body>
			</html>
		`;
		
		printWindow.document.open();
		printWindow.document.write(printHTML);
		printWindow.document.close();
		
		setTimeout(() => {
			printWindow.print();
		}, 500);
	};

	const { user, hasAccess } = useRoleProtection(); // Require authentication
	const { canDelete } = useAuth();
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

	// Show loading screen while checking authentication
	if (!hasAccess) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex items-center gap-3 text-muted-foreground">
					<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
					<span className="font-mono text-sm">LOADING PATROL LOGS...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Role-based access indicator */}
			<div className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Shield className="h-5 w-5 text-primary" />
						<div>
							<div className="text-sm font-mono font-semibold">
								ACCESS LEVEL: {user?.role?.toUpperCase() || 'UNKNOWN'}
							</div>
							<div className="text-xs text-muted-foreground font-mono">
								{canDelete() 
									? 'Full permissions - View, Edit, Delete' 
									: 'Limited permissions - View and Edit only'
								}
							</div>
						</div>
					</div>
					{!canDelete() && (
						<div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400">
							<Lock className="h-3 w-3" />
							RESTRICTED: Contact Chief or Admin to delete patrols
						</div>
					)}
				</div>
			</div>
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<BackButton href="/dashboard" label="BACK TO DASHBOARD" />
						<div>
							<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">PATROL LOGS</h1>
							<p className="text-sm text-muted-foreground font-mono mt-1">FIELD OPERATIONS & SURVEILLANCE</p>
						</div>
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
									<PrintButton 
										onClick={() => printPatrol(p)} 
										label="PRINT PATROL"
									/>
									{canDelete() && (
										<Button size="sm" variant="destructive" onClick={() => openDeleteConfirm(p.id, p.location)} className="px-3 font-mono text-xs">
											DELETE
										</Button>
									)}
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
