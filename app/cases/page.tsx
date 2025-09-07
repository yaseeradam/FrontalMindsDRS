"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CaseRecord, readStore, writeStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Search, FolderOpen, Printer } from "lucide-react";

export default function CasesPage() {
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "category">("category");
	
	useEffect(() => {
		ensureSeed();
		setCases(readStore("cases", [] as CaseRecord[]));
	}, []);
	
	// Get unique crime categories
	const crimeCategories = Array.from(new Set(cases.map(c => c.crimeType))).sort();
	
	// Filter cases based on search and category
	const filteredCases = cases.filter(c => {
		const matchesSearch = searchTerm === "" || 
			c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			c.crimeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
			c.officer.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(c.suspect && c.suspect.toLowerCase().includes(searchTerm.toLowerCase()));
		
		const matchesCategory = selectedCategory === "all" || c.crimeType === selectedCategory;
		
		return matchesSearch && matchesCategory;
	});
	
	// Group cases by crime type
	const groupedCases = crimeCategories.reduce((groups, category) => {
		groups[category] = filteredCases.filter(c => c.crimeType === category);
		return groups;
	}, {} as Record<string, CaseRecord[]>);

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

	// Print function for case records
	const printCase = (caseRecord: CaseRecord) => {
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;
		
		const printHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Case Report - ${caseRecord.id}</title>
				<style>
					body { font-family: 'Courier New', monospace; margin: 40px; line-height: 1.6; }
					.header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
					.title { font-size: 24px; font-weight: bold; color: #3b82f6; }
					.case-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
					.info-item { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
					.info-label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
					.description-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
					@media print { body { margin: 0; } @page { margin: 2cm; } }
				</style>
			</head>
			<body>
				<div class="header">
					<h1 class="title">NIGERIA POLICE FORCE - CASE REPORT</h1>
					<p>Digital Records System | Criminal Investigation</p>
				</div>
				<div class="case-info">
					<div class="info-item"><div class="info-label">Case ID</div><div>${caseRecord.id}</div></div>
					<div class="info-item"><div class="info-label">Status</div><div>${caseRecord.status}</div></div>
					<div class="info-item"><div class="info-label">Crime Type</div><div>${caseRecord.crimeType}</div></div>
					<div class="info-item"><div class="info-label">Suspect</div><div>${caseRecord.suspect || 'N/A'}</div></div>
					<div class="info-item"><div class="info-label">Investigating Officer</div><div>${caseRecord.officer}</div></div>
					<div class="info-item"><div class="info-label">Date & Time</div><div>${new Date(caseRecord.date).toLocaleString()}</div></div>
					<div class="info-item"><div class="info-label">Case Record</div><div>NPF Digital System</div></div>
					<div class="info-item"><div class="info-label">Classification</div><div>CRIMINAL</div></div>
				</div>
				${caseRecord.description ? `
				<div class="description-section">
					<div class="info-label">Case Description</div>
					<p>${caseRecord.description}</p>
				</div>
				` : ''}
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
				<div className="flex items-center justify-between mb-4">
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
				
				{/* Enhanced Controls */}
				<div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border">
					<div className="flex items-center gap-2">
						<Search className="h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search cases..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-64 font-mono"
						/>
					</div>
					
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className="w-48 font-mono">
								<SelectValue placeholder="Filter by crime type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all" className="font-mono">ALL CATEGORIES</SelectItem>
								{crimeCategories.map(category => (
									<SelectItem key={category} value={category} className="font-mono">
										{category.toUpperCase()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					
					<div className="flex items-center gap-2">
						<Button
							variant={viewMode === "category" ? "default" : "outline"}
							onClick={() => setViewMode("category")}
							size="sm"
							className="font-mono"
						>
							<FolderOpen className="h-4 w-4 mr-2" />
							BY CATEGORY
						</Button>
						<Button
							variant={viewMode === "grid" ? "default" : "outline"}
							onClick={() => setViewMode("grid")}
							size="sm"
							className="font-mono"
						>
							GRID VIEW
						</Button>
					</div>
					
					<div className="text-xs text-muted-foreground font-mono ml-auto">
						{filteredCases.length} of {cases.length} cases
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
			) : filteredCases.length === 0 ? (
				<div className="text-center py-16 bg-card border border-border rounded-xl">
					<div className="text-lg font-medium mb-2 font-mono">NO MATCHING CASES FOUND</div>
					<div className="text-sm text-muted-foreground font-mono">Try adjusting your search or filter criteria</div>
				</div>
			) : viewMode === "category" ? (
				<div className="space-y-8">
					{Object.entries(groupedCases)
						.filter(([_, cases]) => cases.length > 0)
						.map(([category, categoryCases]) => (
							<div key={category} className="space-y-4">
								<div className="flex items-center gap-3">
									<div className="h-8 w-1 bg-primary rounded"></div>
									<h2 className="text-xl font-bold font-mono text-primary">
										{category.toUpperCase()} CASES
									</h2>
									<Badge variant="secondary" className="font-mono">
										{categoryCases.length} case{categoryCases.length !== 1 ? 's' : ''}
									</Badge>
								</div>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{categoryCases.map((c, index) => (
						<CaseCard key={c.id} case={c} index={index} onRemove={remove} isDeleting={deletingId === c.id} onPrint={printCase} />
					))}
								</div>
							</div>
						))
					}
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredCases.map((c, index) => (
					<CaseCard key={c.id} case={c} index={index} onRemove={remove} isDeleting={deletingId === c.id} onPrint={printCase} />
				))}
				</div>
			)}
		</div>
	);
}

// CaseCard component for reusability
function CaseCard({ 
	case: c, 
	index, 
	onRemove, 
	isDeleting,
	onPrint 
}: { 
	case: CaseRecord; 
	index: number; 
	onRemove: (id: string) => void; 
	isDeleting: boolean;
	onPrint: (caseRecord: CaseRecord) => void; 
}) {
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
						variant="outline" 
						onClick={() => onPrint(c)}
						className="border-gray-300 text-gray-700 hover:bg-gray-100 font-mono text-xs px-3"
					>
						<Printer className="h-3 w-3 mr-1" />
						PRINT
					</Button>
					<Button 
						size="sm" 
						variant="destructive" 
						onClick={() => onRemove(c.id)}
						disabled={isDeleting}
						className="px-3 font-mono text-xs"
					>
						{isDeleting && <Spinner size="sm" />}
						{isDeleting ? "..." : "DEL"}
					</Button>
				</div>
			</div>
		</div>
	);
}
