"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FormCard } from "@/components/form-card";
import { Spinner } from "@/components/ui/spinner";
import { CaseRecord, generateId, readStore, toBase64, writeStore } from "@/lib/storage";
import { toast } from "sonner";

export default function CaseNewPage() {
	const [officer, setOfficer] = useState("");
	const [suspect, setSuspect] = useState("");
	const [crimeType, setCrimeType] = useState("Burglary");
	const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 16));
	const [status, setStatus] = useState("Open");
	const [description, setDescription] = useState("");
	const [photoBase64, setPhotoBase64] = useState<string | undefined>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function onSelectPhoto(file?: File) {
		if (!file) return setPhotoBase64(undefined);
		const b64 = await toBase64(file);
		setPhotoBase64(b64);
	}

	async function submit() {
		if (isSubmitting) return;
		
		setIsSubmitting(true);
		try {
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const id = generateId("CASE");
			const next: CaseRecord = {
				id,
				officer: officer || "Officer Adaeze Musa",
				suspect: suspect || undefined,
				crimeType,
				date: new Date(date).toISOString(),
				status,
				description: description || undefined,
				photoBase64,
				synced: false,
			};
			const existing = readStore("cases", [] as CaseRecord[]);
			const updated = [next, ...existing];
			writeStore("cases", updated);
			toast.success("Case created: " + id);
			window.location.href = "/cases";
		} catch (error) {
			toast.error("Failed to create case");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold tracking-wider text-sky-300">New Case</h1>
			<FormCard title="Case Details" description="Fill in the incident record. Fields marked * are required.">
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Case ID</Label>
						<div className="text-white/70 text-sm">Auto-generated on save (e.g. CASE/YYYY/#####)</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="officer">Reporting Officer *</Label>
						<Input id="officer" placeholder="Officer name" value={officer} onChange={(e) => setOfficer(e.target.value)} required />
					</div>
					<div className="space-y-2">
						<Label htmlFor="suspect">Suspect (optional)</Label>
						<Input id="suspect" placeholder="Suspect name" value={suspect} onChange={(e) => setSuspect(e.target.value)} />
					</div>
					<div className="space-y-2">
						<Label>Crime Type *</Label>
						<Select value={crimeType} onValueChange={setCrimeType}>
							<SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
							<SelectContent>
								{["Burglary","Theft","Assault","Traffic","Cybercrime","Other"].map((t) => (
									<SelectItem key={t} value={t}>{t}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="date">Date & Time *</Label>
						<Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
					</div>
					<div className="space-y-2">
						<Label>Status *</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
							<SelectContent>
								{["Open","Under Investigation","Transferred","Closed"].map((s) => (
									<SelectItem key={s} value={s}>{s}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="md:col-span-2 space-y-2">
						<Label htmlFor="desc">Description</Label>
						<Textarea id="desc" rows={5} placeholder="Narrative / incident details" value={description} onChange={(e) => setDescription(e.target.value)} />
					</div>
					<div className="md:col-span-2 space-y-2">
						<Label>Photo (optional)</Label>
						<input
							type="file"
							accept="image/*"
							onChange={async (e) => {
								const file = e.target.files?.[0];
								await onSelectPhoto(file);
							}}
						/>
						{photoBase64 ? (
							<Image src={photoBase64} alt="Preview" width={96} height={96} className="h-24 w-24 object-cover rounded-lg border border-border" />
						) : null}
					</div>
				</div>
				<div className="flex gap-3 pt-2">
					<Button onClick={submit} disabled={isSubmitting} className="flex items-center gap-2">
						{isSubmitting && <Spinner size="sm" />}
						{isSubmitting ? "Creating..." : "Submit"}
					</Button>
					<Button variant="secondary" onClick={() => window.history.back()} disabled={isSubmitting}>
						Cancel
					</Button>
				</div>
			</FormCard>
		</div>
	);
}


