"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useButtonLoading } from "@/hooks/use-button-loading";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ArrestRecord, readStore, writeStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Printer, Eye, Lock, Shield } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRoleProtection } from "@/hooks/useRoleProtection";

export default function ArrestsPage() {
	const { user, hasAccess } = useRoleProtection(); // Require authentication
	const { canDelete } = useAuth();
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);
	const [preview, setPreview] = useState<string | undefined>();
	const [status, setStatus] = useState<string>("All");
	const [q, setQ] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
	const { withLoading } = useButtonLoading();

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

	function openDeleteConfirm(id: string, name: string) {
		setDeleteConfirm({ open: true, id, name });
	}

	function confirmDelete() {
		const next = arrests.filter((a) => a.id !== deleteConfirm.id);
		setArrests(next);
		writeStore("arrests", next);
		setDeleteConfirm({ open: false, id: "", name: "" });
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
					body { font-family: 'Arial', sans-serif; margin: 20px; line-height: 1.4; color: #333; }
					.letterhead { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px 40px; margin: -20px -20px 30px -20px; position: relative; }
					.letterhead::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #ef4444, #dc2626); }
					.agency-logo { width: 60px; height: 60px; background: #ef4444; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; float: left; margin-right: 20px; }
					.agency-details { overflow: hidden; }
					.agency-name { font-size: 28px; font-weight: bold; margin: 0 0 5px 0; color: #ef4444; }
					.agency-subtitle { font-size: 16px; margin: 0 0 8px 0; color: #cbd5e1; }
					.report-type { font-size: 14px; font-weight: bold; color: #fbbf24; margin: 0; }
					.report-meta { position: absolute; top: 30px; right: 40px; text-align: right; font-size: 11px; color: #94a3b8; }
					.arrest-section { display: grid; grid-template-columns: 1fr 240px; gap: 30px; margin-bottom: 30px; }
					.suspect-photo { width: 240px; height: 240px; object-fit: cover; border: 3px solid #ef4444; border-radius: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
					.arrest-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
					.info-item { padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
					.info-label { font-weight: bold; color: #475569; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
					.info-value { color: #1e293b; font-size: 14px; font-weight: 500; }
					.custody-details { margin: 30px 0; padding: 20px; border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb; }
					.custody-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 15px; }
					.custody-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #d1d5db; }
					.custody-label { font-weight: bold; color: #4b5563; }
					.custody-value { color: #1f2937; }
					.footer-section { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
					.officer-details { background: #f1f5f9; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #ef4444; }
					.classification-stamp { position: absolute; top: 10px; right: 10px; background: #dc2626; color: white; padding: 5px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; transform: rotate(15deg); }
					@media print { 
						body { margin: 0; } 
						@page { margin: 1.5cm; size: A4; }
						.letterhead { margin: -20px -20px 20px -20px; }
						* { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
						.letterhead { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; color: white !important; }
						.agency-name { color: #ef4444 !important; }
						.agency-subtitle { color: #cbd5e1 !important; }
						.report-type { color: #fbbf24 !important; }
						.classification-stamp { background: #dc2626 !important; color: white !important; }
					}
				</style>
			</head>
			<body>
				<div class="classification-stamp">CUSTODY</div>
				<div class="letterhead">
					<div class="agency-logo">★</div>
					<div class="agency-details">
						<h1 class="agency-name">NIGERIA POLICE FORCE</h1>
						<div class="agency-subtitle">Digital Records System - Custody Management</div>
						<div class="report-type">ARREST REPORT & BOOKING RECORD</div>
					</div>
					<div class="report-meta">
						<div><strong>Report ID:</strong> ${arrest.id}</div>
						<div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
						<div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
					</div>
				</div>
				<div class="arrest-section">
					<div class="arrest-info">
					<div class="info-item">
						<div class="info-label">Arrest ID</div>
						<div class="info-value">${arrest.id}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Suspect Name</div>
						<div class="info-value">${arrest.suspectName}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Crime Classification</div>
						<div class="info-value">${arrest.crime}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Custody Status</div>
						<div class="info-value" style="color: ${arrest.status === 'In Custody' ? '#dc2626' : '#059669'}; font-weight: bold;">${arrest.status.toUpperCase()}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Arrest Date</div>
						<div class="info-value">${new Date(arrest.date).toLocaleDateString()}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Arrest Time</div>
						<div class="info-value">${new Date(arrest.date).toLocaleTimeString()}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Record System</div>
						<div class="info-value">NPF Digital System</div>
					</div>
					<div class="info-item">
						<div class="info-label">Classification</div>
						<div class="info-value">CUSTODY RECORD</div>
					</div>
					</div>
					<div class="photo-section">
						<img src="${arrest.photoBase64}" alt="Suspect Photo" class="suspect-photo" />
					</div>
				</div>
				<div class="custody-details">
					<div class="info-label" style="font-size: 14px; margin-bottom: 15px;">CUSTODY & BOOKING DETAILS</div>
					<div class="custody-grid">
						<div class="custody-item">
							<span class="custody-label">Booking Date:</span>
							<span class="custody-value">${new Date(arrest.date).toLocaleDateString()}</span>
						</div>
						<div class="custody-item">
							<span class="custody-label">Booking Time:</span>
							<span class="custody-value">${new Date(arrest.date).toLocaleTimeString()}</span>
						</div>
						<div class="custody-item">
							<span class="custody-label">Custody Facility:</span>
							<span class="custody-value">NPF Detention Center</span>
						</div>
						<div class="custody-item">
							<span class="custody-label">Security Level:</span>
							<span class="custody-value" style="color: #dc2626; font-weight: bold;">HIGH SECURITY</span>
						</div>
					</div>
				</div>
				<div class="footer-section">
					<div class="officer-details">
						<div class="info-label" style="font-size: 12px; margin-bottom: 10px;">ARRESTING OFFICER DETAILS</div>
						<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
							<div>
								<div class="custody-label">Officer Name:</div>
								<div class="custody-value">${arrest.assignedOfficer}</div>
							</div>
							<div>
								<div class="custody-label">Badge Number:</div>
								<div class="custody-value">#NPF-54321</div>
							</div>
							<div>
								<div class="custody-label">Department:</div>
								<div class="custody-value">Arrest & Custody Unit</div>
							</div>
						</div>
					</div>
					<div style="margin-top: 30px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; color: #64748b; text-align: center;">
						<div style="font-weight: bold; color: #1e293b; margin-bottom: 5px;">NIGERIA POLICE FORCE - DIGITAL RECORDS SYSTEM</div>
						<div>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | Document Classification: CUSTODY RECORD</div>
						<div style="margin-top: 5px; font-style: italic;">This document contains confidential custody information and is for official use only.</div>
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

	// Show loading screen while checking authentication
	if (!hasAccess) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex items-center gap-3 text-muted-foreground">
					<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
					<span className="font-mono text-sm">LOADING ARREST RECORDS...</span>
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
							RESTRICTED: Contact Chief or Admin to delete arrests
						</div>
					)}
				</div>
			</div>
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
										<LoadingButton 
											size="sm" 
											variant="outline" 
											onClick={withLoading(() => printArrest(a), 2000)}
											className="border-gray-300 text-gray-700 hover:bg-gray-100 font-mono text-xs px-3"
											loadingText="PRINTING..."
											showLoadingSpinner={false}
										>
											<Printer className="h-3 w-3 mr-1" />
											PRINT
										</LoadingButton>
										{canDelete() && (
											<LoadingButton 
												size="sm" 
												variant="destructive" 
												onClick={withLoading(() => openDeleteConfirm(a.id, a.suspectName), 800)} 
												className="px-3 font-mono text-xs"
												loadingText="DEL"
												showLoadingSpinner={false}
											>
												DEL
											</LoadingButton>
										)}
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
			
			<ConfirmationDialog
				open={deleteConfirm.open}
				onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
				title="Delete Arrest Record"
				description={`Are you sure you want to delete the arrest record for "${deleteConfirm.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
