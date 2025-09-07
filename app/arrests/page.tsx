"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ArrestRecord, readStore, writeStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Printer, Eye } from "lucide-react";

export default function ArrestsPage() {
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);
	const [preview, setPreview] = useState<string | undefined>();
	const [status, setStatus] = useState<string>("All");
	const [q, setQ] = useState("");

	useEffect(() => {
		ensureSeed();
		setArrests(readStore("arrests", [] as ArrestRecord[]));
	}, []);

	const filtered = useMemo(() => {
		return arrests.filter((a) => {
			if (status !== "All" && a.status !== status) return false;
			if (q && !(a.suspectName.toLowerCase().includes(q.toLowerCase()) || a.crime.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase()) || a.assignedOfficer.toLowerCase().includes(q.toLowerCase()))) return false;
			return true;
		});
	}, [arrests, status, q]);

	function remove(id: string) {
		const next = arrests.filter((a) => a.id !== id);
		setArrests(next);
		writeStore("arrests", next);
	}

	// Print function for arrest records
	const printArrest = (arrest: ArrestRecord) => {
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;
		
		const printHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Arrest Report - ${arrest.id}</title>
				<style>
					body { font-family: 'Courier New', monospace; margin: 40px; line-height: 1.6; }
					.header { border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; }
					.title { font-size: 24px; font-weight: bold; color: #ef4444; }
					.arrest-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
					.info-item { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
					.info-label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
					.photo-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
					.suspect-photo { max-width: 150px; max-height: 200px; border: 2px solid #ef4444; border-radius: 4px; }
					@media print { body { margin: 0; } @page { margin: 2cm; } }
				</style>
			</head>
			<body>
				<div class="header">
					<h1 class="title">NIGERIA POLICE FORCE - ARREST REPORT</h1>
					<p>Digital Records System | Custody Management</p>
				</div>
				<div class="arrest-info">
					<div class="info-item"><div class="info-label">Arrest ID</div><div>${arrest.id}</div></div>
					<div class="info-item"><div class="info-label">Status</div><div>${arrest.status}</div></div>
					<div class="info-item"><div class="info-label">Suspect Name</div><div>${arrest.suspectName}</div></div>
					<div class="info-item"><div class="info-label">Crime</div><div>${arrest.crime}</div></div>
					<div class="info-item"><div class="info-label">Assigned Officer</div><div>${arrest.assignedOfficer}</div></div>
					<div class="info-item"><div class="info-label">Date & Time</div><div>${new Date(arrest.date).toLocaleString()}</div></div>
					<div class="info-item"><div class="info-label">Arrest Record</div><div>NPF Digital System</div></div>
					<div class="info-item"><div class="info-label">Classification</div><div>CUSTODY</div></div>
				</div>
				<div class="photo-section">
					<div class="info-label">Suspect Photo</div>
					<img src="${arrest.photoBase64}" alt="Suspect Photo" class="suspect-photo" />
				</div>
				<div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 10px; color: #666; text-align: center;">
					<p>Generated on ${new Date().toLocaleString()} | Nigeria Police Force DRS</p>
					<p>This document contains confidential information and is for official use only.</p>
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

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">ARREST RECORDS</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">BOOKING & CUSTODY MANAGEMENT</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
							CUSTODY SYSTEM ONLINE
						</div>
						<Button className="font-mono bg-red-500 hover:bg-red-600" asChild>
							<Link href="/arrests/new">NEW ARREST</Link>
						</Button>
					</div>
				</div>
			</div>

			<div className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="font-semibold text-foreground font-mono">SEARCH FILTERS</h3>
						<p className="text-xs text-muted-foreground font-mono">REFINE ARREST RECORDS</p>
					</div>
					<div className="text-xs text-muted-foreground font-mono">
						RESULTS: {filtered.length.toString().padStart(3, '0')}
					</div>
				</div>
				<div className="grid md:grid-cols-3 gap-4">
					<div>
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">STATUS</div>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="font-mono"><SelectValue placeholder="All Status" /></SelectTrigger>
							<SelectContent>
								{(["All","In Custody","Released","Transferred","Pending"]).map((s) => (<SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>))}
							</SelectContent>
						</Select>
					</div>
					<div className="md:col-span-2">
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">SEARCH QUERY</div>
						<Input 
							placeholder="Enter arrest ID, suspect name, crime, or officer..." 
							value={q} 
							onChange={(e) => setQ(e.target.value)}
							className="font-mono"
						/>
					</div>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div className="text-center py-16 bg-card border border-border rounded-xl">
					<div className="text-lg font-medium mb-2 font-mono">NO ARREST RECORDS FOUND</div>
					<div className="text-sm text-muted-foreground font-mono">ADJUST SEARCH PARAMETERS OR CREATE NEW ARREST</div>
					<div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
						SEARCH COMPLETED - 0 MATCHES
					</div>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filtered.map((a, index) => {
						const priorityLevel = 
							a.status === "In Custody" ? "CRITICAL" :
							a.status === "Pending" ? "HIGH" :
							"NORMAL";
						
						const priorityColor = 
							priorityLevel === "CRITICAL" ? "bg-red-500" :
							priorityLevel === "HIGH" ? "bg-yellow-500" :
							"bg-green-500";
						
						return (
							<div 
								key={a.id} 
								className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20 overflow-hidden"
							>
								{/* Header */}
								<div className="p-4 border-b border-border bg-muted/30">
									<div className="flex items-center justify-between mb-2">
										<div className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-mono text-xs px-2 py-1 rounded-md">
											{a.id}
										</div>
										<div className="flex items-center gap-2">
											<div className={`h-2 w-2 rounded-full ${priorityColor} animate-pulse`}></div>
											<span className="text-xs font-mono text-muted-foreground">{priorityLevel}</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<Badge 
											variant="destructive"
											className="bg-red-500 hover:bg-red-600 font-medium text-xs"
										>
											ARREST
										</Badge>
										<div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
											a.status === "In Custody" ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700" :
											a.status === "Released" ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700" :
											a.status === "Transferred" ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700" :
											"bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700"
										}`}>
											{a.status}
										</div>
									</div>
								</div>
								
								{/* Content */}
								<div className="p-4 space-y-3">
									<div className="flex items-center gap-3">
										<Image 
											onClick={() => setPreview(a.photoBase64)} 
											src={a.photoBase64} 
											alt="Suspect" 
											width={60} 
											height={60} 
											className="h-15 w-15 rounded-lg object-cover cursor-zoom-in border-2 border-red-200 dark:border-red-800" 
										/>
										<div className="flex-1">
											<div className="text-xs text-muted-foreground font-mono mb-1">SUSPECT</div>
											<div className="font-medium text-sm group-hover:font-semibold transition-all text-red-700 dark:text-red-300">
												{a.suspectName}
											</div>
											<div className="text-xs text-muted-foreground font-mono mt-1">CRIME: {a.crime}</div>
										</div>
									</div>
									
									<div className="grid grid-cols-2 gap-3 text-xs">
										<div>
											<div className="text-muted-foreground font-mono mb-1">OFFICER</div>
											<div className="font-mono font-medium">{a.assignedOfficer}</div>
										</div>
										<div>
											<div className="text-muted-foreground font-mono mb-1">DATE/TIME</div>
											<div className="font-mono">{new Date(a.date).toLocaleDateString()}</div>
											<div className="font-mono text-xs text-muted-foreground">{new Date(a.date).toLocaleTimeString()}</div>
										</div>
									</div>
									
									{/* Classification */}
									<div className="pt-2 border-t border-border/50">
										<div className="flex items-center justify-between text-xs">
											<div className="flex items-center gap-2">
												<div className="text-muted-foreground font-mono">CLASSIFICATION:</div>
												<div className="px-2 py-1 rounded font-mono bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
													CUSTODY
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
										<Button size="sm" variant="outline" asChild className="flex-1 border-red-300 text-red-700 hover:bg-red-500 hover:text-white dark:border-red-600 dark:text-red-400 font-mono text-xs">
											<Link href={`/arrests/edit?id=${encodeURIComponent(a.id)}`} className="flex items-center gap-1">
												<Eye className="h-3 w-3" />
												VIEW
											</Link>
										</Button>
										<Button 
											size="sm" 
											variant="outline" 
											onClick={() => printArrest(a)}
											className="border-gray-300 text-gray-700 hover:bg-gray-100 font-mono text-xs px-3"
										>
											<Printer className="h-3 w-3 mr-1" />
											PRINT
										</Button>
										<Button size="sm" variant="destructive" onClick={() => remove(a.id)} className="px-3 font-mono text-xs">
											DEL
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<Dialog open={!!preview} onOpenChange={() => setPreview(undefined)}>
				<DialogContent className="max-w-lg">
					{preview ? <Image src={preview} alt="Preview" width={500} height={300} className="w-full rounded" /> : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}
