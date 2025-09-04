"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { EvidenceRecord, readStore, toBase64, writeStore, CaseRecord, ArrestRecord } from "@/lib/storage";
import { toast } from "sonner";

export default function EvidencePage() {
	const [ownerType, setOwnerType] = useState<"case" | "arrest">("case");
	const [ownerId, setOwnerId] = useState<string>("");
	const [files, setFiles] = useState<File[]>([]);
	const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
	const [cases, setCases] = useState<CaseRecord[]>([]);
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);

	useEffect(() => {
		setEvidence(readStore("evidence", [] as EvidenceRecord[]));
		setCases(readStore("cases", [] as CaseRecord[]));
		setArrests(readStore("arrests", [] as ArrestRecord[]));
	}, []);

	async function upload() {
		if (!ownerId || files.length === 0) {
			toast.error("Select owner and files");
			return;
		}
		const next: EvidenceRecord[] = [];
		for (const f of files) {
			const isImage = f.type.startsWith("image/");
			const rec: EvidenceRecord = {
				id: `${Date.now()}-${f.name}`,
				ownerType,
				ownerId,
				filename: f.name,
				mimeType: f.type || "application/octet-stream",
				size: f.size,
				previewBase64: isImage ? await toBase64(f) : undefined,
				synced: false,
			};
			next.push(rec);
		}
		const all = [ ...next, ...evidence ];
		setEvidence(all);
		writeStore("evidence", all);
		setFiles([]);
		toast.success(`Uploaded ${next.length} file(s)`);
	}

	function remove(id: string) {
		const next = evidence.filter((e) => e.id !== id);
		setEvidence(next);
		writeStore("evidence", next);
	}

	const ownerOptions = ownerType === "case" ? cases.map((c) => ({ id: c.id, label: `${c.id} • ${c.crimeType}` })) : arrests.map((a) => ({ id: a.id, label: `${a.id} • ${a.suspectName}` }));

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold tracking-wider text-sky-300">Evidence</h1>
			<Card className="bg-white/5 border-white/10">
				<CardContent className="p-6 space-y-3">
					<div className="grid md:grid-cols-4 gap-3">
						<div>
							<div className="text-xs text-white/60 mb-1">Owner Type</div>
							<Select value={ownerType} onValueChange={(v) => setOwnerType(v as any)}>
								<SelectTrigger><SelectValue placeholder="Owner type" /></SelectTrigger>
								<SelectContent>
									<SelectItem value="case">Case</SelectItem>
									<SelectItem value="arrest">Arrest</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="md:col-span-2">
							<div className="text-xs text-white/60 mb-1">Owner</div>
							<Select value={ownerId} onValueChange={setOwnerId}>
								<SelectTrigger><SelectValue placeholder="Select case/arrest" /></SelectTrigger>
								<SelectContent>
									{ownerOptions.map((o) => (
										<SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<div className="text-xs text-white/60 mb-1">Files</div>
							<input multiple type="file" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
						</div>
					</div>
					<div>
						<Button onClick={upload}>Upload & Attach</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{evidence.map((ev) => (
					<Card key={ev.id} className="bg-white/5 border-white/10">
						<CardContent className="p-3 space-y-2">
							<div className="text-xs text-white/60">{ev.ownerType.toUpperCase()} • {ev.ownerId}</div>
							<div className="rounded-lg overflow-hidden border border-white/10 h-36 bg-black/20 grid place-items-center">
								{ev.previewBase64 ? (
									<img src={ev.previewBase64} alt={ev.filename} className="h-full w-full object-cover" />
								) : (
									<div className="text-xs text-white/60 px-2 text-center">{ev.filename} ({Math.round(ev.size/1024)} KB)</div>
								)}
							</div>
							<div className="flex items-center justify-between text-xs">
								<div className="text-white/70 truncate pr-2">{ev.filename}</div>
								<Button size="sm" variant="destructive" onClick={() => remove(ev.id)}>Delete</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}


