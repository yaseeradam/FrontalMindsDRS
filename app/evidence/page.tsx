"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EvidenceRecord, readStore, writeStore, type CaseRecord, type ArrestRecord } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { FileText, Image as ImageIcon, Video, Archive, Shield, Search, Filter, Eye, Printer, Plus, Download, Calendar } from "lucide-react";

export default function EvidencePage() {
	const [ownerType, setOwnerType] = useState<string>("All");
	const [q, setQ] = useState("");
	const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);
	const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
	const [showDetails, setShowDetails] = useState(false);

	useEffect(() => {
		ensureSeed();
		setEvidence(readStore("evidence", [] as EvidenceRecord[]));
		setCases(readStore("cases", [] as CaseRecord[]));
		setArrests(readStore("arrests", [] as ArrestRecord[]));
	}, []);

	const filtered = useMemo(() => {
		return evidence.filter((e) => {
			if (ownerType !== "All" && e.ownerType !== ownerType) return false;
			if (q && !(e.filename.toLowerCase().includes(q.toLowerCase()) || e.ownerId.toLowerCase().includes(q.toLowerCase()))) return false;
			return true;
		});
	}, [evidence, ownerType, q]);

	function remove(id: string) {
		const next = evidence.filter((e) => e.id !== id);
		setEvidence(next);
		writeStore("evidence", next);
	}

	// View evidence details
	function viewDetails(evidenceItem: EvidenceRecord) {
		setSelectedEvidence(evidenceItem);
		setShowDetails(true);
	}

	// Print evidence report
	function printEvidence(evidenceItem: EvidenceRecord) {
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;
		
		// Get owner details
		let ownerDetails = 'N/A';
		if (evidenceItem.ownerType === 'case') {
			const caseRecord = cases.find(c => c.id === evidenceItem.ownerId);
			ownerDetails = caseRecord ? `${caseRecord.crimeType} - ${caseRecord.officer}` : evidenceItem.ownerId;
		} else if (evidenceItem.ownerType === 'arrest') {
			const arrestRecord = arrests.find(a => a.id === evidenceItem.ownerId);
			ownerDetails = arrestRecord ? `${arrestRecord.crime} - ${arrestRecord.suspectName}` : evidenceItem.ownerId;
		}
		
		const printHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Evidence Report - ${evidenceItem.id}</title>
				<style>
					body { font-family: 'Courier New', monospace; margin: 40px; line-height: 1.6; }
					.header { border-bottom: 3px solid #a855f7; padding-bottom: 20px; margin-bottom: 30px; }
					.title { font-size: 24px; font-weight: bold; color: #a855f7; }
					.evidence-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
					.info-item { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
					.info-label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
					.preview-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; text-align: center; }
					.evidence-preview { max-width: 300px; max-height: 400px; border: 2px solid #a855f7; border-radius: 4px; }
					.chain-of-custody { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9; }
					@media print { body { margin: 0; } @page { margin: 2cm; } }
				</style>
			</head>
			<body>
				<div class="header">
					<h1 class="title">NIGERIA POLICE FORCE - EVIDENCE REPORT</h1>
					<p>Digital Evidence Management System | Chain of Custody</p>
				</div>
				<div class="evidence-info">
					<div class="info-item"><div class="info-label">Evidence ID</div><div>${evidenceItem.id}</div></div>
					<div class="info-item"><div class="info-label">Filename</div><div>${evidenceItem.filename}</div></div>
					<div class="info-item"><div class="info-label">File Type</div><div>${evidenceItem.mimeType}</div></div>
					<div class="info-item"><div class="info-label">File Size</div><div>${Math.round(evidenceItem.size/1024)} KB</div></div>
					<div class="info-item"><div class="info-label">Owner Type</div><div>${evidenceItem.ownerType.toUpperCase()}</div></div>
					<div class="info-item"><div class="info-label">Owner ID</div><div>${evidenceItem.ownerId}</div></div>
					<div class="info-item"><div class="info-label">Owner Details</div><div>${ownerDetails}</div></div>
					<div class="info-item"><div class="info-label">Classification</div><div>EVIDENCE</div></div>
				</div>
				${evidenceItem.previewBase64 ? `
				<div class="preview-section">
					<div class="info-label">Evidence Preview</div>
					<img src="${evidenceItem.previewBase64}" alt="Evidence Preview" class="evidence-preview" />
				</div>
				` : ''}
				<div class="chain-of-custody">
					<div class="info-label">Chain of Custody</div>
					<p><strong>Collection Date:</strong> ${new Date().toLocaleString()}</p>
					<p><strong>Collected By:</strong> Digital Evidence System</p>
					<p><strong>Storage Location:</strong> Digital Evidence Vault</p>
					<p><strong>Access Level:</strong> CLASSIFIED</p>
				</div>
				<div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 10px; color: #666; text-align: center;">
					<p>Generated on ${new Date().toLocaleString()} | Nigeria Police Force DRS</p>
					<p>This document contains confidential evidence and is for official use only.</p>
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
	}

	// Download evidence file
	function downloadEvidence(evidenceItem: EvidenceRecord) {
		try {
			const link = document.createElement('a');
			link.href = evidenceItem.previewBase64 || '#';
			link.download = evidenceItem.filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error('Download failed:', error);
		}
	}

	function getFileIcon(mimeType: string) {
		if (mimeType.startsWith("image/")) return ImageIcon;
		if (mimeType.startsWith("video/")) return Video;
		if (mimeType.includes("zip") || mimeType.includes("rar")) return Archive;
		return FileText;
	}

	function getFileTypeColor(mimeType: string) {
		if (mimeType.startsWith("image/")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
		if (mimeType.startsWith("video/")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
		if (mimeType.includes("zip") || mimeType.includes("rar")) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
		return "bg-gray-500/20 text-gray-400 border-gray-500/30";
	}

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">EVIDENCE VAULT</h1>
						<p className="text-sm text-muted-foreground font-mono mt-1">DIGITAL EVIDENCE MANAGEMENT SYSTEM</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
							<div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
							VAULT SECURED
						</div>
						<div className="flex gap-2">
							<Button className="font-mono bg-purple-500 hover:bg-purple-600" size="sm" asChild>
								<Link href="/evidence/new">
									<Plus className="h-4 w-4 mr-2" />
									ADD EVIDENCE
								</Link>
							</Button>
							<div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5">
								<Shield className="h-3 w-3 text-purple-400" />
								<div className="text-xs font-mono text-purple-400">CLASSIFIED</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="font-semibold text-foreground font-mono">SEARCH FILTERS</h3>
						<p className="text-xs text-muted-foreground font-mono">REFINE EVIDENCE SEARCH</p>
					</div>
					<div className="text-xs text-muted-foreground font-mono">
						RESULTS: {filtered.length.toString().padStart(3, '0')}
					</div>
				</div>
				<div className="grid md:grid-cols-3 gap-4">
					<div>
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">OWNER TYPE</div>
						<Select value={ownerType} onValueChange={setOwnerType}>
							<SelectTrigger className="font-mono"><SelectValue placeholder="All Types" /></SelectTrigger>
							<SelectContent>
								{(["All","case","arrest"]).map((t) => (<SelectItem key={t} value={t} className="font-mono">{t.toUpperCase()}</SelectItem>))}
							</SelectContent>
						</Select>
					</div>
					<div className="md:col-span-2">
						<div className="text-xs text-muted-foreground mb-2 font-mono tracking-wider">SEARCH QUERY</div>
						<Input 
							placeholder="Enter filename, case ID, or keywords..." 
							value={q} 
							onChange={(e) => setQ(e.target.value)}
							className="font-mono"
						/>
					</div>
				</div>
			</div>

			{filtered.length === 0 ? (
				<div className="text-center py-16 bg-card border border-border rounded-xl">
					<div className="text-lg font-medium mb-2 font-mono">NO EVIDENCE FOUND</div>
					<div className="text-sm text-muted-foreground font-mono">ADJUST SEARCH PARAMETERS OR CHECK VAULT ACCESS</div>
					<div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
						<div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
						SEARCH COMPLETED - 0 MATCHES
					</div>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filtered.map((ev, index) => {
						const FileIcon = getFileIcon(ev.mimeType);
						const priorityLevel = ev.ownerType === "case" ? "HIGH" : "MEDIUM";
						const priorityColor = priorityLevel === "HIGH" ? "bg-red-500" : "bg-yellow-500";
						
						return (
							<div 
								key={ev.id} 
								className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20 overflow-hidden"
							>
								{/* Header */}
								<div className="p-4 border-b border-border bg-muted/30">
									<div className="flex items-center justify-between mb-2">
										<div className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 font-mono text-xs px-2 py-1 rounded-md">
											{ev.id.split('-')[0]}
										</div>
										<div className="flex items-center gap-2">
											<div className={`h-2 w-2 rounded-full ${priorityColor} animate-pulse`}></div>
											<span className="text-xs font-mono text-muted-foreground">{priorityLevel}</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<Badge 
											variant="secondary"
											className="bg-purple-500 hover:bg-purple-600 text-white font-medium text-xs"
										>
											EVIDENCE
										</Badge>
										<div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getFileTypeColor(ev.mimeType)}`}>
											{ev.mimeType.split('/')[0].toUpperCase()}
										</div>
									</div>
								</div>
								
								{/* Content */}
								<div className="p-4 space-y-3">
									<div className="flex items-center gap-3">
										<div className="h-16 w-16 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center overflow-hidden">
											{ev.previewBase64 ? (
												<Image 
													src={ev.previewBase64} 
													alt={ev.filename} 
													width={64} 
													height={64} 
													className="h-full w-full object-cover" 
												/>
											) : (
												<FileIcon className="h-8 w-8 text-purple-400" />
											)}
										</div>
										<div className="flex-1">
											<div className="text-xs text-muted-foreground font-mono mb-1">FILENAME</div>
											<div className="font-medium text-sm group-hover:font-semibold transition-all text-purple-700 dark:text-purple-300 truncate">
												{ev.filename}
											</div>
											<div className="text-xs text-muted-foreground font-mono mt-1">
												SIZE: {Math.round(ev.size/1024)} KB
											</div>
										</div>
									</div>
									
									<div className="grid grid-cols-2 gap-3 text-xs">
										<div>
											<div className="text-muted-foreground font-mono mb-1">OWNER TYPE</div>
											<div className="font-mono font-medium">{ev.ownerType.toUpperCase()}</div>
										</div>
										<div>
											<div className="text-muted-foreground font-mono mb-1">OWNER ID</div>
											<div className="font-mono">{ev.ownerId}</div>
										</div>
									</div>
									
									{/* Classification */}
									<div className="pt-2 border-t border-border/50">
										<div className="flex items-center justify-between text-xs">
											<div className="flex items-center gap-2">
												<div className="text-muted-foreground font-mono">CLASSIFICATION:</div>
												<div className="px-2 py-1 rounded font-mono bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
													EVIDENCE
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
									<div className="flex gap-1 flex-wrap">
										<Button 
											size="sm" 
											variant="outline" 
											onClick={() => viewDetails(ev)}
											className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-500 hover:text-white dark:border-purple-600 dark:text-purple-400 font-mono text-xs"
										>
											<Eye className="h-3 w-3 mr-1" />
											VIEW
										</Button>
										<Button 
											size="sm" 
											variant="outline" 
											onClick={() => printEvidence(ev)}
											className="border-gray-300 text-gray-700 hover:bg-gray-100 font-mono text-xs px-2"
										>
											<Printer className="h-3 w-3" />
										</Button>
										<Button 
											size="sm" 
											variant="outline" 
											onClick={() => downloadEvidence(ev)}
											className="border-green-300 text-green-700 hover:bg-green-100 font-mono text-xs px-2"
										>
											<Download className="h-3 w-3" />
										</Button>
										<Button 
											size="sm" 
											variant="destructive" 
											onClick={() => remove(ev.id)} 
											className="px-2 font-mono text-xs"
										>
											DEL
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Evidence Details Modal */}
			<Dialog open={showDetails} onOpenChange={setShowDetails}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
					<DialogHeader>
						<DialogTitle className="font-mono text-purple-700">EVIDENCE DETAILS - {selectedEvidence?.id}</DialogTitle>
					</DialogHeader>
					{selectedEvidence && (
						<div className="space-y-6">
							{/* Basic Information */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<div className="text-xs text-muted-foreground font-mono">EVIDENCE ID</div>
									<div className="font-mono text-sm bg-muted p-2 rounded">{selectedEvidence.id}</div>
								</div>
								<div className="space-y-2">
									<div className="text-xs text-muted-foreground font-mono">FILENAME</div>
									<div className="font-mono text-sm bg-muted p-2 rounded">{selectedEvidence.filename}</div>
								</div>
								<div className="space-y-2">
									<div className="text-xs text-muted-foreground font-mono">FILE TYPE</div>
									<div className="font-mono text-sm bg-muted p-2 rounded">{selectedEvidence.mimeType}</div>
								</div>
								<div className="space-y-2">
									<div className="text-xs text-muted-foreground font-mono">FILE SIZE</div>
									<div className="font-mono text-sm bg-muted p-2 rounded">{Math.round(selectedEvidence.size/1024)} KB</div>
								</div>
								<div className="space-y-2">
									<div className="text-xs text-muted-foreground font-mono">OWNER TYPE</div>
									<div className="font-mono text-sm bg-muted p-2 rounded">{selectedEvidence.ownerType.toUpperCase()}</div>
								</div>
								<div className="space-y-2">
									<div className="text-xs text-muted-foreground font-mono">OWNER ID</div>
									<div className="font-mono text-sm bg-muted p-2 rounded">{selectedEvidence.ownerId}</div>
								</div>
							</div>

							{/* Evidence Preview */}
							{selectedEvidence.previewBase64 && (
								<div className="space-y-2">
									<div className="text-xs text-muted-foreground font-mono">EVIDENCE PREVIEW</div>
									<div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-950/20">
										<Image 
											src={selectedEvidence.previewBase64} 
											alt={selectedEvidence.filename} 
											width={400} 
											height={300} 
											className="max-w-full h-auto rounded border-2 border-purple-300" 
										/>
									</div>
								</div>
							)}

							{/* Chain of Custody */}
							<div className="space-y-2">
								<div className="text-xs text-muted-foreground font-mono">CHAIN OF CUSTODY</div>
								<div className="bg-muted p-4 rounded border">
									<div className="space-y-2 text-sm font-mono">
										<div className="flex justify-between">
											<span className="text-muted-foreground">COLLECTION DATE:</span>
											<span>{new Date().toLocaleString()}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">COLLECTED BY:</span>
											<span>Digital Evidence System</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">STORAGE LOCATION:</span>
											<span>Digital Evidence Vault</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">ACCESS LEVEL:</span>
											<Badge variant="destructive" className="bg-red-500">CLASSIFIED</Badge>
										</div>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2 pt-4 border-t">
								<Button 
									onClick={() => printEvidence(selectedEvidence)} 
									variant="outline" 
									className="flex-1 font-mono"
								>
									<Printer className="h-4 w-4 mr-2" />
									PRINT REPORT
								</Button>
								<Button 
									onClick={() => downloadEvidence(selectedEvidence)} 
									variant="outline" 
									className="flex-1 font-mono border-green-300 text-green-700 hover:bg-green-500 hover:text-white"
								>
									<Download className="h-4 w-4 mr-2" />
									DOWNLOAD
								</Button>
								<Button 
									onClick={() => setShowDetails(false)} 
									variant="secondary" 
									className="font-mono"
								>
									CLOSE
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
