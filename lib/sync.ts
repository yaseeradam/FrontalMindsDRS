import { readStore, writeStore, type CaseRecord, type ArrestRecord, type PatrolRecord, type TransferRecord, type EvidenceRecord } from "@/lib/storage";

type StorageKey = "cases" | "arrests" | "patrols" | "transfers" | "evidence";

export function markAllSynced() {
	const keys: StorageKey[] = ["cases", "arrests", "patrols", "transfers", "evidence"];
	for (const key of keys) {
		const list = readStore(key, [] as CaseRecord[] | ArrestRecord[] | PatrolRecord[] | TransferRecord[] | EvidenceRecord[]);
		const next = list.map((r) => ({ ...r, synced: true }));
		writeStore(key, next);
	}
}


