"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrestRecord, readStore, writeStore } from "@/lib/storage";
import { ensureSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ArrestsPage() {
	const [arrests, setArrests] = useState<ArrestRecord[]>([]);
	const [preview, setPreview] = useState<string | undefined>();
	useEffect(() => {
		ensureSeed();
		setArrests(readStore("arrests", [] as ArrestRecord[]));
	}, []);

	function remove(id: string) {
		const next = arrests.filter((a) => a.id !== id);
		setArrests(next);
		writeStore("arrests", next);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-wider text-primary">Arrests</h1>
				<Button asChild><Link href="/arrests/new">New Arrest</Link></Button>
			</div>
			{arrests.length === 0 ? (
				<div className="text-muted-foreground">No arrests yet. Create a new arrest.</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="text-muted-foreground">
							<tr>
								<th className="text-left py-2 pr-4">Photo</th>
								<th className="text-left py-2 pr-4">Arrest ID</th>
								<th className="text-left py-2 pr-4">Suspect</th>
								<th className="text-left py-2 pr-4">Crime</th>
								<th className="text-left py-2 pr-4">Date</th>
								<th className="text-left py-2 pr-4">Status</th>
								<th className="text-left py-2 pr-4">Officer</th>
								<th className="text-left py-2 pr-4">Actions</th>
							</tr>
						</thead>
						<tbody>
							{arrests.map((a) => (
								<tr key={a.id} className="border-t border-border">
									<td className="py-2 pr-4">
										<Image onClick={() => setPreview(a.photoBase64)} src={a.photoBase64} alt="Suspect" width={40} height={40} className="h-10 w-10 rounded object-cover cursor-zoom-in border border-border" />
									</td>
									<td className="py-2 pr-4">{a.id}</td>
									<td className="py-2 pr-4">{a.suspectName}</td>
									<td className="py-2 pr-4">{a.crime}</td>
									<td className="py-2 pr-4">{new Date(a.date).toLocaleDateString()}</td>
									<td className="py-2 pr-4"><Badge variant="secondary">{a.status}</Badge></td>
									<td className="py-2 pr-4">{a.assignedOfficer}</td>
									<td className="py-2 pr-4 flex gap-2">
										<Button size="sm" variant="outline" asChild><Link href={`/arrests/edit?id=${encodeURIComponent(a.id)}`}>Edit</Link></Button>
										<Button size="sm" variant="destructive" onClick={() => remove(a.id)}>Delete</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<Dialog open={!!preview} onOpenChange={() => setPreview(undefined)}>
				<DialogContent className="max-w-lg">
					{preview ? <Image src={preview} alt="Preview" width={500} height={300} className="w-full rounded" /> : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}


