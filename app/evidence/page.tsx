"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PasswordConfirmationDialog } from "@/components/ui/password-confirmation-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EvidenceRecord, readStore, writeStore, type CaseRecord, type ArrestRecord } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { FileText, Image as ImageIcon, Video, Archive, Shield, Search, Filter, Eye, Printer, Plus, Download, Calendar, Lock } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRoleProtection } from "@/hooks/useRoleProtection";

export default function EvidencePage() {
	const { user, hasAccess } = useRoleProtection(); // Require authentication
	const { canDelete } = useAuth();
	const [ownerType, setOwnerType] = useState<string>("All");
	const [q, setQ] = useState("");
	const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);
	const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
	const [showDetails, setShowDetails] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
	const [passwordConfirm, setPasswordConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });

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

	function openDeleteConfirm(id: string, name: string) {
		// Use password confirmation for Chief and Admin, regular confirmation for others
		if (user?.role === 'Chief' || user?.role === 'Admin') {
			setPasswordConfirm({ open: true, id, name });
		} else {
			setDeleteConfirm({ open: true, id, name });
		}
	}

	function confirmDelete() {
		const next = evidence.filter((e) => e.id !== deleteConfirm.id);
		setEvidence(next);
		writeStore("evidence", next);
		setDeleteConfirm({ open: false, id: "", name: "" });
	}

	function confirmPasswordDelete() {
		const next = evidence.filter((e) => e.id !== passwordConfirm.id);
		setEvidence(next);
		writeStore("evidence", next);
		setPasswordConfirm({ open: false, id: "", name: "" });
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
					* { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
					body { font-family: 'Arial', sans-serif; margin: 20px; line-height: 1.4; color: #333 !important; -webkit-print-color-adjust: exact !important; }
					.letterhead { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; color: white !important; padding: 30px 40px; margin: -20px -20px 30px -20px; position: relative; -webkit-print-color-adjust: exact !important; }
					.letterhead::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #a855f7, #3b82f6) !important; -webkit-print-color-adjust: exact !important; }
					.agency-logo { width: 60px; height: 60px; background: #a855f7 !important; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; float: left; margin-right: 20px; color: white !important; -webkit-print-color-adjust: exact !important; }
					.agency-details { overflow: hidden; }
					.agency-name { font-size: 28px; font-weight: bold; margin: 0 0 5px 0; color: #a855f7 !important; }
					.agency-subtitle { font-size: 16px; margin: 0 0 8px 0; color: #cbd5e1 !important; }
					.report-type { font-size: 14px; font-weight: bold; color: #fbbf24 !important; margin: 0; }
					.report-meta { position: absolute; top: 30px; right: 40px; text-align: right; font-size: 11px; color: #94a3b8 !important; }
					.evidence-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
					.info-item { padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc !important; -webkit-print-color-adjust: exact !important; }
					.info-label { font-weight: bold; color: #475569 !important; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
					.info-value { color: #1e293b !important; font-size: 14px; font-weight: 500; }
					.preview-section { margin: 30px 0; padding: 20px; border: 2px solid #a855f7; border-radius: 8px; text-align: center; background: #faf5ff !important; -webkit-print-color-adjust: exact !important; }
					.evidence-preview { max-width: 400px; max-height: 500px; border: 2px solid #a855f7; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
					.chain-of-custody { margin: 30px 0; padding: 20px; border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb !important; -webkit-print-color-adjust: exact !important; }
					.custody-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
					.custody-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #d1d5db; }
					.custody-label { font-weight: bold; color: #4b5563 !important; }
					.custody-value { color: #1f2937 !important; }
					.footer-section { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
					.officer-details { background: #f1f5f9 !important; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #3b82f6; -webkit-print-color-adjust: exact !important; }
					.classification-stamp { position: absolute; top: 10px; right: 10px; background: #dc2626 !important; color: white !important; padding: 5px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; transform: rotate(15deg); -webkit-print-color-adjust: exact !important; }
					@media print { 
						* { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
						body { margin: 0; -webkit-print-color-adjust: exact !important; } 
						@page { margin: 1.5cm; size: A4; }
						.letterhead { margin: -20px -20px 20px -20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; -webkit-print-color-adjust: exact !important; }
						.letterhead::after { background: linear-gradient(90deg, #a855f7, #3b82f6) !important; -webkit-print-color-adjust: exact !important; }
						.agency-logo { background: #a855f7 !important; color: white !important; -webkit-print-color-adjust: exact !important; }
						.info-item { background: #f8fafc !important; -webkit-print-color-adjust: exact !important; }
						.preview-section { background: #faf5ff !important; -webkit-print-color-adjust: exact !important; }
						.chain-of-custody { background: #f9fafb !important; -webkit-print-color-adjust: exact !important; }
						.officer-details { background: #f1f5f9 !important; -webkit-print-color-adjust: exact !important; }
						.classification-stamp { background: #dc2626 !important; color: white !important; -webkit-print-color-adjust: exact !important; }
					}
				</style>
			</head>
			<body>
				<div class="classification-stamp">RESTRICTED</div>
				<div class="letterhead">
					<div class="agency-logo">★</div>
					<div class="agency-details">
						<h1 class="agency-name">NIGERIA POLICE FORCE</h1>
						<div class="agency-subtitle">Digital Evidence Management System</div>
						<div class="report-type">EVIDENCE REPORT & CHAIN OF CUSTODY</div>
					</div>
					<div class="report-meta">
						<div><strong>Report ID:</strong> ${evidenceItem.id}</div>
						<div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
						<div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
					</div>
				</div>
				<div class="evidence-info">
					<div class="info-item">
						<div class="info-label">Evidence ID</div>
						<div class="info-value">${evidenceItem.id}</div>
					</div>
					<div class="info-item">
						<div class="info-label">File Name</div>
						<div class="info-value">${evidenceItem.filename}</div>
					</div>
					<div class="info-item">
						<div class="info-label">File Type</div>
						<div class="info-value">${evidenceItem.mimeType}</div>
					</div>
					<div class="info-item">
						<div class="info-label">File Size</div>
						<div class="info-value">${Math.round(evidenceItem.size/1024)} KB</div>
					</div>
					<div class="info-item">
						<div class="info-label">Owner Type</div>
						<div class="info-value">${evidenceItem.ownerType.toUpperCase()}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Owner ID</div>
						<div class="info-value">${evidenceItem.ownerId}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Owner Details</div>
						<div class="info-value">${ownerDetails}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Classification</div>
						<div class="info-value">EVIDENCE</div>
					</div>
				</div>
				${evidenceItem.previewBase64 ? `
				<div class="preview-section">
					<div class="info-label">Evidence Preview</div>
					<img src="${evidenceItem.previewBase64}" alt="Evidence Preview" class="evidence-preview" />
				</div>
				` : ''}
				<div class="chain-of-custody">
					<div class="info-label" style="font-size: 14px; margin-bottom: 15px;">CHAIN OF CUSTODY</div>
					<div class="custody-grid">
						<div class="custody-item">
							<span class="custody-label">Collection Date:</span>
							<span class="custody-value">${new Date().toLocaleDateString()}</span>
						</div>
						<div class="custody-item">
							<span class="custody-label">Collection Time:</span>
							<span class="custody-value">${new Date().toLocaleTimeString()}</span>
						</div>
						<div class="custody-item">
							<span class="custody-label">Storage Location:</span>
							<span class="custody-value">Digital Evidence Vault</span>
						</div>
						<div class="custody-item">
							<span class="custody-label">Access Level:</span>
							<span class="custody-value" style="color: #dc2626; font-weight: bold;">CLASSIFIED</span>
						</div>
					</div>
				</div>
				<div class="footer-section">
					<div class="officer-details">
						<div class="info-label" style="font-size: 12px; margin-bottom: 10px;">REPORTING OFFICER DETAILS</div>
						<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
							<div>
								<div class="custody-label">Officer Name:</div>
								<div class="custody-value">Officer A. Musa</div>
							</div>
							<div>
								<div class="custody-label">Badge Number:</div>
								<div class="custody-value">#NPF-12345</div>
							</div>
							<div>
								<div class="custody-label">Department:</div>
								<div class="custody-value">Evidence Management</div>
							</div>
						</div>
					</div>
					<div style="margin-top: 30px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; color: #64748b; text-align: center;">
						<div style="font-weight: bold; color: #1e293b; margin-bottom: 5px;">NIGERIA POLICE FORCE - DIGITAL RECORDS SYSTEM</div>
						<div>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | Document Classification: RESTRICTED</div>
						<div style="margin-top: 5px; font-style: italic;">This document contains confidential evidence information and is for official use only.</div>
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

	// Show loading screen while checking authentication
	if (!hasAccess) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex items-center gap-3 text-muted-foreground">
					<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
					<span className="font-mono text-sm">LOADING EVIDENCE VAULT...</span>
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
									? 'Full permissions - View, Download, Delete' 
									: 'Limited permissions - View and Download only'
								}
							</div>
						</div>
					</div>
					{!canDelete() && (
						<div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400">
							<Lock className="h-3 w-3" />
							RESTRICTED: Contact Chief or Admin to delete evidence
						</div>
					)}
				</div>
			</div>
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
										{canDelete() && (
											<Button 
												size="sm" 
												variant="destructive" 
												onClick={() => openDeleteConfirm(ev.id, ev.filename)} 
												className="px-2 font-mono text-xs"
											>
												DEL
											</Button>
										)}
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
