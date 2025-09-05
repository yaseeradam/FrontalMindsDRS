"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PatrolRecord, readStore, writeStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";

export default function PatrolsPage() {
	const [patrols, setPatrols] = useState<PatrolRecord[]>([]);
	useEffect(() => {
		ensureSeed();
		setPatrols(readStore("patrols", [] as PatrolRecord[]));
	}, []);

	function remove(id: string) {
		const next = patrols.filter((p) => p.id !== id);
		setPatrols(next);
		writeStore("patrols", next);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-wider text-primary">Patrols</h1>
				<Button asChild><Link href="/patrols/new">Log Patrol</Link></Button>
			</div>
			{patrols.length === 0 ? (
				<div className="text-muted-foreground">No patrols yet. Log a patrol.</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="text-muted-foreground">
							<tr>
								<th className="text-left py-2 pr-4">Patrol ID</th>
								<th className="text-left py-2 pr-4">Location</th>
								<th className="text-left py-2 pr-4">Date</th>
								<th className="text-left py-2 pr-4">Time</th>
								<th className="text-left py-2 pr-4">Officer</th>
								<th className="text-left py-2 pr-4">Actions</th>
							</tr>
						</thead>
						<tbody>
							{patrols.map((p) => (
								<tr key={p.id} className="border-t border-border">
									<td className="py-2 pr-4">{p.id}</td>
									<td className="py-2 pr-4">{p.location}</td>
									<td className="py-2 pr-4">{p.date}</td>
									<td className="py-2 pr-4">{p.time}</td>
									<td className="py-2 pr-4">{p.officer}</td>
									<td className="py-2 pr-4 flex gap-2">
										<Button size="sm" variant="destructive" onClick={() => remove(p.id)}>Delete</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}


