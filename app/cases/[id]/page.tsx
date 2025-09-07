"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaseRecord, readStore, writeStore } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Link from "next/link";

export default function CaseDetailPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [record, setRecord] = useState<CaseRecord | null>(null);

	useEffect(() => {
		const all = readStore("cases", [] as CaseRecord[]);
		const found = all.find((c) => encodeURIComponent(c.id) === params.id || c.id === decodeURIComponent(params.id));
		setRecord(found ?? null);
	}, [params.id]);

	function remove() {
		if (!record) return;
		const all = readStore("cases", [] as CaseRecord[]);
		writeStore("cases", all.filter((c) => c.id !== record.id));
		router.push("/cases");
	}

	function printCase() {
		if (!record) return;
		
		// Create a print-friendly version of the case
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;
		
		const printHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Case Report - ${record.id}</title>
				<style>
					body {
						font-family: 'Courier New', monospace;
						margin: 40px;
						line-height: 1.6;
						color: #000;
					}
					.header {
						border-bottom: 3px solid #3b82f6;
						padding-bottom: 20px;
						margin-bottom: 30px;
					}
					.title {
						font-size: 24px;
						font-weight: bold;
						color: #3b82f6;
						margin: 0;
					}
					.subtitle {
						font-size: 12px;
						color: #666;
						margin: 5px 0 0 0;
					}
					.case-info {
						display: grid;
						grid-template-columns: 1fr 1fr;
						gap: 20px;
						margin-bottom: 30px;
					}
					.info-item {
						padding: 10px;
						border: 1px solid #ddd;
						border-radius: 4px;
					}
					.info-label {
						font-weight: bold;
						color: #555;
						font-size: 12px;
						text-transform: uppercase;
						margin-bottom: 5px;
					}
					.info-value {
						font-size: 14px;
					}
					.description {
						margin-top: 30px;
						padding: 20px;
						border: 1px solid #ddd;
						border-radius: 4px;
						background: #f9f9f9;
					}
					.status-badge {
						padding: 4px 8px;
						background: #3b82f6;
						color: white;
						border-radius: 4px;
						font-size: 12px;
						font-weight: bold;
					}
					.footer {
						margin-top: 40px;
						border-top: 1px solid #ddd;
						padding-top: 20px;
						font-size: 10px;
						color: #666;
						text-align: center;
					}
					@media print {
						body { margin: 0; }
						@page { margin: 2cm; }
					}
				</style>
			</head>
			<body>
				<div class="header">
					<h1 class="title">BRANIACS POLICE DRS</h1>
					<p class="subtitle">Digital Records System - Case Report</p>
				</div>
				
				<div class="case-info">
					<div class="info-item">
						<div class="info-label">Case ID</div>
						<div class="info-value">${record.id}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Status</div>
						<div class="info-value"><span class="status-badge">${record.status}</span></div>
					</div>
					<div class="info-item">
						<div class="info-label">Officer</div>
						<div class="info-value">${record.officer}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Crime Type</div>
						<div class="info-value">${record.crimeType}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Suspect</div>
						<div class="info-value">${record.suspect || '—'}</div>
					</div>
					<div class="info-item">
						<div class="info-label">Date & Time</div>
						<div class="info-value">${new Date(record.date).toLocaleString()}</div>
					</div>
				</div>
				
				<div class="description">
					<div class="info-label">Case Description</div>
					<div class="info-value">${record.description || 'No description provided.'}</div>
				</div>
				
				<div class="footer">
					<p>Generated on ${new Date().toLocaleString()} | Braniacs Police DRS</p>
					<p>This document contains confidential information and is for official use only.</p>
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
		return <div className="text-white/70">Case not found.</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-wider text-sky-300">{record.id}</h1>
				<div className="flex gap-2">
					<Button variant="outline" onClick={printCase} className="font-mono">
						<Printer className="h-4 w-4 mr-2" />
						PRINT CASE
					</Button>
					<Button variant="secondary" asChild><Link href={`/cases/edit?id=${encodeURIComponent(record.id)}`}>Edit</Link></Button>
					<Button variant="outline">Transfer Case</Button>
					<Button variant="destructive" onClick={remove}>Delete</Button>
				</div>
			</div>
			<div className="grid md:grid-cols-3 gap-6">
				<div className="md:col-span-2 space-y-4">
					<div className="rounded-2xl border border-white/10 p-4 bg-white/5">
						<div className="grid md:grid-cols-2 gap-4 text-sm">
							<div><div className="text-white/60">Officer</div><div>{record.officer}</div></div>
							<div><div className="text-white/60">Suspect</div><div>{record.suspect ?? "—"}</div></div>
							<div><div className="text-white/60">Crime Type</div><div>{record.crimeType}</div></div>
							<div><div className="text-white/60">Date</div><div>{new Date(record.date).toLocaleString()}</div></div>
							<div><div className="text-white/60">Status</div><div><Badge variant="secondary" className="bg-white/10">{record.status}</Badge></div></div>
							<div><div className="text-white/60">Synced</div><div>{record.synced ? "Yes" : "No"}</div></div>
						</div>
					</div>
					<div className="rounded-2xl border border-white/10 p-4 bg-white/5">
						<div className="text-white/60 text-sm mb-2">Description</div>
						<div className="whitespace-pre-wrap text-sm">{record.description ?? "No description provided."}</div>
					</div>
				</div>
				<div className="space-y-4">
					<div className="rounded-2xl border border-border p-4 bg-card">
						<div className="text-muted-foreground text-sm mb-2">Photo</div>
						{record.photoBase64 ? (
							<Image src={record.photoBase64} alt="Case" width={400} height={300} className="w-full rounded-lg border border-border" />
						) : (
							<div className="text-muted-foreground text-sm">No photo attached.</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}


