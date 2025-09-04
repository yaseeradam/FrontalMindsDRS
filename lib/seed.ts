"use client";

import { CaseRecord, ArrestRecord, PatrolRecord, readStore, writeStore, generateId } from "@/lib/storage";

const tinyImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAv8B9m7x8r8AAAAASUVORK5CYII=";

export function ensureSeed() {
	// Cases
	const cases = readStore<CaseRecord[]>("cases", []);
	if (!cases || cases.length < 5) {
		const seeded: CaseRecord[] = Array.from({ length: 5 }).map((_, i) => ({
			id: generateId("CASE"),
			officer: i % 2 ? "Officer Adaeze Musa" : "Officer John Okoye",
			suspect: i % 3 === 0 ? "Unknown" : `Suspect ${i + 1}`,
			crimeType: ["Burglary", "Theft", "Assault", "Traffic", "Cybercrime"][i % 5],
			date: new Date(Date.now() - i * 86400000).toISOString(),
			status: ["Open", "Under Investigation", "Closed"][i % 3],
			description: "Seeded case for demo.",
			photoBase64: i % 2 === 0 ? tinyImg : undefined,
			synced: false,
		}));
		writeStore("cases", seeded);
	}

	// Arrests
	const arrests = readStore<ArrestRecord[]>("arrests", []);
	if (!arrests || arrests.length < 5) {
		const seeded: ArrestRecord[] = Array.from({ length: 5 }).map((_, i) => ({
			id: generateId("ARREST"),
			suspectName: `Suspect ${i + 1}`,
			crime: ["Theft", "Assault", "Burglary", "Traffic", "Cybercrime"][i % 5],
			date: new Date(Date.now() - i * 43200000).toISOString(),
			status: ["In Custody", "Released", "Transferred"][i % 3],
			assignedOfficer: i % 2 ? "Officer Adaeze Musa" : "Officer John Okoye",
			photoBase64: tinyImg,
			synced: false,
		}));
		writeStore("arrests", seeded);
	}

	// Patrols
	const patrols = readStore<PatrolRecord[]>("patrols", []);
	if (!patrols || patrols.length < 5) {
		const seeded: PatrolRecord[] = Array.from({ length: 5 }).map((_, i) => ({
			id: generateId("PATROL"),
			location: ["Ilupeju", "Ikeja", "Yaba", "Lekki", "Victoria Island"][i % 5],
			date: new Date(Date.now() - i * 21600000).toISOString().slice(0, 10),
			time: new Date().toISOString().slice(11, 16),
			officer: i % 2 ? "Officer Adaeze Musa" : "Officer John Okoye",
			notes: "Seeded patrol log.",
			synced: false,
		}));
		writeStore("patrols", seeded);
	}
}


