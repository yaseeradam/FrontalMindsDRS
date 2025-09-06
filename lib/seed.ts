"use client";

import { CaseRecord, ArrestRecord, PatrolRecord, readStore, writeStore, generateId } from "@/lib/storage";

// Nigerian suspect names for realistic demo data
const suspectNames = [
	"Emeka Okafor", "Fatima Ibrahim", "Kemi Adebayo", "Chinedu Okoro", "Aisha Mohammed",
	"Taiwo Adeyemi", "Ngozi Eze", "Babatunde Oluwaseun", "Halima Usman", "Chioma Nwosu",
	"Abdullahi Garba", "Funmi Adesanya", "Ikechukwu Anyanwu", "Zainab Aliyu", "Segun Ogundipe",
	"Blessing Okwu", "Musa Ibrahim", "Adunni Fagbemi", "Chukwuma Okoye", "Amina Hassan"
];

const locations = [
	"Victoria Island", "Ikoyi", "Lekki Phase 1", "Ikeja GRA", "Yaba", "Surulere", "Apapa",
	"Ilupeju", "Ojodu", "Maryland", "Gbagada", "Ketu", "Mile 2", "Festac Town", "Ajah",
	"Banana Island", "Magodo", "Ogba", "Oshodi", "Mushin"
];

const crimeTypes = [
	"Armed Robbery", "Burglary", "Theft", "Assault", "Drug Trafficking", "Cybercrime",
	"Fraud", "Kidnapping", "Traffic Violation", "Domestic Violence", "Money Laundering",
	"Vandalism", "Arson", "Smuggling", "Bribery", "Identity Theft"
];

const officers = [
	"Officer Adaeze Musa", "Officer John Okoye", "Inspector Sarah Akinola", "Sergeant Mike Okonkwo",
	"Officer Fatima Bello", "Inspector David Okoro", "Officer Grace Nnenna", "Sergeant Ahmed Yusuf",
	"Officer Chioma Eze", "Inspector Paul Adebayo"
];

const caseDescriptions = [
	"Suspect caught breaking into residential property with stolen electronics found in possession.",
	"Armed robbery at local bank, multiple witnesses identified suspect from CCTV footage.",
	"Domestic violence incident reported by neighbor, suspect detained on scene.",
	"Traffic violation escalated to assault when officer attempted to issue citation.",
	"Cybercrime investigation reveals elaborate online fraud scheme targeting elderly victims.",
	"Drug trafficking operation discovered during routine vehicle inspection at checkpoint.",
	"Identity theft case involving fraudulent use of government documents and credentials.",
	"Vandalism of public property caught on security cameras, suspect identified by witnesses.",
	"Money laundering scheme uncovered through suspicious bank transaction monitoring.",
	"Kidnapping incident resolved, suspect apprehended during ransom exchange operation."
];

const patrolNotes = [
	"Routine patrol completed without incidents. All businesses secured and traffic normal.",
	"Responded to noise complaint, issue resolved peacefully with verbal warning.",
	"Traffic checkpoint established, 3 violations cited, 1 vehicle impounded.",
	"Community engagement patrol, positive interactions with local residents and merchants.",
	"Security sweep of market area completed, suspicious individual questioned and released.",
	"Emergency response to medical incident, paramedics assisted until arrival.",
	"Investigation of reported theft, witness statements collected, case file opened.",
	"Public safety patrol during local event, crowd control measures implemented successfully.",
	"Anti-crime operation in high-risk area, 2 suspects detained for questioning.",
	"School safety patrol completed, students and staff reported feeling secure."
];

export function ensureSeed() {
	// Force regenerate with new realistic data (remove this condition to always regenerate)
	// Cases - Generate 15 realistic cases
	const cases = readStore<CaseRecord[]>("cases", []);
	if (!cases || cases.length < 15) {
		const seeded: CaseRecord[] = Array.from({ length: 15 }).map((_, i) => ({
			id: generateId("CASE"),
			officer: officers[i % officers.length],
			suspect: i % 4 === 0 ? "Unknown" : suspectNames[i % suspectNames.length],
			crimeType: crimeTypes[i % crimeTypes.length],
			date: new Date(Date.now() - (i * 86400000) - Math.random() * 86400000).toISOString(),
			status: ["Open", "Under Investigation", "Under Investigation", "Closed", "Pending Review"][i % 5],
			description: caseDescriptions[i % caseDescriptions.length],
			photoBase64: i % 3 === 0 ? "/BG.png" : undefined, // Use BG.png for some cases
			synced: Math.random() > 0.7, // Some cases are synced
		}));
		writeStore("cases", seeded);
	}

	// Arrests - Generate 12 realistic arrests
	const arrests = readStore<ArrestRecord[]>("arrests", []);
	if (!arrests || arrests.length < 12) {
		const seeded: ArrestRecord[] = Array.from({ length: 12 }).map((_, i) => ({
			id: generateId("ARREST"),
			suspectName: suspectNames[i % suspectNames.length],
			crime: crimeTypes[i % crimeTypes.length],
			date: new Date(Date.now() - (i * 43200000) - Math.random() * 43200000).toISOString(),
			status: ["In Custody", "In Custody", "Released", "Transferred", "Bailed"][i % 5],
			assignedOfficer: officers[i % officers.length],
			photoBase64: "/BG.png", // Use BG.png as suspect photo for all arrests
			synced: Math.random() > 0.6,
		}));
		writeStore("arrests", seeded);
	}

	// Patrols - Generate 18 patrol logs
	const patrols = readStore<PatrolRecord[]>("patrols", []);
	if (!patrols || patrols.length < 18) {
		const seeded: PatrolRecord[] = Array.from({ length: 18 }).map((_, i) => {
			const date = new Date(Date.now() - (i * 21600000) - Math.random() * 21600000);
			return {
				id: generateId("PATROL"),
				location: locations[i % locations.length],
				date: date.toISOString().slice(0, 10),
				time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
				officer: officers[i % officers.length],
				notes: patrolNotes[i % patrolNotes.length],
				synced: Math.random() > 0.5,
			};
		});
		writeStore("patrols", seeded);
	}
}

// Function to clear all data and regenerate fresh sample data
export function resetAndRegenerateData() {
	// Clear existing data
	if (typeof window !== 'undefined') {
		localStorage.removeItem('braniacs-drs-cases');
		localStorage.removeItem('braniacs-drs-arrests');
		localStorage.removeItem('braniacs-drs-patrols');
	}
	
	// Force regeneration
	ensureSeed();
}


