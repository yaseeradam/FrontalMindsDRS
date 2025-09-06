"use client";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EvidenceRecord, readStore, writeStore, type CaseRecord, type ArrestRecord } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { FileText, Image as ImageIcon, Video, Archive, Shield, Search, Filter } from "lucide-react";

export default function EvidencePage() {
	const [ownerType, setOwnerType] = useState<string>("All");
	const [q, setQ] = useState("");
	const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);

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
						<div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1.5">
							<Shield className="h-3 w-3 text-purple-400" />
							<div className="text-xs font-mono text-purple-400">CLASSIFIED</div>
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
									<div className="flex gap-2">
										<Button size="sm" variant="outline" className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-500 hover:text-white dark:border-purple-600 dark:text-purple-400 font-mono text-xs">
											VIEW DETAILS
										</Button>
										<Button size="sm" variant="destructive" onClick={() => remove(ev.id)} className="px-3 font-mono text-xs">
											DELETE
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
