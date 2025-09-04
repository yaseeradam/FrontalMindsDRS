import { readStore, writeStore } from "@/lib/storage";

export function markAllSynced() {
	const keys = ["cases", "arrests", "patrols", "transfers", "evidence"] as const;
	for (const key of keys) {
		const list = readStore<any[]>(key as any, []);
		const next = list.map((r) => ({ ...r, synced: true }));
		writeStore(key as any, next);
	}
}


