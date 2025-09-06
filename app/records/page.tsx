"use client";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ensureSeed } from "@/lib/seed";
import { readStore, type CaseRecord, type ArrestRecord, type PatrolRecord } from "@/lib/storage";

type Row = {
	id: string;
	type: "Case" | "Arrest" | "Patrol";
	title: string;
	officer: string;
	date: string;
	status?: string;
};

export default function RecordsPage() {
	const [type, setType] = useState<string>("All");
	const [status, setStatus] = useState<string>("All");
	const [q, setQ] = useState("");
	const [rows, setRows] = useState<Row[]>([]);

	useEffect(() => {
		ensureSeed();
		const cases = readStore("cases", [] as CaseRecord[]);
		const arrests = readStore("arrests", [] as ArrestRecord[]);
		const patrols = readStore("patrols", [] as PatrolRecord[]);
		const combined: Row[] = [
			...cases.map((c) => ({ id: c.id, type: "Case" as const, title: `${c.crimeType}${c.suspect ? ` - ${c.suspect}` : ""}`, officer: c.officer, date: c.date, status: c.status })),
			...arrests.map((a) => ({ id: a.id, type: "Arrest" as const, title: `${a.crime} - ${a.suspectName}`, officer: a.assignedOfficer, date: a.date, status: a.status })),
			...patrols.map((p) => ({ id: p.id, type: "Patrol" as const, title: `${p.location}`, officer: p.officer, date: `${p.date} ${p.time}`, status: "—" })),
		];
		setRows(combined);
	}, []);

	const filtered = useMemo(() => {
		return rows.filter((r) => {
			if (type !== "All" && r.type !== (type as "Case" | "Arrest" | "Patrol")) return false;
			if (status !== "All" && r.status && r.status !== status) return false;
			if (q && !(r.title.toLowerCase().includes(q.toLowerCase()) || r.officer.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()))) return false;
			return true;
		});
	}, [rows, type, status, q]);

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">RECORDS DATABASE</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">DIGITAL EVIDENCE MANAGEMENT SYSTEM</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
							DATABASE ONLINE
						</div>
						<div className="flex gap-2">
							<Button className="font-mono" asChild><Link href="/cases/new">NEW CASE</Link></Button>
							<Button variant="outline" className="font-mono border-red-500/30 hover:bg-red-500/10" asChild><Link href="/arrests/new">ARREST</Link></Button>
							<Button variant="outline" className="font-mono border-green-500/30 hover:bg-green-500/10" asChild><Link href="/patrols/new">PATROL</Link></Button>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="font-semibold text-foreground font-mono">SEARCH FILTERS</h3>
						<p className="text-xs text-muted-foreground font-mono">REFINE DATABASE QUERY</p>
					</div>
					<div className="text-xs text-muted-foreground font-mono">
						RESULTS: {filtered.length.toString().padStart(3, '0')}
					</div>
				</div>
				<div className="grid md:grid-cols-4 gap-4">
					<div>
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">RECORD TYPE</div>
						<Select value={type} onValueChange={setType}>
							<SelectTrigger className="font-mono"><SelectValue placeholder="All Types" /></SelectTrigger>
							<SelectContent>
								{(["All","Case","Arrest","Patrol"]).map((t) => (<SelectItem key={t} value={t} className="font-mono">{t}</SelectItem>))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">STATUS</div>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="font-mono"><SelectValue placeholder="All Status" /></SelectTrigger>
							<SelectContent>
								{(["All","Open","Under Investigation","Transferred","Closed","In Custody","Released"]).map((s) => (<SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>))}
							</SelectContent>
						</Select>
					</div>
					<div className="md:col-span-2">
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">SEARCH QUERY</div>
						<Input 
							placeholder="Enter ID, officer name, or keywords..." 
							value={q} 
							onChange={(e) => setQ(e.target.value)}
							className="font-mono"
						/>
					</div>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filtered.map((r, index) => {
					const cardColorClass = 
						r.type === "Case" ? "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20" :
						r.type === "Arrest" ? "border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20" :
						"border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20";
					
					const priorityLevel = 
						r.status === "Open" || r.status === "Under Investigation" ? "HIGH" :
						r.status === "In Custody" ? "CRITICAL" :
						"NORMAL";
					
					const priorityColor = 
						priorityLevel === "CRITICAL" ? "bg-red-500" :
						priorityLevel === "HIGH" ? "bg-yellow-500" :
						"bg-green-500";
					
					return (
						<div 
							key={`${r.type}-${r.id}`} 
							className={`bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group ${cardColorClass} overflow-hidden`}
						>
							{/* Header */}
							<div className="p-4 border-b border-border bg-muted/30">
								<div className="flex items-center justify-between mb-2">
									<div className={`font-mono text-xs px-2 py-1 rounded-md ${
										r.type === "Case" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
										r.type === "Arrest" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
										"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
									}`}>
										{r.id}
									</div>
									<div className="flex items-center gap-2">
										<div className={`h-2 w-2 rounded-full ${priorityColor} animate-pulse`}></div>
										<span className="text-xs font-mono text-muted-foreground">{priorityLevel}</span>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<Badge 
										variant={r.type === "Case" ? "default" : r.type === "Arrest" ? "destructive" : "secondary"}
										className={`font-medium text-xs ${
											r.type === "Case" ? "bg-blue-500 hover:bg-blue-600" :
											r.type === "Arrest" ? "bg-red-500 hover:bg-red-600" :
											"bg-green-500 hover:bg-green-600 text-white"
										}`}
									>
										{r.type.toUpperCase()}
									</Badge>
									<div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
										r.status === "Open" ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700" :
										r.status === "Under Investigation" ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700" :
										r.status === "Closed" ? "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700" :
										r.status === "In Custody" ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700" :
										r.status === "Released" ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700" :
										"bg-muted text-muted-foreground border-border"
									}`}>
										{r.status}
									</div>
								</div>
							</div>
							
							{/* Content */}
							<div className="p-4 space-y-3">
								<div>
									<div className="text-xs text-muted-foreground font-mono mb-1">INCIDENT/SUBJECT</div>
									<div className={`font-medium text-sm group-hover:font-semibold transition-all ${
										r.type === "Case" ? "text-blue-700 dark:text-blue-300" :
										r.type === "Arrest" ? "text-red-700 dark:text-red-300" :
										"text-green-700 dark:text-green-300"
									}`}>
										{r.title}
									</div>
								</div>
								
								<div className="grid grid-cols-2 gap-3 text-xs">
									<div>
										<div className="text-muted-foreground font-mono mb-1">OFFICER</div>
										<div className="font-mono font-medium">{r.officer}</div>
									</div>
									<div>
										<div className="text-muted-foreground font-mono mb-1">DATE/TIME</div>
										<div className="font-mono">{new Date(r.date).toLocaleDateString()}</div>
										<div className="font-mono text-xs text-muted-foreground">{new Date(r.date).toLocaleTimeString()}</div>
									</div>
								</div>
								
								{/* Classification */}
								<div className="pt-2 border-t border-border/50">
									<div className="flex items-center justify-between text-xs">
										<div className="flex items-center gap-2">
											<div className="text-muted-foreground font-mono">CLASSIFICATION:</div>
											<div className={`px-2 py-1 rounded font-mono ${
												r.type === "Case" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
												r.type === "Arrest" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
												"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
											}`}>
												{r.type === "Case" ? "CRIMINAL" : r.type === "Arrest" ? "CUSTODY" : "PATROL"}
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
									{r.type === "Case" && (
										<Button size="sm" variant="outline" asChild className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-500 hover:text-white dark:border-blue-600 dark:text-blue-400 font-mono text-xs">
											<Link href={`/cases/${encodeURIComponent(r.id)}`}>VIEW CASE</Link>
										</Button>
									)}
									{r.type === "Arrest" && (
										<Button size="sm" variant="outline" asChild className="flex-1 border-red-300 text-red-700 hover:bg-red-500 hover:text-white dark:border-red-600 dark:text-red-400 font-mono text-xs">
											<Link href={`/arrests/edit?id=${encodeURIComponent(r.id)}`}>EDIT RECORD</Link>
										</Button>
									)}
									{r.type === "Patrol" && (
										<Button size="sm" variant="outline" asChild className="flex-1 border-green-300 text-green-700 hover:bg-green-500 hover:text-white dark:border-green-600 dark:text-green-400 font-mono text-xs">
											<Link href={`/patrols/new`}>NEW PATROL</Link>
										</Button>
									)}
									<Button size="sm" variant="ghost" className="px-3 text-muted-foreground hover:text-foreground font-mono text-xs">
										PRINT
									</Button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
			
			{filtered.length === 0 && (
				<div className="text-center py-16 bg-card border border-border rounded-xl">
					<div className="text-lg font-medium mb-2 font-mono">NO RECORDS FOUND</div>
					<div className="text-sm text-muted-foreground font-mono">ADJUST SEARCH PARAMETERS OR CHECK DATABASE CONNECTION</div>
					<div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
						SEARCH COMPLETED - 0 MATCHES
					</div>
				</div>
			)}
		</div>
	);
}
