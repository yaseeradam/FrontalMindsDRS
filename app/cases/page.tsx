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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function CasesPage() {
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "category">("grid");
	const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
	
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

	function openDeleteConfirm(id: string, name: string) {
		setDeleteConfirm({ open: true, id, name });
	}

	async function confirmDelete() {
		if (deletingId) return;
		
		setDeletingId(deleteConfirm.id);
		try {
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const next = cases.filter((c) => c.id !== deleteConfirm.id);
			setCases(next);
			writeStore("cases", next);
		} catch (error) {
			// Handle error if needed
		} finally {
			setDeletingId(null);
			setDeleteConfirm({ open: false, id: "", name: "" });
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
					* { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
					body { font-family: 'Arial', sans-serif; margin: 20px; line-height: 1.4; color: #333 !important; -webkit-print-color-adjust: exact !important; }
					.letterhead { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; color: white !important; padding: 30px 40px; margin: -20px -20px 30px -20px; position: relative; -webkit-print-color-adjust: exact !important; }
					.letterhead::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important; -webkit-print-color-adjust: exact !important; }
					.agency-logo { width: 60px; height: 60px; background: #3b82f6 !important; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; float: left; margin-right: 20px; color: white !important; -webkit-print-color-adjust: exact !important; }
					.agency-details { overflow: hidden; }
					.agency-name { font-size: 28px; font-weight: bold; margin: 0 0 5px 0; color: #3b82f6 !important; }
					.agency-subtitle { font-size: 16px; margin: 0 0 8px 0; color: #cbd5e1 !important; }
					.report-type { font-size: 14px; font-weight: bold; color: #fbbf24 !important; margin: 0; }
					.report-meta { position: absolute; top: 30px; right: 40px; text-align: right; font-size: 11px; color: #94a3b8 !important; }
					.case-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
					.info-item { padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc !important; -webkit-print-color-adjust: exact !important; }
					.info-label { font-weight: bold; color: #475569 !important; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
					.info-value { color: #1e293b !important; font-size: 14px; font-weight: 500; }
					.description-section { margin: 30px 0; padding: 20px; border: 2px solid #3b82f6; border-radius: 8px; background: #eff6ff !important; -webkit-print-color-adjust: exact !important; }
					.footer-section { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
					.officer-details { background: #f1f5f9 !important; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #3b82f6; -webkit-print-color-adjust: exact !important; }
					.classification-stamp { position: absolute; top: 10px; right: 10px; background: #059669 !important; color: white !important; padding: 5px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; transform: rotate(15deg); -webkit-print-color-adjust: exact !important; }
					@media print { 
						* { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
						body { margin: 0; -webkit-print-color-adjust: exact !important; } 
						@page { margin: 1.5cm; size: A4; }
						.letterhead { margin: -20px -20px 20px -20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; -webkit-print-color-adjust: exact !important; }
						.letterhead::after { background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important; -webkit-print-color-adjust: exact !important; }
						.agency-logo { background: #3b82f6 !important; color: white !important; -webkit-print-color-adjust: exact !important; }
						.info-item { background: #f8fafc !important; -webkit-print-color-adjust: exact !important; }
						.description-section { background: #eff6ff !important; -webkit-print-color-adjust: exact !important; }
						.officer-details { background: #f1f5f9 !important; -webkit-print-color-adjust: exact !important; }
						.classification-stamp { background: #059669 !important; color: white !important; -webkit-print-color-adjust: exact !important; }
						.footer-info { background: #f8fafc !important; -webkit-print-color-adjust: exact !important; }
					}
				</style>
			</head>
			<body>
				<div class="classification-stamp">CASE FILE</div>
				<div class="letterhead">
					<div class="agency-logo">★</div>
					<div class="agency-details">
						<h1 class="agency-name">NIGERIA POLICE FORCE</h1>
						<div class="agency-subtitle">Digital Records System - Criminal Investigation</div>
						<div class="report-type">CASE REPORT & INVESTIGATION RECORD</div>
					</div>
					<div class="report-meta">
						<div><strong>Report ID:</strong> ${caseRecord.id}</div>
						<div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
						<div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
					</div>
				</div>
				<div class="case-info">
					<div class="info-item">
						<div class="info-label">Case ID</div>
						<div class="info-value">${caseRecord.id}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Case Status</div>
						<div class="info-value" style="color: ${caseRecord.status === 'Open' ? '#059669' : caseRecord.status === 'Closed' ? '#dc2626' : '#d97706'}; font-weight: bold;">${caseRecord.status.toUpperCase()}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Crime Classification</div>
						<div class="info-value">${caseRecord.crimeType}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Suspect Information</div>
						<div class="info-value">${caseRecord.suspect || 'Unknown/Under Investigation'}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Incident Date</div>
						<div class="info-value">${new Date(caseRecord.date).toLocaleDateString()}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Incident Time</div>
						<div class="info-value">${new Date(caseRecord.date).toLocaleTimeString()}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Record System</div>
						<div class="info-value">NPF Digital System</div>
					</div>
					<div class="info-item">
						<div class="info-label">Classification</div>
						<div class="info-value">CRIMINAL CASE</div>
					</div>
				</div>
				${caseRecord.description ? `
				<div class="description-section">
					<div class="info-label" style="font-size: 14px; margin-bottom: 15px;">CASE DESCRIPTION & NARRATIVE</div>
					<p style="line-height: 1.6; color: #1f2937 !important;">${caseRecord.description}</p>
				</div>
				` : ''}
				<div class="footer-section">
					<div class="officer-details">
						<div class="info-label" style="font-size: 12px; margin-bottom: 10px;">INVESTIGATING OFFICER DETAILS</div>
						<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
							<div>
								<div class="info-label">Officer Name:</div>
								<div class="info-value">${caseRecord.officer}</div>
							</div>
							<div>
								<div class="info-label">Badge Number:</div>
								<div class="info-value">#NPF-67890</div>
							</div>
							<div>
								<div class="info-label">Department:</div>
								<div class="info-value">Criminal Investigation Unit</div>
							</div>
						</div>
					</div>
					<div class="footer-info" style="margin-top: 30px; padding: 15px; background: #f8fafc !important; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; color: #64748b !important; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
						<div style="font-weight: bold; color: #1e293b !important; margin-bottom: 5px;">NIGERIA POLICE FORCE - DIGITAL RECORDS SYSTEM</div>
						<div style="color: #64748b !important;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | Document Classification: CASE FILE</div>
						<div style="margin-top: 5px; font-style: italic; color: #64748b !important;">This document contains confidential case information and is for official use only.</div>
					</div>
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
		<>
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
											<CaseCard key={c.id} case={c} index={index} onRemove={(id, name) => openDeleteConfirm(id, name)} isDeleting={deletingId === c.id} onPrint={printCase} />
										))}
									</div>
								</div>
							))
						}
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredCases.map((c, index) => (
						<CaseCard 
							key={c.id} 
							case={c} 
							index={index} 
							onRemove={(id, name) => openDeleteConfirm(id, name)} 
							isDeleting={deletingId === c.id} 
							onPrint={printCase} 
						/>
					))}
					</div>
				)}
			</div>

			<ConfirmationDialog
				open={deleteConfirm.open}
				onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
				title="Delete Case"
				description={`Are you sure you want to delete the case for ${deleteConfirm.name}? This action cannot be undone.`}
				confirmText="Delete"
				variant="destructive"
				onConfirm={confirmDelete}
			/>
		</>
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
	onRemove: (id: string, name: string) => void; 
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
						onClick={() => onRemove(c.id, c.crimeType)}
						disabled={isDeleting}
						className="px-3 font-mono text-xs"
					>
						{isDeleting ? (
							<>
								<Spinner className="mr-1 h-3 w-3" />
								DEL
							</>
						) : (
							"DEL"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
