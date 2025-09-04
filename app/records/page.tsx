"use client";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ensureSeed } from "@/lib/seed";
import { readStore, CaseRecord, ArrestRecord, PatrolRecord } from "@/lib/storage";

type Row = {
	id: string;
	type: "Case" | "Arrest" | "Patrol";
	title: string;
	officer: string;
	date: string;
	status?: string;
};

export default function RecordsPage() {
	const [type, setType] = useState<string>("All");
	const [status, setStatus] = useState<string>("All");
	const [q, setQ] = useState("");
	const [rows, setRows] = useState<Row[]>([]);

	useEffect(() => {
		ensureSeed();
		const cases = readStore("cases", [] as CaseRecord[]);
		const arrests = readStore("arrests", [] as ArrestRecord[]);
		const patrols = readStore("patrols", [] as PatrolRecord[]);
		const combined: Row[] = [
			...cases.map((c) => ({ id: c.id, type: "Case" as const, title: `${c.crimeType}${c.suspect ? ` - ${c.suspect}` : ""}`, officer: c.officer, date: c.date, status: c.status })),
			...arrests.map((a) => ({ id: a.id, type: "Arrest" as const, title: `${a.crime} - ${a.suspectName}`, officer: a.assignedOfficer, date: a.date, status: a.status })),
			...patrols.map((p) => ({ id: p.id, type: "Patrol" as const, title: `${p.location}`, officer: p.officer, date: `${p.date} ${p.time}`, status: "—" })),
		];
		setRows(combined);
	}, []);

	const filtered = useMemo(() => {
		return rows.filter((r) => {
			if (type !== "All" && r.type !== (type as any)) return false;
			if (status !== "All" && r.status && r.status !== status) return false;
			if (q && !(r.title.toLowerCase().includes(q.toLowerCase()) || r.officer.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()))) return false;
			return true;
		});
	}, [rows, type, status, q]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-wider text-sky-300">Records</h1>
				<div className="flex gap-2">
					<Button asChild><Link href="/cases/new">New Case</Link></Button>
					<Button variant="secondary" asChild><Link href="/arrests/new">New Arrest</Link></Button>
					<Button variant="secondary" asChild><Link href="/patrols/new">Log Patrol</Link></Button>
				</div>
			</div>
			<div className="grid md:grid-cols-4 gap-3">
				<div>
					<div className="text-xs text-white/60 mb-1">Type</div>
					<Select value={type} onValueChange={setType}>
						<SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
						<SelectContent>
							{(["All","Case","Arrest","Patrol"]).map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
						</SelectContent>
					</Select>
				</div>
				<div>
					<div className="text-xs text-white/60 mb-1">Status</div>
					<Select value={status} onValueChange={setStatus}>
						<SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
						<SelectContent>
							{(["All","Open","Under Investigation","Transferred","Closed","In Custody","Released"]).map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
						</SelectContent>
					</Select>
				</div>
				<div className="md:col-span-2">
					<div className="text-xs text-white/60 mb-1">Keyword</div>
					<Input placeholder="Search by ID, title, officer" value={q} onChange={(e) => setQ(e.target.value)} />
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="text-white/60">
						<tr>
							<th className="text-left py-2 pr-4">ID</th>
							<th className="text-left py-2 pr-4">Type</th>
							<th className="text-left py-2 pr-4">Title</th>
							<th className="text-left py-2 pr-4">Officer</th>
							<th className="text-left py-2 pr-4">Date</th>
							<th className="text-left py-2 pr-4">Status</th>
							<th className="text-left py-2 pr-4">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((r) => (
							<tr key={`${r.type}-${r.id}`} className="border-t border-white/10">
								<td className="py-2 pr-4">{r.id}</td>
								<td className="py-2 pr-4">
									<Badge variant="secondary" className="bg-white/10">{r.type}</Badge>
								</td>
								<td className="py-2 pr-4">{r.title}</td>
								<td className="py-2 pr-4">{r.officer}</td>
								<td className="py-2 pr-4">{new Date(r.date).toLocaleString()}</td>
								<td className="py-2 pr-4">{r.status}</td>
								<td className="py-2 pr-4 flex gap-2">
									{r.type === "Case" && (
										<Button size="sm" variant="secondary" asChild><Link href={`/cases/${encodeURIComponent(r.id)}`}>View</Link></Button>
									)}
									{r.type === "Arrest" && (
										<Button size="sm" variant="secondary" asChild><Link href={`/arrests/edit?id=${encodeURIComponent(r.id)}`}>Edit</Link></Button>
									)}
									{r.type === "Patrol" && (
										<Button size="sm" variant="secondary" asChild><Link href={`/patrols/new`}>New</Link></Button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
