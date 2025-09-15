"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { PatrolRecord, generateId, readStore, writeStore } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { toast } from "sonner";
import { Shield, MapPin, Clock, User, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";

const locations = [
	"Arewa-Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi",
	"Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba",
	"Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru", "Ajingi", "Albasu", "Bagwai",
	"Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa",
	"Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale",
	"Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi",
	"Kura", "Madobi", "Makoda", "Minjibir", "Rano", "Rimin Gado", "Rogo", "Shanono",
	"Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"
];

const patrolTypes = [
	"Routine Patrol", "Security Check", "Traffic Control", "Community Engagement",
	"Crime Prevention", "Emergency Response", "Event Security", "Special Assignment"
];

const officers = [
	"Officer Musa Garba", "Officer Fatima Bello", "Inspector Abubakar Sani", "Sergeant Umar Aliyu",
	"Officer Zainab Ibrahim", "Inspector Suleiman Ahmad", "Officer Hauwa Musa", "Sergeant Ibrahim Yusuf",
	"Officer Aisha Abdullahi", "Inspector Nasir Usman", "Sergeant Halima Zakari", "Officer Salisu Dauda"
];

export default function PatrolNewPage() {
	const router = useRouter();
	const [officer, setOfficer] = useState("Officer Musa Garba");
	const [location, setLocation] = useState("");
	const [patrolType, setPatrolType] = useState("Routine Patrol");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [date, setDate] = useState("");
	const [notes, setNotes] = useState("");
	const [incidents, setIncidents] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!date) {
			setDate(new Date().toISOString().slice(0, 10));
		}
		if (!startTime) {
			const now = new Date();
			setStartTime(now.toTimeString().slice(0, 5));
		}
	}, [date, startTime]);

	async function submit() {
		if (isSubmitting) return;
		
		if (!officer || !location || !date || !startTime) {
			toast.error("Please fill in all required fields");
			return;
		}
		
		setIsSubmitting(true);
		try {
			const id = generateId("PATROL");
			const newPatrol: PatrolRecord = {
				id,
				location,
				date,
				time: startTime + (endTime ? ` - ${endTime}` : ""),
				officer,
				notes: [notes, incidents].filter(Boolean).join("\n\n"),
				synced: false,
			};
			const existing = readStore("patrols", [] as PatrolRecord[]);
			const updated = [newPatrol, ...existing];
			writeStore("patrols", updated);
			
			// Log activity
			logActivity("patrol_create", `Patrol log ${id} created for ${location}`, {
				patrolId: id,
				location,
				patrolType,
				officer
			});
			
			toast.success(`Patrol log ${id} created successfully`);
			router.push("/patrols");
		} catch (error) {
			toast.error("Failed to create patrol log");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="space-y-6">
			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<BackButton href="/patrols" label="BACK TO PATROLS" />
						<div>
							<h1 className="text-2xl font-bold tracking-wider text-primary font-mono">NEW PATROL LOG</h1>
							<p className="text-sm text-muted-foreground font-mono mt-1">FIELD OPERATIONS DOCUMENTATION</p>
						</div>
					</div>
					<div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
						<Shield className="h-3 w-3 text-green-400" />
						<div className="text-xs font-mono text-green-400">ACTIVE PATROL</div>
					</div>
				</div>
			</div>

			<div className="bg-card border border-border rounded-xl p-6">
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
						<FileText className="h-5 w-5 text-green-400" />
					</div>
					<div>
						<h3 className="font-semibold text-foreground font-mono">PATROL INFORMATION</h3>
						<p className="text-xs text-muted-foreground font-mono">Complete all required fields marked with *</p>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								<Label className="font-mono text-xs tracking-wider">PATROL OFFICER *</Label>
							</div>
							<Select value={officer} onValueChange={setOfficer}>
								<SelectTrigger className="font-mono">
									<SelectValue placeholder="Select officer" />
								</SelectTrigger>
								<SelectContent>
									{officers.map((o) => (
										<SelectItem key={o} value={o} className="font-mono">{o.toUpperCase()}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<Label className="font-mono text-xs tracking-wider">PATROL LOCATION *</Label>
							</div>
							<Select value={location} onValueChange={setLocation}>
								<SelectTrigger className="font-mono">
									<SelectValue placeholder="Select patrol area" />
								</SelectTrigger>
								<SelectContent>
									{locations.map((loc) => (
										<SelectItem key={loc} value={loc} className="font-mono">{loc.toUpperCase()}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-muted-foreground" />
								<Label className="font-mono text-xs tracking-wider">PATROL TYPE</Label>
							</div>
							<Select value={patrolType} onValueChange={setPatrolType}>
								<SelectTrigger className="font-mono">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{patrolTypes.map((type) => (
										<SelectItem key={type} value={type} className="font-mono">{type.toUpperCase()}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Time Information */}
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<Label className="font-mono text-xs tracking-wider">PATROL DATE *</Label>
							</div>
							<Input 
								type="date" 
								value={date} 
								onChange={(e) => setDate(e.target.value)} 
								required 
								className="font-mono"
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<Label className="font-mono text-xs tracking-wider">START TIME *</Label>
							</div>
							<Input 
								type="time" 
								value={startTime} 
								onChange={(e) => setStartTime(e.target.value)} 
								required 
								className="font-mono"
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<Label className="font-mono text-xs tracking-wider">END TIME</Label>
							</div>
							<Input 
								type="time" 
								value={endTime} 
								onChange={(e) => setEndTime(e.target.value)} 
								className="font-mono"
							/>
						</div>
					</div>

					{/* Notes */}
					<div className="md:col-span-2 space-y-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<Label className="font-mono text-xs tracking-wider">PATROL NOTES</Label>
							</div>
							<Textarea 
								rows={4} 
								placeholder="Document patrol activities, observations, and general notes..."
								value={notes} 
								onChange={(e) => setNotes(e.target.value)} 
								className="font-mono text-sm"
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<Label className="font-mono text-xs tracking-wider">INCIDENTS & OBSERVATIONS</Label>
							</div>
							<Textarea 
								rows={4} 
								placeholder="Record any incidents, suspicious activities, or notable observations during patrol..."
								value={incidents} 
								onChange={(e) => setIncidents(e.target.value)} 
								className="font-mono text-sm"
							/>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3 pt-6 border-t border-border/50 mt-6">
					<Button 
						onClick={submit} 
						disabled={isSubmitting} 
						className="flex items-center gap-2 font-mono bg-green-500 hover:bg-green-600"
					>
						{isSubmitting ? "SUBMITTING..." : "SUBMIT PATROL LOG"}
					</Button>
					<Button 
						variant="outline" 
						onClick={() => router.push("/patrols")} 
						disabled={isSubmitting}
						className="font-mono border-red-500/30 text-red-700 hover:bg-red-500/10 dark:text-red-400"
					>
						CANCEL
					</Button>
					<Button 
						variant="ghost" 
						className="font-mono text-muted-foreground hover:text-foreground"
						onClick={() => {
							setOfficer("Officer Musa Garba");
							setLocation("");
							setPatrolType("Routine Patrol");
							setDate(new Date().toISOString().slice(0, 10));
							setStartTime(new Date().toTimeString().slice(0, 5));
							setEndTime("");
							setNotes("");
							setIncidents("");
						}}
					>
						RESET FORM
					</Button>
				</div>
			</div>
		</div>
	);
}


