export type CaseRecord = {
	id: string;
	officer: string;
	suspect?: string;
	crimeType: string;
	date: string;
	status: string;
	description?: string;
	photoBase64?: string;
	synced?: boolean;
};

export type ArrestRecord = {
	id: string;
	suspectName: string;
	crime: string;
	date: string;
	status: string;
	assignedOfficer: string;
	photoBase64: string; // required
	synced?: boolean;
};

export type PatrolRecord = {
	id: string;
	location: string;
	date: string;
	time: string;
	officer: string;
	notes?: string;
	synced?: boolean;
};

export type TransferRecord = {
	id: string;
	caseId: string;
	fromStation: string;
	toStation: string;
	date: string;
	officer: string;
	synced?: boolean;
};

export type EvidenceRecord = {
	id: string;
	ownerType: "case" | "arrest";
	ownerId: string;
	filename: string;
	previewBase64?: string; // set for images
	mimeType: string;
	size: number;
	synced?: boolean;
};

type StorageKey =
	| "cases"
	| "arrests"
	| "patrols"
	| "transfers"
	| "evidence"
	| "officer"
	| "activity_logs"
	| "current_user";

export function readStore<T>(key: StorageKey, fallback: T): T {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

export function writeStore<T>(key: StorageKey, value: T) {
	if (typeof window === "undefined") return;
	localStorage.setItem(key, JSON.stringify(value));
}

export function generateId(prefix: string) {
	const now = new Date();
	const yyyy = now.getFullYear();
	const seq = Math.floor(Math.random() * 90000 + 10000);
	return `${prefix}/${yyyy}/${seq}`;
}

export function toBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (e) => reject(e);
		reader.readAsDataURL(file);
	});
}


