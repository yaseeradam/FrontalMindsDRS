"use client";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ensureSeed } from "@/lib/seed";
import { readStore, type CaseRecord, type ArrestRecord, type PatrolRecord } from "@/lib/storage";
import { Printer, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Row = {
	id: string;
	type: "Case" | "Arrest" | "Patrol";
	title: string;
	officer: string;
	date: string;
	status?: string;
};

// Nigerian Legal Codes Data
const nigerianLegalCodes = {
	"Criminal Code": {
		code: "CC",
		description: "Criminal Code Act (Laws of the Federation of Nigeria 2004)",
		sections: [
			{ section: "Section 316", title: "Theft", description: "Any person who steals anything capable of being stolen is guilty of a felony" },
			{ section: "Section 319", title: "Burglary", description: "Breaking into building with intent to commit felony" },
			{ section: "Section 320", title: "Robbery", description: "Stealing with violence or threat of violence" },
			{ section: "Section 351", title: "Assault", description: "Common assault punishable by imprisonment" },
			{ section: "Section 55", title: "Murder", description: "Unlawful killing of human being with malice aforethought" },
			{ section: "Section 221", title: "Rape", description: "Unlawful carnal knowledge without consent" }
		]
	},
	"Penal Code": {
		code: "PC",
		description: "Penal Code Act (Applicable in Northern Nigeria)",
		sections: [
			{ section: "Section 286", title: "Theft", description: "Dishonestly taking moveable property" },
			{ section: "Section 289", title: "House Breaking", description: "Breaking into building to commit offense" },
			{ section: "Section 298", title: "Robbery", description: "Theft with violence or intimidation" },
			{ section: "Section 240", title: "Hurt", description: "Voluntarily causing hurt to another" }
		]
	},
	"EFCC Act": {
		code: "EFCC",
		description: "Economic and Financial Crimes Commission Act 2004",
		sections: [
			{ section: "Section 15", title: "Money Laundering", description: "Prohibition of money laundering activities" },
			{ section: "Section 1", title: "Advance Fee Fraud", description: "Fraudulent schemes involving advance payments" }
		]
	}
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

	// Print function for individual records
	const printRecord = (record: Row) => {
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;
		
		const printHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>${record.type} Report - ${record.id}</title>
				<style>
					body { font-family: 'Courier New', monospace; margin: 40px; line-height: 1.6; }
					.header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
					.title { font-size: 24px; font-weight: bold; color: #3b82f6; }
					.record-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
					.info-item { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
					.info-label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
					@media print { body { margin: 0; } @page { margin: 2cm; } }
				</style>
			</head>
			<body>
				<div class="header">
					<h1 class="title">NIGERIA POLICE FORCE - ${record.type.toUpperCase()} REPORT</h1>
					<p>Digital Records System</p>
				</div>
				<div class="record-info">
					<div class="info-item"><div class="info-label">${record.type} ID</div><div>${record.id}</div></div>
					<div class="info-item"><div class="info-label">Status</div><div>${record.status || 'N/A'}</div></div>
					<div class="info-item"><div class="info-label">Officer</div><div>${record.officer}</div></div>
					<div class="info-item"><div class="info-label">${record.type === 'Case' ? 'Crime Type' : 'Subject'}</div><div>${record.title}</div></div>
					<div class="info-item"><div class="info-label">Date & Time</div><div>${new Date(record.date).toLocaleString()}</div></div>
					<div class="info-item"><div class="info-label">Classification</div><div>${record.type === 'Case' ? 'CRIMINAL' : record.type === 'Arrest' ? 'CUSTODY' : 'PATROL'}</div></div>
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
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">NIGERIAN LAW ACTS DATABASE</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">LEGAL REFERENCES & CASE RECORDS</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
							LAW ACTS ONLINE
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
									<Button 
										size="sm" 
										variant="outline" 
										onClick={() => printRecord(r)}
										className="px-3 font-mono text-xs border-gray-300 hover:bg-gray-100"
									>
										<Printer className="h-3 w-3 mr-1" />
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
			
			<Separator className="my-8" />
			
			{/* Nigerian Legal Codes Section */}
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<BookOpen className="h-6 w-6 text-primary" />
					<h2 className="text-xl font-bold font-mono text-primary">NIGERIAN LEGAL CODES REFERENCE</h2>
				</div>
				
				<div className="grid gap-6 lg:grid-cols-2">
					{Object.entries(nigerianLegalCodes).map(([codeName, codeData]) => (
						<Card key={codeName} className="bg-card border-border">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 font-mono">
									<BookOpen className="h-5 w-5 text-blue-500" />
									{codeName}
									<Badge variant="secondary" className="font-mono text-xs">
										{codeData.code}
									</Badge>
								</CardTitle>
								<p className="text-sm text-muted-foreground font-mono">
									{codeData.description}
								</p>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{codeData.sections.map((section, idx) => (
										<div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/50">
											<div className="flex items-center justify-between mb-2">
												<Badge variant="outline" className="font-mono text-xs">
													{section.section}
												</Badge>
												<span className="font-semibold text-sm">{section.title}</span>
											</div>
											<p className="text-xs text-muted-foreground font-mono">
												{section.description}
											</p>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
