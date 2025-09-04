"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CaseRecord, readStore, writeStore } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

	if (!record) {
		return <div className="text-white/70">Case not found.</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-wider text-sky-300">{record.id}</h1>
				<div className="flex gap-2">
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
					<div className="rounded-2xl border border-white/10 p-4 bg-white/5">
						<div className="text-white/60 text-sm mb-2">Photo</div>
						{record.photoBase64 ? (
							<img src={record.photoBase64} alt="Case" className="w-full rounded-lg border border-white/10" />
						) : (
							<div className="text-white/60 text-sm">No photo attached.</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}


