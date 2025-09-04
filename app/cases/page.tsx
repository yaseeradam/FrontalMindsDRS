"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CaseRecord, readStore, writeStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";

export default function CasesPage() {
	const [cases, setCases] = useState<CaseRecord[]>([]);
	useEffect(() => {
		ensureSeed();
		setCases(readStore("cases", [] as CaseRecord[]));
	}, []);

	function remove(id: string) {
		const next = cases.filter((c) => c.id !== id);
		setCases(next);
		writeStore("cases", next);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-wider text-sky-300">Cases</h1>
				<Button asChild><Link href="/cases/new">New Case</Link></Button>
			</div>
			<div className="grid gap-3">
				{cases.length === 0 ? (
					<div className="text-white/60">No cases yet. Create a new case.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="text-white/60">
								<tr>
									<th className="text-left py-2 pr-4">Case ID</th>
									<th className="text-left py-2 pr-4">Officer</th>
									<th className="text-left py-2 pr-4">Crime</th>
									<th className="text-left py-2 pr-4">Date</th>
									<th className="text-left py-2 pr-4">Status</th>
									<th className="text-left py-2 pr-4">Actions</th>
								</tr>
							</thead>
							<tbody>
								{cases.map((c) => (
									<tr key={c.id} className="border-t border-white/10">
										<td className="py-2 pr-4">{c.id}</td>
										<td className="py-2 pr-4">{c.officer}</td>
										<td className="py-2 pr-4">{c.crimeType}</td>
										<td className="py-2 pr-4">{new Date(c.date).toLocaleDateString()}</td>
										<td className="py-2 pr-4"><Badge variant="secondary" className="bg-white/10">{c.status}</Badge></td>
										<td className="py-2 pr-4 flex gap-2">
											<Button size="sm" variant="secondary" asChild><Link href={`/cases/${encodeURIComponent(c.id)}`}>View</Link></Button>
											<Button size="sm" variant="outline" asChild><Link href={`/cases/edit?id=${encodeURIComponent(c.id)}`}>Edit</Link></Button>
											<Button size="sm" variant="destructive" onClick={() => remove(c.id)}>Delete</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}


