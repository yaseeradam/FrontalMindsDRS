"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrestRecord, readStore } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ArrestEditPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [record, setRecord] = useState<ArrestRecord | null>(null);
	const arrestId = searchParams.get("id");

	useEffect(() => {
		if (arrestId) {
			const all = readStore("arrests", [] as ArrestRecord[]);
			const found = all.find((a) => 
				encodeURIComponent(a.id) === arrestId || 
				a.id === decodeURIComponent(arrestId)
			);
			setRecord(found ?? null);
		}
	}, [arrestId]);

	function printArrest() {
		if (!record) return;
		
		// Create a print-friendly version of the arrest
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;
		
		const printHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Arrest Report - ${record.id}</title>
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
						<div><strong>Report ID:</strong> ${record.id}</div>
						<div><strong>Generated:</strong> ${new Date().toLocaleDateString()}</div>
						<div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
					</div>
				</div>
				<div class="arrest-section">
					<div class="arrest-info">
						<div class="info-item">
							<div class="info-label">Arrest ID</div>
							<div class="info-value">${record.id}</div>
						</div>
						<div class="info-item">
							<div class="info-label">Suspect Name</div>
							<div class="info-value">${record.suspectName}</div>
						</div>
						<div class="info-item">
							<div class="info-label">Crime Classification</div>
							<div class="info-value">${record.crime}</div>
						</div>
						<div class="info-item">
							<div class="info-label">Custody Status</div>
							<div class="info-value" style="color: ${record.status === 'In Custody' ? '#dc2626' : '#059669'}; font-weight: bold;">${record.status.toUpperCase()}</div>
						</div>
						<div class="info-item">
							<div class="info-label">Arrest Date</div>
							<div class="info-value">${new Date(record.date).toLocaleDateString()}</div>
						</div>
						<div class="info-item">
							<div class="info-label">Arrest Time</div>
							<div class="info-value">${new Date(record.date).toLocaleTimeString()}</div>
						</div>
					</div>
					<div class="photo-section">
						<img src="${record.photoBase64}" alt="Suspect Photo" class="suspect-photo" />
					</div>
				</div>
				<div class="custody-details">
					<div class="info-label" style="font-size: 14px; margin-bottom: 15px;">CUSTODY & BOOKING DETAILS</div>
					<div class="custody-grid">
						<div class="custody-item">
							<span class="custody-label">Booking Date:</span>
							<span class="custody-value">${new Date(record.date).toLocaleDateString()}</span>
						</div>
						<div class="custody-item">
							<span class="custody-label">Booking Time:</span>
							<span class="custody-value">${new Date(record.date).toLocaleTimeString()}</span>
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
								<div class="custody-value">${record.assignedOfficer}</div>
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
		
		// Auto-print after a short delay to allow content to load
		setTimeout(() => {
			printWindow.print();
		}, 500);
	}

	if (!record) {
		return (
			<div className="space-y-6">
				<div className="bg-card border border-border rounded-xl p-6">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="sm" asChild className="font-mono">
							<Link href="/arrests">
								<ArrowLeft className="h-4 w-4 mr-2" />
								BACK TO ARRESTS
							</Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">ARREST RECORD</h1>
							<p className="text-sm text-muted-foreground font-mono mt-1">CUSTODY & BOOKING DETAILS</p>
						</div>
					</div>
				</div>
				<div className="bg-card border border-border rounded-xl p-8 text-center">
					<div className="text-lg font-medium mb-2 font-mono text-muted-foreground">ARREST RECORD NOT FOUND</div>
					<div className="text-sm text-muted-foreground font-mono">The requested arrest record could not be located in the system.</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="outline" size="sm" asChild className="font-mono">
							<Link href="/arrests">
								<ArrowLeft className="h-4 w-4 mr-2" />
								BACK TO ARRESTS
							</Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">{record.id}</h1>
							<p className="text-sm text-muted-foreground font-mono mt-1">ARREST RECORD DETAILS</p>
						</div>
					</div>
					<Button variant="outline" onClick={printArrest} className="font-mono">
						<Printer className="h-4 w-4 mr-2" />
						PRINT RECORD
					</Button>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				<div className="md:col-span-2 space-y-4">
					<div className="rounded-2xl border border-border p-4 bg-card">
						<div className="grid md:grid-cols-2 gap-4 text-sm">
							<div>
								<div className="text-muted-foreground font-mono text-xs mb-1">SUSPECT NAME</div>
								<div className="font-medium text-red-700 dark:text-red-300">{record.suspectName}</div>
							</div>
							<div>
								<div className="text-muted-foreground font-mono text-xs mb-1">CRIME</div>
								<div>{record.crime}</div>
							</div>
							<div>
								<div className="text-muted-foreground font-mono text-xs mb-1">ARRESTING OFFICER</div>
								<div>{record.assignedOfficer}</div>
							</div>
							<div>
								<div className="text-muted-foreground font-mono text-xs mb-1">ARREST DATE</div>
								<div>{new Date(record.date).toLocaleString()}</div>
							</div>
							<div>
								<div className="text-muted-foreground font-mono text-xs mb-1">STATUS</div>
								<div>
									<Badge 
										variant="secondary" 
										className={
											record.status === "In Custody" ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400" :
											record.status === "Released" ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400" :
											record.status === "Transferred" ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400" :
											"bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400"
										}
									>
										{record.status}
									</Badge>
								</div>
							</div>
							<div>
								<div className="text-muted-foreground font-mono text-xs mb-1">SYNCED</div>
								<div>{record.synced ? "Yes" : "No"}</div>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-border p-4 bg-card">
						<div className="text-muted-foreground font-mono text-xs mb-2">CLASSIFICATION</div>
						<div className="flex items-center gap-2">
							<Badge variant="destructive" className="bg-red-500 hover:bg-red-600 font-medium">
								CUSTODY RECORD
							</Badge>
							<span className="text-xs text-muted-foreground font-mono">
								HIGH SECURITY - RESTRICTED ACCESS
							</span>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="rounded-2xl border border-border p-4 bg-card">
						<div className="text-muted-foreground font-mono text-xs mb-2">SUSPECT PHOTO</div>
						{record.photoBase64 ? (
							<Image 
								src={record.photoBase64} 
								alt="Suspect" 
								width={400} 
								height={300} 
								className="w-full rounded-lg border border-red-200 dark:border-red-800" 
							/>
						) : (
							<div className="text-muted-foreground text-sm">No photo available.</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
